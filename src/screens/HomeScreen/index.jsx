import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { setRestaurants, setCurrentRestaurant } from 'redux/slices/restaurantsSlice';
import Layout from 'components/common/Layout';
import SearchBar from 'components/common/SearchBar';
import Restaurant from 'components/restaurant/Restaurant';
import colors from 'constants/colors';
import { resetCart } from 'redux/slices/cartSlice';
import moment from 'moment-timezone';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { available, unavailable, selectedTimeSlot } = useSelector(state => state.restaurants);
  const [searchQuery, setSearchQuery] = useState('');
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filteredAvailable, setFilteredAvailable] = useState([]);
  const [filteredUnavailable, setFilteredUnavailable] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchRestaurants = async () => {
      try {
        const snapshot = await firestore().collection('restaurants').get();
        const now = moment.tz('Asia/Kolkata');
        const todayDate = now.startOf('day');
        const dayOfWeek = now.format('dddd').toLowerCase();

        const fetchedRestaurants = await Promise.all(
          snapshot.docs.map(async doc => {
            const data = doc.data();
            const menuSnapshot = await firestore()
              .collection('restaurants')
              .doc(doc.id)
              .collection('menu')
              .get();
            const menuItems = menuSnapshot.docs.map(menuDoc => menuDoc.data().name);

            // Convert Firebase Timestamps to ISO strings
            if (data.manualOverride && data.manualOverride.date) {
              data.manualOverride.date = data.manualOverride.date.toDate().toISOString();
            }
            if (data.availability.occasional) {
              data.availability.occasional = data.availability.occasional.map(occasion => {
                if (occasion.date) {
                  occasion.date = occasion.date.toDate().toISOString();
                }
                return occasion;
              });
            }
            if (data.orders) {
              data.orders = data.orders.map(orderRef => orderRef.path);
            }
            return { id: doc.id, ...data, menuItems };
          }),
        );

        const availableRestaurants = [];
        const unavailableRestaurants = [];

        fetchedRestaurants.forEach(restaurant => {
          let isOpenNow = false;
          let nextAvailableFrom = '';

          // Check manual override first
          const manualOverride = restaurant?.manualOverride;
          if (manualOverride && moment(manualOverride.date).isSame(todayDate, 'day')) {
            isOpenNow = manualOverride.isActive;
          } else {
            // Check occasional schedule
            const occasions = restaurant?.availability.occasional;
            const todayOccasion = occasions
              ? occasions.find(occasion => moment(occasion.date).isSame(todayDate, 'day'))
              : null;

            if (todayOccasion) {
              isOpenNow =
                todayOccasion.isOpen &&
                isTimeSlotWithin(selectedTimeSlot, todayOccasion.from, todayOccasion.until);
              if (!isOpenNow) {
                nextAvailableFrom = `Available from ${todayOccasion.from}`;
              }
            }

            // Check general schedule if no valid occasional schedule
            if (!isOpenNow && !todayOccasion) {
              const currentDay = restaurant?.availability.general
                ? restaurant?.availability.general[dayOfWeek]
                : null;
              if (currentDay && currentDay.isOpen) {
                isOpenNow = isTimeSlotWithin(selectedTimeSlot, currentDay.from, currentDay.until);
                if (!isOpenNow) {
                  nextAvailableFrom = `Available from ${currentDay.from}`;
                }
              }
            }
          }

          if (isOpenNow) {
            availableRestaurants.push(restaurant);
          } else {
            unavailableRestaurants.push({ ...restaurant, nextAvailableFrom });
          }
        });

        setAllRestaurants(fetchedRestaurants);
        dispatch(setRestaurants({ available: availableRestaurants, unavailable: unavailableRestaurants }));
      } catch (err) {
        console.log(err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [selectedTimeSlot]);

  useEffect(() => {
    const filterRestaurants = (restaurants, query) => {
      if (!query) return restaurants;
      return restaurants.filter(
        restaurant =>
          restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
          (restaurant?.cuisines &&
            restaurant?.cuisines.some(cuisine => cuisine.toLowerCase().includes(query.toLowerCase()))),
      );
    };

    const filteredAvailableRestaurants = filterRestaurants(available, searchQuery);
    const filteredUnavailableRestaurants = filterRestaurants(unavailable, searchQuery);

    setFilteredAvailable(filteredAvailableRestaurants);
    setFilteredUnavailable(filteredUnavailableRestaurants);
  }, [searchQuery, available, unavailable]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await firestore().collection('categories').get();
        const fetchedCategories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(fetchedCategories);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const filteredCategories = categories.filter(category =>
      category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()),
    );
    setFilteredCategories(filteredCategories);
  }, [categorySearchQuery, categories]);

  useEffect(() => {
    if (selectedCategory) {
      const filterByCategory = restaurants => {
        const categoryWords = selectedCategory.toLowerCase().split(' ');

        return restaurants.filter(restaurant => {
          const hasMatch = restaurant.menuItems.some(item =>
            categoryWords.some(categoryWord => item.toLowerCase().includes(categoryWord)),
          );
          if (hasMatch) {
            console.log(`Restaurant ${restaurant.name} matches category ${selectedCategory}`);
          }
          return hasMatch;
        });
      };

      const filteredAvailableRestaurants = filterByCategory(available);
      const filteredUnavailableRestaurants = filterByCategory(unavailable);

      console.log('Filtered Available Restaurants: ', filteredAvailableRestaurants);
      console.log('Filtered Unavailable Restaurants: ', filteredUnavailableRestaurants);

      setFilteredAvailable(filteredAvailableRestaurants);
      setFilteredUnavailable(filteredUnavailableRestaurants);
    } else {
      setFilteredAvailable(available);
      setFilteredUnavailable(unavailable);
    }
  }, [selectedCategory, available, unavailable]);

  function isTimeSlotWithin(selected, from, until) {
    const [selectedHour, selectedMinute] = selected.split(':').map(Number);
    const [fromHour, fromMinute] = from.split(':').map(Number);
    const [untilHour, untilMinute] = until.split(':').map(Number);

    const selectedMinutes = selectedHour * 60 + selectedMinute;
    const fromMinutes = fromHour * 60 + fromMinute;
    const untilMinutes = untilHour * 60 + untilMinute;

    return selectedMinutes >= fromMinutes && selectedMinutes <= untilMinutes;
  }

  const handleCategoryPress = category => {
    setSelectedCategory(category);
    setCategorySearchQuery(''); // reset the search query
    setFilteredCategories(categories); // reset the filtered categories
    setModalVisible(false);
  };

  const handleRestaurantPress = item => {
    dispatch(setCurrentRestaurant(item));
    // dispatch(resetCart())
    navigation.navigate('RestaurantHomeScreen', { restaurantId: item.id });
  };

  const renderRestaurantItem = ({ item }) => (
    <Restaurant onPress={() => handleRestaurantPress(item)} data={item} style={styles.card} />
  );

  const renderFooter = () =>
    filteredUnavailable.length > 0 && (
      <>
        <Text style={styles.unavailableHeading}>RESTAURANTS NOT AVAILABLE AT YOUR SELECTED TIMESLOT</Text>
        <FlatList
          data={filteredUnavailable}
          renderItem={({ item }) => (
            <Restaurant
              onPress={() => handleRestaurantPress(item)}
              data={item}
              style={[styles.card, styles.unavailable]}
              availabilityText={item.nextAvailableFrom}
            />
          )}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </>
    );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={() => handleCategoryPress(item.name)}>
      <Text style={styles.modalCategoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Layout title="Home" navigation={navigation}>
      <TouchableOpacity onPress={() => navigation.navigate('TimeSlotScreen')} style={styles.topBar}>
        <Text style={styles.pickupText}>You are picking up your food at</Text>
        <Text style={styles.pickupTime}>{selectedTimeSlot}</Text>
        <Image style={styles.chevron} source={require('assets/images/right.png')} />
      </TouchableOpacity>
      <SearchBar
        style={{ marginBottom: 20 }}
        placeholder="Search Restaurants.."
        value={searchQuery}
        onSearch={setSearchQuery}
      />
      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesHeaderContainer}>
          <Text style={styles.categoriesheader}>CRAVING SOMETHING?</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => {
              setModalVisible(true);
              setCategorySearchQuery(''); // reset the search query
              setFilteredCategories(categories); // reset the filtered categories
            }}
          >
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category.name)}
            >
              <Image source={{ uri: category.photoUrl }} style={styles.categoryImage} />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.filterHeader}>
        {selectedCategory && (
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <Text style={styles.clearFilterText}>View all Restaurants</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredAvailable}
          renderItem={renderRestaurantItem}
          keyExtractor={item => item.id}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.flatListContent}
        />
      )}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setCategorySearchQuery(''); // reset the search query
          setFilteredCategories(categories); // reset the filtered categories
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <SearchBar
              placeholder="Search Categories.."
              value={categorySearchQuery}
              onSearch={setCategorySearchQuery}
              style={styles.searchBar}
            />
          </View>
          <FlatList
            data={filteredCategories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
          />
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setCategorySearchQuery(''); // reset the search query
              setFilteredCategories(categories); // reset the filtered categories
            }}
          >
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </Layout>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  unavailable: {
    opacity: 0.55,
  },
  unavailableHeading: {
    color: 'gray',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
  },
  // restaurantListContainer: {
  //   flex: 1,
  // },
  flatListContent: {
    paddingBottom: 20,
  },
  topBar: {
    backgroundColor: colors.theme,
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: 'center',
    padding: 10,
    gap: 5,
  },
  pickupText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  pickupTime: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  chevron: {
    position: 'absolute',
    right: 12,
    top: '75%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoriesheader: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.theme,
  },
  seeAllButton: {
    backgroundColor: 'rgba(104, 141, 168, 0.3)',
    borderRadius: 50,
  },
  seeAll: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.theme,
    padding: 6,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  categoryImage: {
    width: 75,
    height: 60,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  categoryText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: 'black',
    textAlign: 'left',
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.theme,
  },
  // modalSearchBar: {
  //   flex: 1,
  //   marginLeft: 10,
  //   padding: 10,
  //   borderWidth: 1,
  //   borderColor: colors.lightGray,
  //   borderRadius: 8,
  // },
  modalCategoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginLeft: 40,
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 10,
  },
  clearFilterText: {
    color: colors.theme,
    fontWeight: '600',
    fontSize: 14,
    marginRight: 10,
  },
  searchBar: {
    width: '100%',
  },
});
