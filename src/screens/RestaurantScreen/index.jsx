import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  SectionList,
  ActivityIndicator,
  Modal,
  ScrollView,
  Button,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Layout from 'components/common/Layout';
import SearchBar from 'components/common/SearchBar';
import colors from 'constants/colors';
import { useSelector, useDispatch } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import { addToCart, setRestaurantId } from 'redux/slices/cartSlice';
import CustomButton from 'components/common/CustomButton';
import FoodItem from './components/FoodItem';
import UnavailableFoodItem from './components/UnavailableFoodItem';
import { CustomCheckbox, CustomRadioButton, MultiSelectButton } from './components/CustomFormEl';
import { createOrUpdateCart, checkAvailability, parseTime, generateSubtitle } from './utils/helpers';

const RestaurantScreen = ({ navigation, route }) => {
  const restaurant = useSelector(state => state.restaurants.currentRestaurant);
  const customerId = useSelector(state => state.authentication.customer.id);
  const { restaurantId } = route.params;
  const { selectedTimeSlot } = useSelector(state => state.restaurants);
  const cart = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [availableItems, setAvailableItems] = useState([]);
  const [unavailableItems, setUnavailableItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAvailableItems, setFilteredAvailableItems] = useState([]);
  const [filteredUnavailableItems, setFilteredUnavailableItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const sectionListRef = useRef(null);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCustomisations, setSelectedCustomisations] = useState({});
  const [lastUsedCustomisations, setLastUsedCustomisations] = useState({});

  useEffect(() => {
    dispatch(setRestaurantId(restaurantId));
  }, [dispatch, restaurantId]);

  useEffect(() => {
    setIsLoading(true);
    const fetchMenu = async () => {
      try {
        const menuSnapshot = await firestore()
          .collection('restaurants')
          .doc(restaurantId)
          .collection('menu')
          .get();

        const categoriesMap = {};
        const tempUnavailableItems = [];

        const menuPromises = menuSnapshot.docs.map(async doc => {
          const data = doc.data();
          const availability = data.availability || {};
          const isAvailable = checkAvailability(availability, selectedTimeSlot);

          if (!isAvailable) {
            tempUnavailableItems.push({ ...data, id: doc.id, availability });
          } else {
            return Promise.all(
              data.categories.map(async categoryRef => {
                const categoryDoc = await categoryRef.get();
                if (categoryDoc.exists) {
                  const categoryName = categoryDoc.data().name;
                  if (!categoriesMap[categoryName]) {
                    categoriesMap[categoryName] = {
                      title: categoryName,
                      data: [],
                      key: categoryName,
                    };
                  }
                  categoriesMap[categoryName].data.push({
                    ...data,
                    id: doc.id,
                  });
                  return categoryName;
                }
                return 'Unknown Category';
              }),
            );
          }
        });

        await Promise.all(menuPromises);

        const sortedCategories = Object.values(categoriesMap);
        if (sortedCategories.some(cat => cat.key === 'Recommended')) {
          const recommendedCategory = sortedCategories.find(cat => cat.key === 'Recommended');
          sortedCategories.splice(sortedCategories.indexOf(recommendedCategory), 1);
          sortedCategories.unshift(recommendedCategory);
        }

        setAvailableItems(sortedCategories);
        setUnavailableItems(
          tempUnavailableItems.sort(
            (a, b) => parseTime(a.availability.from) - parseTime(b.availability.from),
          ),
        );
      } catch (e) {
        console.log(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [restaurant, selectedTimeSlot]);

  useEffect(() => {
    if (searchQuery) {
      const filteredAvailable = availableItems
        .map(category => ({
          ...category,
          data: category.data.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
        }))
        .filter(category => category.data.length > 0);

      const filteredUnavailable = unavailableItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      setFilteredAvailableItems(filteredAvailable);
      setFilteredUnavailableItems(filteredUnavailable);
    } else {
      setFilteredAvailableItems(availableItems);
      setFilteredUnavailableItems(unavailableItems);
    }
  }, [searchQuery, availableItems, unavailableItems]);

  useEffect(() => {
    const filteredAvailable = availableItems
      .map(category => ({
        ...category,
        data: category.data.filter(
          item => selectedFilters.length === 0 || selectedFilters.some(filter => item.type.includes(filter)),
        ),
      }))
      .filter(category => category.data.length > 0);

    setFilteredAvailableItems(filteredAvailable);
  }, [selectedFilters, availableItems]);

  const scrollToCategory = categoryKey => {
    const sectionIndex = filteredAvailableItems.findIndex(section => section.key === categoryKey);
    if (sectionIndex !== -1) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewPosition: 0,
      });
    }
  };

  const renderUnavailableItems = () => (
    <View style={styles.unavailableList}>
      {filteredUnavailableItems.length > 0 && (
        <Text style={styles.unavailableHeading}>ITEMS NOT AVAILABLE AT YOUR SELECTED TIMESLOT</Text>
      )}
      {filteredUnavailableItems.map(item => (
        <UnavailableFoodItem key={item.id} data={item} />
      ))}
    </View>
  );

  const initializeCustomisations = (itemCustomisations, cartCustomisations) => {
    const initialCustomisations = {};

    if (cartCustomisations && cartCustomisations.length > 0) {
      setSelectedCustomisations(cartCustomisations);
    } else {
      itemCustomisations.forEach(customisation => {
        initialCustomisations[customisation.title] = customisation.choices
          .filter(choice => choice.default)
          .map(choice => ({ name: choice.name, price: choice.price }));
      });
      setSelectedCustomisations(initialCustomisations);
    }
  };

  const openModal = item => {
    setSelectedItem(item);
    if (lastUsedCustomisations[item.id]) {
      setSelectedCustomisations(lastUsedCustomisations[item.id]);
    } else {
      initializeCustomisations(item.customisations);
    }
    setAddItemModalVisible(true);
  };

  const closeModal = () => {
    setAddItemModalVisible(false);
    setSelectedItem(null);
  };

  const confirmAddItem = () => {
    const customisationsWithPrice = Object.entries(selectedCustomisations).map(([key, choices]) => {
      const originalCustomisation = selectedItem.customisations.find(c => c.title === key);
      return {
        title: key,
        choices: Array.isArray(choices)
          ? choices.map(choice => ({
              name: choice.name,
              price: Number(choice.price) || 0,
            }))
          : [],
        multiOption: originalCustomisation ? originalCustomisation.multiOption : false,
      };
    });

    setLastUsedCustomisations(prev => ({
      ...prev,
      [selectedItem.id]: selectedCustomisations,
    }));

    dispatch(
      addToCart({
        name: selectedItem.name,
        itemId: selectedItem.id,
        quantity: 1,
        price: Number(selectedItem.price) || 0,
        temperature: selectedItem.temperature,
        thumbnailUrl: selectedItem.thumbnailUrl,
        customisations: customisationsWithPrice,
      }),
    );

    closeModal();
  };

  const handleCustomisationSelect = (customisationTitle, choice, multiOption, limit) => {
    setSelectedCustomisations(prevSelections => {
      const updatedSelections = { ...prevSelections };
      if (!updatedSelections[customisationTitle]) {
        updatedSelections[customisationTitle] = [];
      }

      const choiceExists = updatedSelections[customisationTitle].some(
        selectedChoice => selectedChoice.name === choice.name,
      );

      if (choiceExists) {
        updatedSelections[customisationTitle] = updatedSelections[customisationTitle].filter(
          selectedChoice => selectedChoice.name !== choice.name,
        );
      } else {
        if (multiOption) {
          if (updatedSelections[customisationTitle].length < limit) {
            updatedSelections[customisationTitle].push({ name: choice.name, price: choice.price });
          }
        } else {
          updatedSelections[customisationTitle] = [{ name: choice.name, price: choice.price }];
        }
      }

      return updatedSelections;
    });
  };

  const handleCartNavigation = async () => {
    navigation.navigate('CartScreen');
    await createOrUpdateCart(cart, customerId, restaurantId);
  };

  return (
    <Layout
      backTitle={restaurant?.name}
      navigation={navigation}
      bottomBar
      rightButton
      price={cart.subTotal.toString()}
      icon={require('assets/images/shopping-cart.png')}
      next
      btnText="My Cart"
      showBtn={cart.subTotal.toString()}
      onBtnPress={handleCartNavigation}
    >
      <SearchBar
        style={styles.mb10}
        placeholder="Search Food.."
        value={searchQuery}
        onSearch={setSearchQuery}
      />
      {isLoading && <ActivityIndicator size="large" />}
      {!isLoading && (
        <>
          <View style={styles.categoryContainer}>
            <View style={styles.filterContainer}>
              <MultiSelectButton
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                label="Veg"
              />
              <MultiSelectButton
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                label="Non-Veg"
              />
              <MultiSelectButton
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                label="Vegan"
              />
            </View>
            <TouchableOpacity style={styles.floatingButton} onPress={() => setMenuModalVisible(true)}>
              <Image style={styles.menuIcon} source={require('assets/images/menuIcon.png')} />
              <Text style={styles.floatingButtonText}>Menu</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={menuModalVisible}
              onRequestClose={() => setMenuModalVisible(false)}
            >
              <TouchableOpacity
                style={[styles.modalOverlay, styles.justCenter]}
                onPress={() => setMenuModalVisible(false)}
              >
                <TouchableOpacity activeOpacity={1} style={styles.modalView}>
                  <Text style={styles.modalTitle}>Menu</Text>
                  <ScrollView style={styles.modalScrollView}>
                    {filteredAvailableItems.map(section => (
                      <TouchableOpacity
                        key={section.key}
                        onPress={() => {
                          scrollToCategory(section.key);
                          setMenuModalVisible(false);
                        }}
                      >
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
                  <Image style={styles.closeModalBtn} source={require('assets/images/close.png')} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} style={styles.bottomModalView}>
                  <View style={styles.bottomModalHeader}>
                    <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                  </View>
                  {selectedItem && (
                    <ScrollView style={styles.modalScrollView}>
                      {selectedItem.customisations &&
                        selectedItem.customisations.length > 0 &&
                        selectedItem.customisations.map((customisation, index) => (
                          <View key={index}>
                            <Text style={styles.modalSectionTitle}>{customisation.title}</Text>
                            <Text style={styles.modalSubtitle}>
                              {generateSubtitle(
                                customisation.required,
                                customisation.multiOption,
                                customisation.limit,
                              )}
                            </Text>
                            <View style={styles.sectionCard}>
                              {customisation.choices.map((choice, idx) => (
                                <View key={idx} style={styles.modalItem}>
                                  <View>
                                    <Text style={styles.modalItemText}>{choice.name}</Text>
                                  </View>
                                  <View style={styles.modalPrice}>
                                    {choice.price !== undefined && (
                                      <Text style={styles.price}>+ ₹{choice.price}</Text>
                                    )}
                                    {customisation.multiOption ? (
                                      <CustomCheckbox
                                        isSelected={
                                          selectedCustomisations[customisation.title]?.some(
                                            selectedChoice => selectedChoice.name === choice.name,
                                          ) || false
                                        }
                                        onPress={() =>
                                          handleCustomisationSelect(
                                            customisation.title,
                                            choice,
                                            customisation.multiOption,
                                            customisation.limit,
                                          )
                                        }
                                      />
                                    ) : (
                                      <CustomRadioButton
                                        isSelected={
                                          selectedCustomisations[customisation.title]?.some(
                                            selectedChoice => selectedChoice.name === choice.name,
                                          ) || false
                                        }
                                        onPress={() =>
                                          handleCustomisationSelect(
                                            customisation.title,
                                            choice,
                                            customisation.multiOption,
                                            customisation.limit,
                                          )
                                        }
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
                  <CustomButton style={styles.button} title="Add to Cart" onPress={confirmAddItem} />
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
  );
};

const styles = StyleSheet.create({
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
  mb10: {
    marginBottom: 10,
  },
  justCenter: {
    justifyContent: 'center',
  },
  closeModalBtn: {
    width: 30,
    height: 30,
    marginBottom: 6,
  },
  modalPrice: {
    flexDirection: 'row',
    alignItems: 'center',
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
    tintColor: 'white',
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
    textTransform: 'capitalize',
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
    textTransform: 'capitalize',
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
});

export default RestaurantScreen;
