import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image, Keyboard, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Layout from 'common/Layout'
import InputWithButton from 'common/InputWithButton'
import colors from 'constants/colors'
import DiscountPopup from './DiscountPopup'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeFromCart, specialInstructions, applyDiscount, removeDiscount } from 'slices/cartSlice'
import firestore from '@react-native-firebase/firestore'

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const [instructions, setInstructions] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [isPopupVisible, setPopupVisible] = useState(false)
  const [discountError, setDiscountError] = useState(null)
  const [additionalAmountNeeded, setAdditionalAmountNeeded] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const cart = useSelector(state => state.cart)
  const restaurantId = useSelector(state => state.restaurants.currentRestaurant.id)
  const userOrderCount = useSelector(state => state.authentication.customer.orderCount)
  const appliedDiscount = useSelector(state => state.cart.discountCode)

  const validateDiscountCode = async (code, autoApply = false) => {
    try {
      setIsLoading(true)
      const discountCodesSnapshot = await firestore().collection('discountCodes').where('code', '==', code).get()

      if (discountCodesSnapshot.empty) {
        throw new Error('Discount code is not valid')
      }

      const discount = discountCodesSnapshot.docs[0].data()
      const { restaurants, userRestrictions, minimumBillAmount, amount, percentage, expiryDate } = discount

      const fetchRestaurantRefs = async (restaurants) => {
        if (!restaurants || restaurants.length === 0) return true
        const restaurantIds = await Promise.all(
          restaurants.map(async (ref) => {
            const restaurantDoc = await ref.get()
            return restaurantDoc.id
          })
        )
        return restaurantIds.includes(restaurantId)
      }

      const applicableForRestaurant = await fetchRestaurantRefs(restaurants)
      const applicableForUser = !userRestrictions || (
        !userRestrictions.firstTimeOnly ||
        (userRestrictions.maxUsagePerUser === 0 || userRestrictions.maxUsagePerUser == null) ||
        (userOrderCount < userRestrictions.maxUsagePerUser)
      )
      const isMinimumAmountMet = !minimumBillAmount || cart.subTotal >= minimumBillAmount

      const now = new Date()
      const isExpired = expiryDate && expiryDate.toDate().setHours(23, 59, 59, 999) < now

      if (isExpired) {
        setDiscountError('Discount code is expired')
        setAdditionalAmountNeeded(null)
        return
      }

      if (!applicableForRestaurant || !applicableForUser || !isMinimumAmountMet) {
        if (!isMinimumAmountMet && minimumBillAmount) {
          setAdditionalAmountNeeded(minimumBillAmount - cart.subTotal)
          if (!autoApply) setDiscountError(null)
        } else {
          if (!autoApply) setDiscountError('Discount code is not applicable')
          setAdditionalAmountNeeded(null)
        }
        return
      }

      let discountAmount = 0

      if (amount) {
        discountAmount = amount
      } else if (percentage) {
        discountAmount = (cart.subTotal * percentage) / 100
      }

      dispatch(applyDiscount({
        discountAmount,
        discountCode: code,
        discountDescription: discount.description
      }))
      setDiscountError(null)
      setDiscountCode('')
      setAdditionalAmountNeeded(null)
    } catch (error) {
      if (!autoApply) setDiscountError(error.message)
      setAdditionalAmountNeeded(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidate = () => {
    validateDiscountCode(discountCode)
  }

  const saveCartDetails = () => {
    if (instructions) dispatch(specialInstructions(instructions))
    navigation.navigate('LockerScreen')
  }

  const handleRemoveDiscount = () => {
    dispatch(removeDiscount())
  }

  useEffect(() => {
    const checkMinimumBillAmount = async () => {
      if (appliedDiscount) {
        const discountCodesSnapshot = await firestore().collection('discountCodes').where('code', '==', appliedDiscount).get()

        if (!discountCodesSnapshot.empty) {
          const discount = discountCodesSnapshot.docs[0].data()
          const { minimumBillAmount } = discount

          if (minimumBillAmount && cart.subTotal < minimumBillAmount) {
            dispatch(removeDiscount())
            setAdditionalAmountNeeded(minimumBillAmount - cart.subTotal)
          } else if (minimumBillAmount && cart.subTotal >= minimumBillAmount) {
            validateDiscountCode(appliedDiscount, true)
          } else {
            setAdditionalAmountNeeded(null)
          }
        }
      }
    }

    checkMinimumBillAmount()
  }, [cart.subTotal, appliedDiscount, dispatch])

  const LineItem = ({ data }) => {
    const count = useSelector(state => state.cart.items.find(item => item.cartItemId === data.cartItemId)?.quantity || 0)

    const customisationNames = data.customisations
      .filter(cust => !cust.multiOption)
      .flatMap(cust => cust.choices.map(choice => choice.name))
      .join(' ~ ')

    const Counter = () => {
      const handleIncrement = () => {
        dispatch(addToCart({ ...data, quantity: 1 }))
      }

      const handleDecrement = () => {
        dispatch(removeFromCart({ cartItemId: data.cartItemId, quantity: 1 }))
      }

      return (
        <View style={styles.counterContainer}>
          <TouchableOpacity onPress={handleDecrement} hitSlop={{ top: 25, bottom: 25, left: 15, right: 15 }}>
            <Image source={require('images/minus.png')} style={styles.counterIcon} />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{count}</Text>
          <TouchableOpacity onPress={handleIncrement} hitSlop={{ top: 25, bottom: 25, left: 15, right: 15 }}>
            <Image source={require('images/plus.png')} style={styles.counterIcon} />
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.lineItem}>
        <View style={styles.itemWrap}>
          <Text style={styles.itemName}>{data.name}  <Text style={styles.price}>₹{data.price}</Text></Text>
          {customisationNames &&<Text style={styles.customisationNames}>{customisationNames}</Text>}
        </View>
        <Counter />
      </View>
    )
  }

  const BillSummary = () => (
    <View style={styles.itemsContainer}>
      <View style={styles.row}>
        <Text style={styles.description}>Item(s) total</Text>
        <Text style={styles.amount}>₹{cart.subTotal}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.description}>GST</Text>
        <Text style={styles.amount}>₹{cart.tax}</Text>
      </View>
      {cart.discount > 0 && (
        <View style={styles.row}>
          <Text style={styles.description}>Discount</Text>
          <Text style={styles.amount}>-₹{cart.discount}</Text>
        </View>
      )}
      <View style={styles.totalRow}>
        <Text style={styles.description}>Total</Text>
        <Text style={[styles.amount]}>₹{cart.total}</Text>
      </View>
    </View>
  )

  return (
    <Layout
      navigation={navigation}
      backTitle='My Cart'
      bottomBar
      rightButton
      btnText='Choose Pickup Point'
      next
      price={cart.total.toString()}
      onBtnPress={() => saveCartDetails()}
    >
      {cart.items.length !== 0 ? (
        <ScrollView>
          <View>
            <Text style={styles.title}>Order Summary</Text>
            <View style={styles.itemsContainer}>
              {cart.items.map(item => <LineItem key={item.cartItemId} data={item} />)}
            </View>
          </View>
          <BillSummary />

          <Text style={styles.title}>Discount code</Text>
          <View style={styles.discountContainer}>
            {cart.discountCode && (
              <View style={styles.appliedDiscountContainer}>
                <Text style={styles.appliedDiscountText}>Applied Discount: {cart.discountDescription}</Text>
                <TouchableOpacity onPress={handleRemoveDiscount} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
            {additionalAmountNeeded ? (
              <Text style={styles.errorText}>
                You need to add ₹{additionalAmountNeeded.toFixed(2)} to apply this discount code.
              </Text>
            ) : (
              discountError && <Text style={styles.errorText}>{discountError}</Text>
            )}
            <InputWithButton
              placeholder='Enter Code'
              onChangeText={(text) => setDiscountCode(text)}
              value={discountCode}
              buttonText='Apply'
              handleValidate={handleValidate}
              buttonDisabled={!discountCode}
            />
            <TouchableOpacity onPress={() => setPopupVisible(true)} style={[styles.button, { marginTop: 10 }]}>
              <Text style={styles.buttonText}>Browse Available Discounts</Text>
            </TouchableOpacity>
          </View>
          <DiscountPopup isVisible={isPopupVisible} onClose={() => setPopupVisible(false)} />

          <Text style={styles.title}>Extra instructions</Text>
          <View>
            <TextInput
              placeholder='Write your special instructions to the chef..'
              placeholderTextColor={'rgba(0, 0, 0, 0.3)'}
              style={styles.input}
              onSubmitEditing={() => Keyboard.dismiss()}
              returnKeyType='done'
              multiline
              onChangeText={(text) => setInstructions(text)}
              value={instructions}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
        </View>
      )}
      {isLoading && (
        <View style={styles.overlayStyle}>
          <ActivityIndicator size="large" color={colors.theme} />
        </View>
      )}
    </Layout>
  )
}

export default CartScreen

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    marginVertical: 12,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 24,
    marginHorizontal: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  itemName: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  customisationNames: {
    fontSize: 14,
    color: 'gray',
    fontWeight: '600',
  },
  price: {
    color: colors.theme,
    fontSize: 14,
    fontWeight: '500',
  },
  itemsContainer: {
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    paddingVertical: 8,
    borderTopColor: colors.border,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: '#737373',
    width: '90%',
    textAlign: 'right',
  },
  amount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.theme,
    width: '12%',
    textAlign: 'left',
  },
  discountContainer: {
    borderRadius: 10,
    borderColor: colors.border,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
  },
  button: {
    marginHorizontal: 10,
    backgroundColor: colors.themeLight,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.theme,
    fontSize: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 10,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 10,
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    marginHorizontal: 20,
    marginTop: 10,
  },
  appliedDiscountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
    backgroundColor: colors.lightGray,
    padding: 10,
    borderRadius: 6,
  },
  appliedDiscountText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.theme,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'white',
  },
  removeButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  counterContainer: {
    backgroundColor: colors.themeLight,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    gap: 4,
  },
  counterIcon: {
    width: 14,
    height: 14,
  },
  counterValue: {
    fontSize: 12,
    backgroundColor: 'white',
    color: 'black',
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginHorizontal: 6,
    borderRadius: 4,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 22,
    color: 'gray',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  overlayStyle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.5)', 
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
})
