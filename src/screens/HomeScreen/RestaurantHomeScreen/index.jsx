import {
  StyleSheet, TouchableOpacity, View, Text, Image, SectionList, ActivityIndicator, Modal, ScrollView, Button
} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { GlobalStyles } from 'constants/GlobalStyles'
import Layout from 'common/Layout'
import SearchBar from 'common/SearchBar'
import Add from 'common/Add'
import colors from 'constants/colors'
import { useSelector, useDispatch } from 'react-redux'
import firestore from '@react-native-firebase/firestore'
import { addToCart, removeFromCart, setRestaurantId } from 'slices/cartSlice'
import CustomButton from 'common/CustomButton'
import { createSelector } from 'reselect'

const checkAvailability = ({ from, until, isAvailable }, selectedTime) => {
  if (!isAvailable) return false
  const selectedTimeDate = parseTime(selectedTime)
  const startTime = parseTime(from)
  const endTime = parseTime(until)
  return selectedTimeDate && startTime && endTime && (selectedTimeDate >= startTime && selectedTimeDate <= endTime)
}

const parseTime = (timeStr) => {
  if (!timeStr) {
    console.log("parseTime called with undefined or null argument")
    return null
  }
  const [hours, minutes] = timeStr.split(':').map(Number)
  const time = new Date()
  time.setHours(hours, minutes)
  return time
}

const generateSubtitle = (required, multiOption, limit) => {
  if (required) {
    if (multiOption && limit > 1) {
      return `Required *Select up to ${limit} options`
    } else {
      return `Required *Select any 1 option`
    }
  } else {
    return `Select any ${limit} option`
  }
}

const addItem = (item, customisations, dispatch, openModal) => {
  if (item.customisations && item.customisations.length > 0) {
    openModal(item, customisations)
  } else {
    dispatch(addToCart({
      name: item.name,
      itemId: item.id,
      quantity: 1,
      price: item.price,
      temperature: item.temperature,
      thumbnailUrl: item.thumbnailUrl,
      customisations: []
    }))
  }
}

const removeItem = (cartItemId, dispatch) => {
  dispatch(removeFromCart({ cartItemId }))
}

const selectItemQuantity = createSelector(
  state => state.cart.items,
  (state, data) => data.id,
  (items, itemId) => {
    const filteredItems = items.filter(item => item.itemId === itemId)
    return filteredItems.reduce((sum, item) => sum + item.quantity, 0)
  }
)

