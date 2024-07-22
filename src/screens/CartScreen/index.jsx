import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import Layout from 'components/common/Layout';
import InputWithButton from 'components/common/InputWithButton';
import colors from 'constants/colors';
import { useDispatch, useSelector } from 'react-redux';
import { specialInstructions, applyDiscount, removeDiscount } from 'redux/slices/cartSlice';
import firestore from '@react-native-firebase/firestore';
import LineItem from './components/LineItem';
import BillSummary from './components/BillSummary';
import DiscountPopup from './components/DiscountPopup';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [instructions, setInstructions] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [discountError, setDiscountError] = useState(null);
  const [additionalAmountNeeded, setAdditionalAmountNeeded] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const cart = useSelector(state => state.cart);
  const restaurantId = useSelector(state => state.restaurants.currentRestaurant.id);
  const userOrderCount = useSelector(state => state.authentication.customer.orderCount);
  const appliedDiscount = useSelector(state => state.cart.discountCode);

  const validateDiscountCode = async (code, autoApply = false) => {
    try {
      setIsLoading(true);
      const discountCodesSnapshot = await firestore()
        .collection('discountCodes')
        .where('code', '==', code)
        .get();

      if (discountCodesSnapshot.empty) {
        throw new Error('Discount code is not valid');
      }

      const discount = discountCodesSnapshot.docs[0].data();
      const { restaurants, userRestrictions, minimumBillAmount, amount, percentage, expiryDate } = discount;

      const fetchRestaurantRefs = async restaurantRefs => {
        if (!restaurantRefs || restaurantRefs.length === 0) return true;
        const restaurantIds = await Promise.all(
          restaurantRefs.map(async ref => {
            const restaurantDoc = await ref.get();
            return restaurantDoc.id;
          }),
        );
        return restaurantIds.includes(restaurantId);
      };

      const applicableForRestaurant = await fetchRestaurantRefs(restaurants);
      const applicableForUser =
        !userRestrictions ||
        !userRestrictions.firstTimeOnly ||
        userRestrictions.maxUsagePerUser === 0 ||
        userRestrictions.maxUsagePerUser == null ||
        userOrderCount < userRestrictions.maxUsagePerUser;
      const isMinimumAmountMet = !minimumBillAmount || cart.subTotal >= minimumBillAmount;

      const now = new Date();
      const isExpired = expiryDate && expiryDate.toDate().setHours(23, 59, 59, 999) < now;

      if (isExpired) {
        setDiscountError('Discount code is expired');
        setAdditionalAmountNeeded(null);
        return;
      }

      if (!applicableForRestaurant || !applicableForUser || !isMinimumAmountMet) {
        if (!isMinimumAmountMet && minimumBillAmount) {
          setAdditionalAmountNeeded(minimumBillAmount - cart.subTotal);
          if (!autoApply) setDiscountError(null);
        } else {
          if (!autoApply) setDiscountError('Discount code is not applicable');
          setAdditionalAmountNeeded(null);
        }
        return;
      }

      let discountAmount = 0;

      if (amount) {
        discountAmount = amount;
      } else if (percentage) {
        discountAmount = (cart.subTotal * percentage) / 100;
      }

      dispatch(
        applyDiscount({
          discountAmount,
          discountCode: code,
          discountDescription: discount.description,
        }),
      );
      setDiscountError(null);
      setDiscountCode('');
      setAdditionalAmountNeeded(null);
    } catch (error) {
      if (!autoApply) setDiscountError(error.message);
      setAdditionalAmountNeeded(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = () => {
    validateDiscountCode(discountCode);
  };

  const saveCartDetails = () => {
    if (instructions) dispatch(specialInstructions(instructions));
    navigation.navigate('LockerScreen');
  };

  const handleRemoveDiscount = () => {
    dispatch(removeDiscount());
  };

  useEffect(() => {
    const checkMinimumBillAmount = async () => {
      if (appliedDiscount) {
        const discountCodesSnapshot = await firestore()
          .collection('discountCodes')
          .where('code', '==', appliedDiscount)
          .get();

        if (!discountCodesSnapshot.empty) {
          const discount = discountCodesSnapshot.docs[0].data();
          const { minimumBillAmount } = discount;

          if (minimumBillAmount && cart.subTotal < minimumBillAmount) {
            dispatch(removeDiscount());
            setAdditionalAmountNeeded(minimumBillAmount - cart.subTotal);
          } else if (minimumBillAmount && cart.subTotal >= minimumBillAmount) {
            validateDiscountCode(appliedDiscount, true);
          } else {
            setAdditionalAmountNeeded(null);
          }
        }
      }
    };

    checkMinimumBillAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.subTotal, appliedDiscount, dispatch]);

  return (
    <Layout
      navigation={navigation}
      backTitle="My Cart"
      bottomBar
      rightButton
      btnText="Choose Pickup Point"
      next
      price={cart.total.toString()}
      onBtnPress={() => saveCartDetails()}
    >
      {cart.items.length !== 0 ? (
        <ScrollView>
          <View>
            <Text style={styles.title}>Order Summary</Text>
            <View style={styles.itemsContainer}>
              {cart.items.map(item => (
                <LineItem key={item.cartItemId} data={item} />
              ))}
            </View>
          </View>
          <BillSummary cart={cart} />

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
              placeholder="Enter Code"
              onChangeText={text => setDiscountCode(text)}
              value={discountCode}
              buttonText="Apply"
              handleValidate={handleValidate}
              buttonDisabled={!discountCode}
            />
            <TouchableOpacity onPress={() => setPopupVisible(true)} style={styles.button}>
              <Text style={styles.buttonText}>Browse Available Discounts</Text>
            </TouchableOpacity>
          </View>
          <DiscountPopup isVisible={isPopupVisible} onClose={() => setPopupVisible(false)} />

          <Text style={styles.title}>Extra instructions</Text>
          <View>
            <TextInput
              placeholder="Write your special instructions to the chef.."
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              style={styles.input}
              onSubmitEditing={() => Keyboard.dismiss()}
              returnKeyType="done"
              multiline
              onChangeText={text => setInstructions(text)}
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
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    marginVertical: 12,
  },
  itemsContainer: {
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 20,
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
    marginTop: 10,
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
});
