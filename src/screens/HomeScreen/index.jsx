import React, { useEffect, useState, useRef } from 'react';
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
  SafeAreaView,
  Animated,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { setRestaurants, setCurrentRestaurant } from 'redux/slices/restaurantsSlice';
import Layout from 'components/common/Layout';
import SearchBar from 'components/common/SearchBar';
import Restaurant from 'components/restaurant/Restaurant';
import colors from 'constants/colors';
import moment from 'moment-timezone';
import TrackOrderModal from 'screens/OrderListScreen/components/TrackOrderModal';
import FastImage from 'react-native-fast-image';
import CartButton from './components/CartButton';
import BannerCarousel from './components/BannerCarousel';

const HEADER_MAX_HEIGHT = 170;
const HEADER_MIN_HEIGHT = 0;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { available, unavailable, selectedTimeSlot } = useSelector(state => state.restaurants);
  const orderId = useSelector(state => state.orders.currentOrderId);
  const cart = useSelector(state => state.cart);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredAvailable, setFilteredAvailable] = useState([]);
  const [filteredUnavailable, setFilteredUnavailable] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartRestaurant, setCartRestaurant] = useState(null);
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false);
  const [banners, setBanners] = useState([]);
  const [showViewAllButton, setShowViewAllButton] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 2],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });
  const CART_BUTTON_HEIGHT = 160; // Adjust this based on the CartButton height

  const cartButtonTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 2],
    outputRange: [0, CART_BUTTON_HEIGHT],
    extrapolate: 'clamp',
  });

  const cartButtonOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE, HEADER_SCROLL_DISTANCE * 2],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  function isTimeSlotWithin(selected, from, until) {
    const [selectedHour, selectedMinute] = selected.split(':').map(Number);
    const [fromHour, fromMinute] = from.split(':').map(Number);
    const [untilHour, untilMinute] = until.split(':').map(Number);

    const selectedMinutes = selectedHour * 60 + selectedMinute;
    const fromMinutes = fromHour * 60 + fromMinute;
    const untilMinutes = untilHour * 60 + untilMinute;

    return selectedMinutes >= fromMinutes && selectedMinutes <= untilMinutes;
  }

  useEffect(() => {
    if (orderId) {
      setShowTrackOrderModal(true);
    }
  }, [orderId]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const snapshot = await firestore().collection('banners').get();
        const fetchedBanners = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc?.data(),
        }));
        setBanners(fetchedBanners);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchBanners();
  }, []);

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
                const newOcc = occasion;
                if (newOcc.date) {
                  newOcc.date = newOcc.date.toDate().toISOString();
                }
                return newOcc;
              });
            }
            // if (data.orders) {
            //   data.orders = data.orders.map(orderRef => orderRef.path);
            // }
            return { id: doc.id, ...data, menuItems };
          }),
        );

        const availableRestaurants = [];
        const unavailableRestaurants = [];

        if (cart.items.length) {
          const filterRestaurants = fetchedRestaurants.filter(restaurant => {
            return restaurant.id === cart.restaurantId;
          });
          if (filterRestaurants.length) setCartRestaurant(filterRestaurants[0]);
        }

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

        dispatch(
          setRestaurants({
            available: availableRestaurants,
            unavailable: unavailableRestaurants,
          }),
        );
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [selectedTimeSlot, dispatch, cart.restaurantId]);

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
    const filteredCategoryList = categories.filter(category =>
      category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()),
    );
    setFilteredCategories(filteredCategoryList);
  }, [categorySearchQuery, categories]);

  useEffect(() => {
    if (selectedCategory) {
      const filterByCategory = restaurants => {
        const categoryWords = selectedCategory.toLowerCase().split(' ');

        return restaurants.filter(restaurant => {
          const hasMatch = restaurant.menuItems.some(item =>
            categoryWords.some(categoryWord => item.toLowerCase().includes(categoryWord)),
          );
          return hasMatch;
        });
      };

      const filteredAvailableRestaurants = filterByCategory(available);
      const filteredUnavailableRestaurants = filterByCategory(unavailable);

      setFilteredAvailable(filteredAvailableRestaurants);
      setFilteredUnavailable(filteredUnavailableRestaurants);
    } else {
      setFilteredAvailable(available);
      setFilteredUnavailable(unavailable);
    }
  }, [selectedCategory, available, unavailable]);

  const handleCategoryPress = category => {
    setSelectedCategory(category);
    setCategorySearchQuery(''); // reset the search query
    setFilteredCategories(categories); // reset the filtered categories
    setModalVisible(false);
  };

  const handleRestaurantPress = item => {
    dispatch(setCurrentRestaurant(item));
    navigation.navigate('RestaurantScreen', { restaurantId: item.id });
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

  const onBannerPress = async bannerId => {
    try {
      const bannerDoc = await firestore().collection('banners').doc(bannerId).get();
      const banner = bannerDoc.data();

      if (banner) {
        if (banner.isList) {
          // Filter the existing restaurants based on the banner's list of restaurant references
          const filteredAvailableRestaurants = available.filter(restaurant =>
            banner.restaurants.some(ref => ref.path === `restaurants/${restaurant.id}`),
          );
          const filteredUnavailableRestaurants = unavailable.filter(restaurant =>
            banner.restaurants.some(ref => ref.path === `restaurants/${restaurant.id}`),
          );

          setFilteredAvailable(filteredAvailableRestaurants);
          setFilteredUnavailable(filteredUnavailableRestaurants);
          setShowViewAllButton(true);
        } else {
          // Handle single restaurant
          const restaurantRef = banner.restaurants[0];
          const restaurantId = restaurantRef.path.split('/').pop();

          // Find the restaurant in the available or unavailable list
          const singleRestaurant = [...available, ...unavailable].find(
            restaurant => restaurant.id === restaurantId,
          );
          if (singleRestaurant) {
            dispatch(setCurrentRestaurant(singleRestaurant));
            navigation.navigate('RestaurantScreen', { restaurantId: singleRestaurant.id });
          }
        }
      }
    } catch (err) {
      console.log('Error fetching banner data:', err.message);
    }
  };

  const handleViewAllRestaurants = () => {
    setFilteredAvailable(available);
    setFilteredUnavailable(unavailable);
    setShowViewAllButton(false);
  };
  const renderHeader = () => (
    <>
      <BannerCarousel banners={banners} onPress={onBannerPress} />
      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesHeaderContainer}>
          <Text style={styles.categoriesheader}>CRAVING SOMETHING?</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => {
              setModalVisible(true);
              setCategorySearchQuery('');
              setFilteredCategories(categories);
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
              <FastImage
                source={{ uri: category.photoUrl, priority: FastImage.priority.high }}
                style={styles.categoryImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.filterHeader}>
        {(selectedCategory || showViewAllButton) && (
          <TouchableOpacity onPress={handleViewAllRestaurants}>
            <Text style={styles.clearFilterText}>View all Restaurants</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  return (
    <Layout navigation={navigation} noTitle>
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
            opacity: headerOpacity,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.navigate('TimeSlotScreen')} style={styles.topBar}>
          <View style={styles.column}>
            <Text style={styles.pickupText}>You are picking up your food at</Text>
            <Text style={styles.pickupTime}>{selectedTimeSlot}</Text>
          </View>
          <View style={styles.changeTimeContainer}>
            <Text style={styles.changeTimeText}>Change Time</Text>
            {/* <Image style={styles.chevron} source={require('assets/images/right.png')} /> */}
          </View>
        </TouchableOpacity>
        <SearchBar
          style={styles.mb20}
          placeholder="Search Restaurants.."
          value={searchQuery}
          onSearch={setSearchQuery}
        />
      </Animated.View>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredAvailable}
          renderItem={renderRestaurantItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
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
              setCategorySearchQuery('');
              setFilteredCategories(categories);
            }}
          >
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      <TrackOrderModal
        isVisible={showTrackOrderModal}
        onClose={() => setShowTrackOrderModal(false)}
        orderId={orderId}
        showMap
      />
      {cart.items.length && cartRestaurant ? (
        <Animated.View
          style={[
            styles.cartButtonContainer,
            {
              transform: [{ translateY: cartButtonTranslateY }],
              opacity: cartButtonOpacity,
            },
          ]}
        >
          <CartButton
            navigation={navigation}
            targetScreen="CartScreen"
            onPress={() => handleRestaurantPress(cartRestaurant)}
            restaurantName={cartRestaurant?.name}
            itemCount={cart.items.length}
            restaurantLogo={cartRestaurant?.thumbnailUrl}
            buttonText="View Cart"
          />
        </Animated.View>
      ) : null}
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
  header: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    overflow: 'hidden',
    zIndex: 1,
  },
  cartButtonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    // width: '100%',
    paddingRighte: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  unavailableHeading: {
    color: 'gray',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
  },
  mb20: {
    marginBottom: 20,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  topBar: {
    backgroundColor: colors.theme,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 30,
  },
  changeTimeContainer: {
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 40,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  changeTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  pickupText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    marginBottom: 6,
  },
  pickupTime: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // chevron: {
  //   position: 'absolute',
  //   right: 12,
  //   top: '75%',
  //   transform: [{ translateY: -12 }],
  //   width: 24,
  //   height: 24,
  // },
  categoriesContainer: {
    marginVertical: 20,
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