const FoodItem = ({ data, dispatch, openModal }) => {
  const count = useSelector(state => selectItemQuantity(state, data))
  const cartItems = useSelector(state => state.cart.items.filter(item => item.itemId === data.id))

  const Counter = () => {
    const customisations = useSelector(state => state.cart.items.find(item => item.itemId === data.id)?.customisations || [])

    const handleIncrement = () => {
      addItem(data, customisations, dispatch, openModal)
    }
    const handleDecrement = () => {
      if (cartItems.length > 0) {
        const lastAddedItem = cartItems[cartItems.length - 1]
        removeItem(lastAddedItem.cartItemId, dispatch)
      }
    }

    return (
      <View style={styles.counterContainer}>
        <TouchableOpacity onPress={handleDecrement} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Image source={require('images/minus.png')} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.value}>{count}</Text>
        <TouchableOpacity onPress={handleIncrement} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Image source={require('images/plus.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.foodItemContainer, GlobalStyles.lightBorder]}>
      <View style={styles.itemWrap}>
        {data.thumbnailUrl && <Image style={styles.thumbnail} source={{ uri: data.thumbnailUrl }} />}
        <View style={styles.itemInfo}>
          <Text style={styles.title}>{data.name}</Text>
          <Text style={styles.price}>₹{data.price}</Text>
        </View>
      </View>
      <View>
        {count === 0 ? <Add onPress={() => addItem(data, [], dispatch, openModal)} /> : <Counter />}
      </View>
    </View>
  )
}

const createOrUpdateCart = async (cartState, customerId, restaurantId) => {
  try {
    const cartRef = firestore().collection('carts').doc(customerId)
    await cartRef.set({
      ...cartState, 
      customerId, 
      restaurantId, 
      orderComplete: false
    }, { merge: true })
    console.log('Cart successfully created or updated')
  } catch (error) {
    console.log('Error creating or updating cart: ', error)
  }
}

const RestaurantHomeScreen = ({ navigation, route }) => {
  const restaurant = useSelector(state => state.restaurants.currentRestaurant)
  const customerId = useSelector(state => state.authentication.customer.id)
  const restaurantId = route.params.restaurantId
  const { selectedTimeSlot } = useSelector(state => state.restaurants)
  const cart = useSelector(state => state.cart)
  const dispatch = useDispatch()
  const [availableItems, setAvailableItems] = useState([])
  const [unavailableItems, setUnavailableItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredAvailableItems, setFilteredAvailableItems] = useState([])
  const [filteredUnavailableItems, setFilteredUnavailableItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const sectionListRef = useRef(null)
  const [menuModalVisible, setMenuModalVisible] = useState(false)
  const [addItemModalVisible, setAddItemModalVisible] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedCustomisations, setSelectedCustomisations] = useState({})
  const [lastUsedCustomisations, setLastUsedCustomisations] = useState({})
  const [isUsingLastCustomizations, setIsUsingLastCustomizations] = useState(false)

  useEffect(() => {
    dispatch(setRestaurantId(restaurantId))
  }, [dispatch, restaurantId])

  useEffect(() => {
    setIsLoading(true)
    const fetchMenu = async () => {
      try {
        const menuSnapshot = await firestore()
          .collection('restaurants')
          .doc(restaurantId)
          .collection('menu')
          .get()

        let categoriesMap = {}
        let tempUnavailableItems = []

        const menuPromises = menuSnapshot.docs.map(async (doc) => {
          const data = doc.data()
          const availability = data.availability || {}
          const isAvailable = checkAvailability(availability, selectedTimeSlot)

          if (!isAvailable) {
            tempUnavailableItems.push({ ...data, id: doc.id, availability })
          } else {
            return Promise.all(data.categories.map(async (categoryRef) => {
              const categoryDoc = await categoryRef.get()
              if (categoryDoc.exists) {
                const categoryName = categoryDoc.data().name
                if (!categoriesMap[categoryName]) {
                  categoriesMap[categoryName] = {
                    title: categoryName,
                    data: [],
                    key: categoryName,
                  }
                }
                categoriesMap[categoryName].data.push({
                  ...data,
                  id: doc.id,
                })
                return categoryName
              }
              return 'Unknown Category'
            }))
          }
        })

        await Promise.all(menuPromises)

        const sortedCategories = Object.values(categoriesMap)
        if (sortedCategories.some(cat => cat.key === "Recommended")) {
          const recommendedCategory = sortedCategories.find(cat => cat.key === "Recommended")
          sortedCategories.splice(sortedCategories.indexOf(recommendedCategory), 1)
          sortedCategories.unshift(recommendedCategory)
        }

        setAvailableItems(sortedCategories)
        setUnavailableItems(tempUnavailableItems.sort((a, b) => parseTime(a.availability.from) - parseTime(b.availability.from)))
      } catch (e) {
        console.log(e.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenu()
  }, [restaurant, selectedTimeSlot])

  useEffect(() => {
    if (searchQuery) {
      const filteredAvailable = availableItems.map(category => ({
        ...category,
        data: category.data.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
      })).filter(category => category.data.length > 0)

      const filteredUnavailable = unavailableItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

      setFilteredAvailableItems(filteredAvailable)
      setFilteredUnavailableItems(filteredUnavailable)
    } else {
      setFilteredAvailableItems(availableItems)
      setFilteredUnavailableItems(unavailableItems)
    }
  }, [searchQuery, availableItems, unavailableItems])

  useEffect(() => {
    const filteredAvailable = availableItems.map(category => ({
      ...category,
      data: category.data.filter(item => selectedFilters.length === 0 || selectedFilters.some(filter => item.type.includes(filter))),
    })).filter(category => category.data.length > 0)

    setFilteredAvailableItems(filteredAvailable)
  }, [selectedFilters, availableItems])

  const scrollToCategory = (categoryKey) => {
    const sectionIndex = filteredAvailableItems.findIndex(section => section.key === categoryKey)
    if (sectionIndex !== -1) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewPosition: 0,
      })
    }
  }

  const UnavailableFoodItem = ({ data }) => (
    <View style={[styles.foodItemContainer, styles.unavailable, GlobalStyles.lightBorder]}>
      <View style={styles.itemWrap}>
        {data.thumbnailUrl && <Image style={styles.thumbnail} source={{ uri: data.thumbnailUrl }} />}
        <View style={styles.itemInfo}>
          <Text style={styles.title}>{data.name}</Text>
          <Text style={styles.price}>₹{data.price}</Text>
          <Text style={styles.availabilityText}>Available from {data.availability.from}</Text>
        </View>
      </View>
    </View>
  )

  const renderUnavailableItems = () => (
    <View style={styles.unavailableList}>
      {filteredUnavailableItems.length > 0 && <Text style={styles.unavailableHeading}>ITEMS NOT AVAILABLE AT YOUR SELECTED TIMESLOT</Text>}
      {filteredUnavailableItems.map(item => (
        <UnavailableFoodItem key={item.id} data={item} />
      ))}
    </View>
  )

  const MultiSelectButton = ({ label }) => {
    const isSelected = selectedFilters.includes(label)
    const handlePress = () => {
      if (isSelected) {
        setSelectedFilters(selectedFilters.filter(filter => filter !== label))
      } else {
        setSelectedFilters([...selectedFilters, label])
      }
    }

    return (
      <View style={styles.multiSelectButtonContainer}>
        <TouchableOpacity onPress={handlePress} style={[styles.multiSelectButton, isSelected && styles.selectedButton]}>
          <Text style={[styles.multiSelectButtonText, isSelected && styles.selectedButtonText]}>{label}</Text>
          {isSelected && (
            <TouchableOpacity onPress={handlePress}>
              <Image style={styles.clearButtonImage} source={require('images/close.png')} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  const openModal = (item) => {
    setSelectedItem(item)
    if (lastUsedCustomisations[item.id]) {
      setSelectedCustomisations(lastUsedCustomisations[item.id])
      setIsUsingLastCustomizations(true)
    } else {
      initializeCustomisations(item.customisations)
      setIsUsingLastCustomizations(false)
    }
    setAddItemModalVisible(true)
  }

  const initializeCustomisations = (itemCustomisations, cartCustomisations) => {
    const initialCustomisations = {}

    if (cartCustomisations && cartCustomisations.length > 0) {
      setSelectedCustomisations(cartCustomisations)
    } else {
      itemCustomisations.forEach(customisation => {
        initialCustomisations[customisation.title] = customisation.choices.filter(choice => choice.default).map(choice => ({ name: choice.name, price: choice.price }))
      })
      setSelectedCustomisations(initialCustomisations)
    }
  }

  const closeModal = () => {
    setAddItemModalVisible(false)
    setSelectedItem(null)
  }

  const confirmAddItem = () => {
    const customisationsWithPrice = Object.entries(selectedCustomisations).map(([key, choices]) => {
      const originalCustomisation = selectedItem.customisations.find(c => c.title === key)
      return {
        title: key,
        choices: Array.isArray(choices)
          ? choices.map(choice => ({
              name: choice.name,
              price: Number(choice.price) || 0
            }))
          : [],
        multiOption: originalCustomisation ? originalCustomisation.multiOption : false
      }
    })

    setLastUsedCustomisations(prev => ({
      ...prev,
      [selectedItem.id]: selectedCustomisations
    }))

    dispatch(addToCart({
      name: selectedItem.name,
      itemId: selectedItem.id,
      quantity: 1,
      price: Number(selectedItem.price) || 0,
      temperature: selectedItem.temperature,
      thumbnailUrl: selectedItem.thumbnailUrl,
      customisations: customisationsWithPrice,
    }))

    closeModal()
  }

  const handleCustomisationSelect = (customisationTitle, choice, multiOption, limit) => {
    setSelectedCustomisations(prevSelections => {
      const updatedSelections = { ...prevSelections }
      if (!updatedSelections[customisationTitle]) {
        updatedSelections[customisationTitle] = []
      }

      const choiceExists = updatedSelections[customisationTitle].some(selectedChoice => selectedChoice.name === choice.name)

      if (choiceExists) {
        updatedSelections[customisationTitle] = updatedSelections[customisationTitle].filter(
          selectedChoice => selectedChoice.name !== choice.name
        )
      } else {
        if (multiOption) {
          if (updatedSelections[customisationTitle].length < limit) {
            updatedSelections[customisationTitle].push({ name: choice.name, price: choice.price })
          }
        } else {
          updatedSelections[customisationTitle] = [{ name: choice.name, price: choice.price }]
        }
      }

      return updatedSelections
    })
  }

  const CustomCheckbox = ({ isSelected, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.checkboxContainer, isSelected && { backgroundColor: colors.theme }]}>
      {isSelected && (
        <Image
          source={require('images/tick.png')}
          style={styles.checkboxTick}
        />
      )}
    </TouchableOpacity>
  )

  const CustomRadioButton = ({ isSelected, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.radioButton}>
      {isSelected && <View style={styles.radioButtonSelected} />}
    </TouchableOpacity>
  )

  const handleCartNavigation = async () => {
    navigation.navigate('CartScreen')
    await createOrUpdateCart(cart, customerId, restaurantId)
  }

  return (
    <Layout
      backTitle={restaurant?.name}
      navigation={navigation}
      bottomBar
      rightButton
      price={cart.subTotal.toString()}
      icon={require('images/shopping-cart.png')}
      next
      btnText="My Cart"
      showBtn={cart.subTotal.toString()}
      onBtnPress={handleCartNavigation}
    >
      <SearchBar
        style={{ marginBottom: 10 }}
        placeholder="Search Food.."
        value={searchQuery}
        onSearch={setSearchQuery}
      />
      {isLoading && <ActivityIndicator size="large" />}
      {!isLoading && (
        <>
          <View style={styles.categoryContainer}>
            <View style={styles.filterContainer}>
              <MultiSelectButton label="Veg" />
              <MultiSelectButton label="Non-Veg" />
              <MultiSelectButton label="Vegan" />
            </View>
            <TouchableOpacity style={styles.floatingButton} onPress={() => setMenuModalVisible(true)}>
              <Image style={styles.menuIcon} source={require('images/menuIcon.png')} />
              <Text style={styles.floatingButtonText}>Menu</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={menuModalVisible}
              onRequestClose={() => setMenuModalVisible(false)}
            >
              <TouchableOpacity style={[styles.modalOverlay, { justifyContent: 'center' }]} onPress={() => setMenuModalVisible(false)}>
                <TouchableOpacity activeOpacity={1} style={styles.modalView}>
                  <Text style={styles.modalTitle}>Menu</Text>
                  <ScrollView style={styles.modalScrollView}>
                    {filteredAvailableItems.map((section) => (
                      <TouchableOpacity key={section.key} onPress={() => {
                        scrollToCategory(section.key)
                        setMenuModalVisible(false)
                      }}>
                        <Text style={styles.modalCategory}>{section.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Button title="Close" onPress={() => setMenuModalVisible(false)} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>
            <Modal
              animationType="slide"
              transparent={true}
              visible={addItemModalVisible}
              onRequestClose={closeModal}
            >
              <TouchableOpacity style={styles.modalOverlay} onPress={closeModal}>
                <TouchableOpacity onPress={closeModal}>
                  <Image style={{ width: 30, height: 30, marginBottom: 6 }} source={require('images/close.png')} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} style={styles.bottomModalView}>
                  <View style={styles.bottomModalHeader}>
                    <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                  </View>
                  {selectedItem && (
                    <ScrollView style={styles.modalScrollView}>
                      {selectedItem.customisations && selectedItem.customisations.length > 0 && selectedItem.customisations.map((customisation, index) => (
                        <View key={index}>
                          <Text style={styles.modalSectionTitle}>{customisation.title}</Text>
                          <Text style={styles.modalSubtitle}>
                            {generateSubtitle(customisation.required, customisation.multiOption, customisation.limit)}
                          </Text>
                          <View style={styles.sectionCard}>
                            {customisation.choices.map((choice, idx) => (
                              <View key={idx} style={styles.modalItem}>
                                <View>
                                  <Text style={styles.modalItemText}>{choice.name}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  {choice.price !== undefined && (
                                    <Text style={styles.price}>+ ₹{choice.price}</Text>
                                  )}
                                  {customisation.multiOption ? (
                                    <CustomCheckbox
                                      isSelected={selectedCustomisations[customisation.title]?.some(selectedChoice => selectedChoice.name === choice.name) || false}
                                      onPress={() => handleCustomisationSelect(customisation.title, choice, customisation.multiOption, customisation.limit)}
                                    />
                                  ) : (
                                    <CustomRadioButton
                                      isSelected={selectedCustomisations[customisation.title]?.some(selectedChoice => selectedChoice.name === choice.name) || false}
                                      onPress={() => handleCustomisationSelect(customisation.title, choice, customisation.multiOption, customisation.limit)}
                                    />
                                  )}
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                  <CustomButton style={styles.button} title='Add to Cart' onPress={confirmAddItem} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>
          </View>
          <SectionList
            ref={sectionListRef}
            sections={filteredAvailableItems}
            keyExtractor={(item, index) => item.id + index}
            renderItem={({ item }) => <FoodItem data={item} dispatch={dispatch} openModal={openModal} />}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            stickySectionHeadersEnabled={false}
            ListFooterComponent={renderUnavailableItems}
          />
        </>
      )}
    </Layout>
  )
}

export default RestaurantHomeScreen


const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  multiSelectButtonContainer: {
    marginRight: 10,
  },
  multiSelectButton: {
    flexDirection: 'row',
    backgroundColor: colors.themeLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  multiSelectButtonText: {
    color: colors.theme,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  selectedButton: {
    backgroundColor: colors.theme,
  },
  selectedButtonText: {
    color: 'white',
  },
  clearButton: {
    borderRadius: 50,
    padding: 8,
  },
  clearButtonImage: {
    width: 16,
    height: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: colors.themeLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: colors.theme,
    fontSize: 14,
    fontWeight: '600',
  },
  foodItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '50%'
  },
  thumbnail: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  itemInfo: {},
  title: {
    fontSize: 14,
    color: 'black',
    fontWeight: '600',
  },
  price: {
    color: colors.theme,
    fontSize: 12,
    fontWeight: '500',
  },
  unavailableHeading: {
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  unavailableList: {
    marginBottom: 10,
  },
  unavailable: {
    backgroundColor: 'rgba(1,1,1, 0.1)',
    opacity: 0.5,
  },
  availabilityText: {
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
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
  icon: {
    width: 14,
    height: 14,
  },
  value: {
    fontSize: 12,
    backgroundColor: 'white',
    color: 'black',
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginHorizontal: 6,
    borderRadius: 4,
  },
  sectionHeader: {
    position: 'relative',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'black',
    marginBottom: 8,
  },
  floatingButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.theme,
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    zIndex: 3,
    flexDirection: 'row',
    gap: 2,
  },
  menuIcon: {
    width: 14,
    height: 14,
    tintColor: 'white'
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomModalView: {
    width: '100%',
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalScrollView: {
    width: '100%',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalSectionTitle: {
    color: colors.theme,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
    textTransform: 'capitalize'
  },
  modalItem: {
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    textTransform: 'capitalize'
  },
  modalCategory: {
    fontSize: 16,
    padding: 6,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: 'rgba(228, 233, 237, 0.5)',
    borderRadius: 8,
    paddingTop: 12,
    paddingBottom: 6,
  },
  radioButton: {
    height: 16,
    width: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.theme,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: colors.theme,
  },
  checkboxContainer: {
    height: 16,
    width: 16,
    borderWidth: 1,
    borderColor: colors.theme,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkboxTick: {
    height: 12,
    width: 12,
    tintColor: 'white',
  },
  modalSubtitle: {
    color: 'gray',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    marginTop: 6,
    marginBottom: 12,
  },
})
