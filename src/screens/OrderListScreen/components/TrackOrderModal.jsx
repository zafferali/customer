import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  ImageBackground,
  Linking,
  Alert,
  AppState,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import colors from 'constants/colors';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import { Svg, Image as ImageSvg } from 'react-native-svg';
import { RESULTS } from 'react-native-permissions';
import OpenSettingsModal from 'components/common/OpenSettingsModal';
import { checkLocationPermission, openLocationSettings, requestLocationPermission } from 'utils/permissions';
import CustomButton from 'components/common/CustomButton';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { GlobalStyles } from 'constants/GlobalStyles';
import { makeCall } from 'utils/makeCall';
import OrderStatus from './OrderStatus';

const TrackOrderModal = ({ orderId, isVisible, onClose }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [runnerLocation, setRunnerLocation] = useState(null);
  const [runnerDetails, setRunnerDetails] = useState(null);
  const [lockerLocation, setLockerLocation] = useState(null);
  const [lockerDetails, setLockerDetails] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [route, setRoute] = useState([]);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingLocker, setIsLoadingLocker] = useState(true);
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const mapRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        checkLocationPermissionStatus();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      checkLocationPermissionStatus();
    }
  }, [isVisible]);

  useEffect(() => {
    if (orderStatus === 'delivered') {
      checkLocationPermissionStatus();
    } else {
      setLocationPermissionStatus(RESULTS.GRANTED);
    }
  }, [orderStatus]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderId && isVisible) {
        try {
          const orderDoc = await firestore().collection('orders').doc(orderId).get();
          if (orderDoc.exists) {
            setOrderDetails(orderDoc.data());
          } else {
            console.log('Order not found');
          }
        } catch (error) {
          console.log('Error fetching order details:', error);
        }
      }
    };

    fetchOrderDetails();
  }, [orderId, isVisible]);

  const checkLocationPermissionStatus = async () => {
    if (orderStatus === 'delivered') {
      const status = await checkLocationPermission();
      setLocationPermissionStatus(status);
      if (status === RESULTS.GRANTED) {
        getCurrentLocation();
      }
    } else {
      setLocationPermissionStatus(RESULTS.GRANTED);
    }
    fetchLockerLocation();
    fetchRunnerLocation();
    fetchRestaurantLocation();
  };

  const openGoogleMaps = async (destinationLat, destinationLng) => {
    const showMapAlert = url => {
      Alert.alert(
        'Open Google Maps',
        'Do you want to open Google Maps for navigation?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => Linking.openURL(url),
          },
        ],
        { cancelable: false },
      );
    };

    if (locationPermissionStatus === RESULTS.GRANTED) {
      try {
        getCurrentLocation();
        if (userLocation) {
          const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${destinationLat},${destinationLng}&travelmode=driving`;
          showMapAlert(url);
        } else {
          throw new Error('User location not available');
        }
      } catch (error) {
        console.log('Error getting current location:', error);
        const url = `https://www.google.com/maps/search/?api=1&query=${destinationLat},${destinationLng}`;
        showMapAlert(url);
      }
    } else {
      // If permission is not granted, use the search URL
      const url = `https://www.google.com/maps/search/?api=1&query=${destinationLat},${destinationLng}`;
      showMapAlert(url);
    }
  };

  const handleLocationPermission = async () => {
    if (orderStatus === 'delivered') {
      const status = await requestLocationPermission();
      setLocationPermissionStatus(status);
      if (status === RESULTS.GRANTED) {
        getCurrentLocation();
      } else if (status === RESULTS.DENIED) {
        setSettingsMessage(
          'Location permission is required for this feature. Please enable it in your device settings.',
        );
        setShowSettingsModal(true);
      } else if (status === RESULTS.BLOCKED) {
        setSettingsMessage('Location permission is blocked. Please enable it in your device settings.');
        setShowSettingsModal(true);
      }
    }
    fetchLockerLocation();
    fetchRunnerLocation();
    fetchRestaurantLocation();
  };

  const renderLocationPermissionMessage = () => {
    return (
      <ImageBackground source={require('assets/images/map-placeholder.png')} style={styles.loadingContainer}>
        <View style={styles.overlay} />
        <View style={styles.contentContainer}>
          <Text style={styles.permissionText}>We need access to your location to show it on the map.</Text>
          <CustomButton title="Allow Location Permission" onPress={handleLocationPermission} />
        </View>
      </ImageBackground>
    );
  };

  const getCurrentLocation = () => {
    if (isVisible && orderStatus === 'delivered' && locationPermissionStatus === RESULTS.GRANTED) {
      setIsLoadingUser(true);
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setIsLoadingUser(false);
          focusMapOnStatus(); // Add this line to update the map
        },
        error => {
          console.log('Error getting current location:', error);
          setIsLoadingUser(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } else {
      setIsLoadingUser(false);
    }
  };

  const fetchLockerLocation = async () => {
    try {
      setIsLoadingLocker(true);
      const orderDoc = await firestore().collection('orders').doc(orderId).get();
      const lockerRef = orderDoc.data()?.locker;
      const lockerDoc = await lockerRef?.get();
      const lockerData = lockerDoc.data();
      setLockerDetails(lockerData);
      const lockerGeo = lockerDoc.data().location.geo;
      setLockerLocation({ latitude: lockerGeo.latitude, longitude: lockerGeo.longitude });
    } catch (error) {
      console.log('Error fetching locker location', error);
    } finally {
      setIsLoadingLocker(false);
    }
  };

  const fetchRestaurantLocation = async () => {
    try {
      setIsLoadingRestaurant(true);
      const orderDoc = await firestore().collection('orders').doc(orderId).get();
      const restaurantRef = orderDoc.data().restaurant;
      const restaurantDoc = await restaurantRef?.get();
      const restaurantData = restaurantDoc.data();
      setRestaurantDetails(restaurantData);
      const restaurantGeo = restaurantDoc.data().location.geo;
      setRestaurantLocation({ latitude: restaurantGeo.latitude, longitude: restaurantGeo.longitude });
    } catch (error) {
      console.log('Error fetching restaurant location', error);
    } finally {
      setIsLoadingRestaurant(false);
    }
  };

  const fetchRunnerLocation = async () => {
    let orderUnsubscribe = null;
    let runnerUnsubscribe = null;

    try {
      const orderRef = firestore().collection('orders').doc(orderId);
      const orderSnapshot = await orderRef.get();
      const runnerRef = orderSnapshot.data()?.runner;

      if (runnerRef) {
        const runnerSnapshot = await runnerRef.get();
        const runnerData = runnerSnapshot.data();
        setRunnerDetails(runnerData);
      } else {
        console.log('Runner reference not found');
      }

      orderUnsubscribe = orderRef.onSnapshot(
        orderDoc => {
          const runnerRef = orderDoc.data()?.runner;
          setOrderStatus(orderDoc.data()?.orderStatus);

          if (runnerUnsubscribe) {
            runnerUnsubscribe();
          }

          if (runnerRef) {
            runnerUnsubscribe = runnerRef.onSnapshot(
              runnerDoc => {
                const runnerGeo = runnerDoc.data()?.geo;
                if (runnerGeo) {
                  setRunnerLocation({
                    latitude: runnerGeo.latitude,
                    longitude: runnerGeo.longitude,
                  });
                }
              },
              error => {
                console.log('Error in runner listener:', error);
              },
            );
          }
        },
        error => {
          console.log('Error in order listener:', error);
        },
      );
    } catch (error) {
      console.log('Error fetching runner data:', error);
    }

    return () => {
      if (orderUnsubscribe) orderUnsubscribe();
      if (runnerUnsubscribe) runnerUnsubscribe();
    };
  };

  const fetchRoute = async (origin, destination) => {
    if (origin && destination) {
      const apiKey = 'AIzaSyDDjWIA0w2194r9vmlPyKZ9M8j64BHU7Ss';
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`;

      try {
        const response = await axios.get(url);
        const points = response.data.routes[0]?.overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        setRoute(decodedPoints);
      } catch (error) {
        console.log('Error fetching route', error);
      }
    }
  };

  const decodePolyline = (t, e) => {
    for (var n, o, u = 0, l = 0, r = 0, d = [], h = 0, i = 0, a = null, c = 10 ** (e || 5); u < t.length; ) {
      (a = null), (h = 0), (i = 0);
      do (a = t.charCodeAt(u++) - 63), (i |= (31 & a) << h), (h += 5);
      while (a >= 32);
      (n = 1 & i ? ~(i >> 1) : i >> 1), (h = i = 0);
      do (a = t.charCodeAt(u++) - 63), (i |= (31 & a) << h), (h += 5);
      while (a >= 32);
      (o = 1 & i ? ~(i >> 1) : i >> 1), (l += n), (r += o), d.push({ latitude: l / c, longitude: r / c });
    }
    return d;
  };

  // FIXME: React Hook useCallback does nothing when called with only one argument. Did you forget to pass an array of dependencies?
  const focusMapOnStatus = useCallback(() => {
    if (!mapRef.current) return;

    const tightZoom = 0.005; // Tighter zoom level
    const mediumZoom = 0.01; // Medium zoom level for showing two points

    switch (orderStatus) {
      case 'received':
      case 'on the way':
      case 'ready':
        if (restaurantLocation && lockerLocation) {
          const midpoint = {
            latitude: (restaurantLocation.latitude + lockerLocation.latitude) / 2,
            longitude: (restaurantLocation.longitude + lockerLocation.longitude) / 2,
          };
          const latDelta = Math.abs(restaurantLocation.latitude - lockerLocation.latitude);
          const lngDelta = Math.abs(restaurantLocation.longitude - lockerLocation.longitude);
          mapRef.current.animateToRegion(
            {
              ...midpoint,
              latitudeDelta: Math.max(latDelta * 1.5, mediumZoom),
              longitudeDelta: Math.max(lngDelta * 1.5, mediumZoom),
            },
            1000,
          );
          fetchRoute(restaurantLocation, lockerLocation);
        }
        break;
      case 'picked':
        if (runnerLocation && lockerLocation) {
          const midpoint = {
            latitude: (runnerLocation.latitude + lockerLocation.latitude) / 2,
            longitude: (runnerLocation.longitude + lockerLocation.longitude) / 2,
          };
          const latDelta = Math.abs(runnerLocation.latitude - lockerLocation.latitude);
          const lngDelta = Math.abs(runnerLocation.longitude - lockerLocation.longitude);
          mapRef.current.animateToRegion(
            {
              ...midpoint,
              latitudeDelta: Math.max(latDelta * 1.5, mediumZoom),
              longitudeDelta: Math.max(lngDelta * 1.5, mediumZoom),
            },
            1000,
          );
          fetchRoute(runnerLocation, lockerLocation);
        }
        break;
      case 'delivered':
        if (userLocation && lockerLocation) {
          const midpoint = {
            latitude: (userLocation.latitude + lockerLocation.latitude) / 2,
            longitude: (userLocation.longitude + lockerLocation.longitude) / 2,
          };
          const latDelta = Math.abs(userLocation.latitude - lockerLocation.latitude);
          const lngDelta = Math.abs(userLocation.longitude - lockerLocation.longitude);
          mapRef.current.animateToRegion(
            {
              ...midpoint,
              latitudeDelta: Math.max(latDelta * 1.5, mediumZoom),
              longitudeDelta: Math.max(lngDelta * 1.5, mediumZoom),
            },
            1000,
          );
          fetchRoute(userLocation, lockerLocation);
        }
        break;
      case 'completed':
        if (lockerLocation) {
          mapRef.current.animateToRegion(
            {
              ...lockerLocation,
              latitudeDelta: tightZoom,
              longitudeDelta: tightZoom,
            },
            1000,
          );
        }
        break;
      default:
        break;
    }
  }, [orderStatus, restaurantLocation, runnerLocation, userLocation, lockerLocation]);

  useEffect(() => {
    if (isVisible) {
      getCurrentLocation();
      fetchLockerLocation();
      fetchRunnerLocation();
      fetchRestaurantLocation();
    }
  }, [isVisible, orderStatus]);

  useEffect(() => {
    if (mapRef.current && !isLoadingUser && !isLoadingLocker && !isLoadingRestaurant) {
      focusMapOnStatus();
    }
  }, [
    orderStatus,
    userLocation,
    runnerLocation,
    lockerLocation,
    restaurantLocation,
    isLoadingUser,
    isLoadingLocker,
    isLoadingRestaurant,
    focusMapOnStatus,
  ]);

  const isMapReady = () => {
    switch (orderStatus) {
      case 'received':
      case 'on the way':
      case 'ready':
        return !isLoadingRestaurant && !isLoadingLocker;
      case 'picked':
        return !isLoadingLocker && runnerLocation;
      case 'delivered':
        return !isLoadingUser && !isLoadingLocker && locationPermissionStatus === RESULTS.GRANTED;
      case 'completed':
        return !isLoadingLocker;
      default:
        return true;
    }
  };

  const renderMarkers = () => {
    const markers = [];

    if (['received', 'on the way', 'ready'].includes(orderStatus) && restaurantLocation) {
      markers.push(
        <Marker
          key="restaurant"
          style={styles.center}
          coordinate={restaurantLocation}
          tracksViewChanges={false}
        >
          <Svg width={50} height={50}>
            <ImageSvg
              width="50%"
              height="50%"
              preserveAspectRatio="xMidYMid slice"
              href={require('assets/images/menuIcon.png')}
            />
          </Svg>
          <View style={[styles.markerContainer, styles.restaurantBg]}>
            <Text style={styles.restaurantText}>Restaurant</Text>
          </View>
        </Marker>,
      );
    }

    if (
      ['received', 'on the way', 'ready', 'picked', 'delivered', 'completed'].includes(orderStatus) &&
      lockerLocation
    ) {
      markers.push(
        <Marker key="locker" style={styles.center} coordinate={lockerLocation} tracksViewChanges={false}>
          <Svg width={50} height={50}>
            <ImageSvg
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              href={require('assets/images/locker.png')}
            />
          </Svg>
          <View style={[styles.markerContainer, styles.lockerBg]}>
            <Text style={styles.lockerText}>Locker</Text>
          </View>
        </Marker>,
      );
    }

    if (orderStatus === 'picked' && runnerLocation) {
      markers.push(
        <Marker key="runner" style={styles.center} coordinate={runnerLocation} tracksViewChanges={false}>
          <Svg width={50} height={50}>
            <ImageSvg
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              href={require('assets/images/runner.png')}
            />
          </Svg>
          <View style={[styles.markerContainer, styles.runnerBg]}>
            <Text style={styles.runnerText}>Runner</Text>
          </View>
        </Marker>,
      );
    }

    if (orderStatus === 'delivered' && userLocation) {
      markers.push(
        <Marker key="user" style={styles.center} coordinate={userLocation} tracksViewChanges={false}>
          <Svg width={50} height={50}>
            <ImageSvg
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              href={require('assets/images/user.png')}
            />
          </Svg>
          <View style={[styles.markerContainer, styles.userBg]}>
            <Text style={styles.userText}>You</Text>
          </View>
        </Marker>,
      );
    }

    return markers;
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <SafeAreaProvider>
        <SafeAreaView style={styles.flex}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerText}>Order #{orderDetails?.orderNum}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Image source={require('assets/images/close.png')} style={styles.closeButton} />
            </TouchableOpacity>
          </View>
          {locationPermissionStatus === RESULTS.GRANTED || orderStatus !== 'delivered' ? (
            !isMapReady() ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.theme} />
              </View>
            ) : (
              <MapView
                provider={PROVIDER_GOOGLE}
                showsUserLocation={orderStatus === 'delivered'}
                followsUserLocation={orderStatus === 'delivered'}
                zoomControlEnabled={true}
                zoomEnabled={true}
                scrollEnabled={true}
                pitchEnabled={true}
                ref={mapRef}
                style={styles.map}
                loadingEnabled
                loadingIndicatorColor={colors.theme}
              >
                {renderMarkers()}
                {['received', 'on the way', 'ready', 'picked', 'delivered'].includes(orderStatus) &&
                  route?.length > 0 && (
                    <Polyline coordinates={route} strokeColor={colors.theme} strokeWidth={4} />
                  )}
              </MapView>
            )
          ) : (
            renderLocationPermissionMessage()
          )}
          <OpenSettingsModal
            isVisible={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            onOpenSettings={() => {
              setShowSettingsModal(false);
              openLocationSettings();
            }}
            message={settingsMessage}
          />
          <ScrollView style={styles.mainContent}>
            <View style={styles.mb20}>
              <OrderStatus mapScreen orderId={orderId} />
            </View>
            <View style={GlobalStyles.lightBorder}>
              <View style={[styles.lineItem, styles.mv5]}>
                <Text style={styles.lockerDetails}>Pickup Time</Text>
                <Text style={styles.lockerName}>{orderDetails?.deliveryTime}</Text>
              </View>
              <View style={[styles.lineItem, styles.mv5]}>
                <Text style={styles.lockerDetails}>Locker</Text>
                <TouchableOpacity
                  style={styles.lightBgCard}
                  onPress={() => openGoogleMaps(lockerLocation?.latitude, lockerLocation?.longitude)}
                >
                  <Text style={[styles.text, { color: colors.theme }]}>
                    {lockerDetails?.campus}, {lockerDetails?.lockerName}
                  </Text>
                  <View>
                    <Image source={require('assets/images/map-icon.png')} style={styles.icon} />
                  </View>
                </TouchableOpacity>
              </View>
              {orderStatus === 'picked' && (
                <View style={[styles.lineItem, styles.mv5]}>
                  <Text style={styles.lockerDetails}>Runner</Text>
                  <View style={styles.lightBgCard}>
                    <Text style={[styles.text, { color: colors.theme }]}>{runnerDetails?.name}</Text>
                    <TouchableOpacity onPress={() => makeCall(`+91${runnerDetails?.mobile}`)}>
                      <Image source={require('assets/images/call-icon.png')} style={styles.icon} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
            <View style={styles.lightBorder}>
              <View style={styles.restaurant}>
                <Image source={{ uri: restaurantDetails?.thumbnailUrl }} style={styles.restaurantImage} />
                <Text style={styles.restaurantName}>
                  {restaurantDetails?.name} {restaurantDetails?.branch && `, ' ${restaurantDetails?.branch}`}
                </Text>
              </View>
              <View style={styles.foodItems}>
                {orderDetails?.items.map(foodItem => (
                  <View key={foodItem.cartItemId} style={[styles.lineItem, styles.mb20]}>
                    <Text style={styles.mdText}>
                      {foodItem.name} x {foodItem.quantity}
                    </Text>
                    <Text style={[styles.mdText, styles.themeColor]}>₹{foodItem.price}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.lineItem}>
                <Text style={[styles.mdText, styles.blackColor]}>Total (Incl. GST)</Text>
                <Text style={[styles.mdText, styles.blackColor]}>₹{orderDetails?.totalPrice}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => makeCall('+919884713398')}>
              <Image style={styles.phone} source={require('assets/images/phone.png')} />
              <Text style={styles.buttonText}>Customer Care</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

export default TrackOrderModal;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 24,
    height: 24,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  center: {
    alignItems: 'center',
  },
  userBg: {
    backgroundColor: 'rgb(194, 233, 255)',
    marginTop: -10,
  },
  runnerBg: {
    backgroundColor: 'rgb(199, 194, 255)',
    marginTop: -10,
  },
  lockerBg: {
    backgroundColor: 'rgb(228, 255, 194)',
    marginTop: -10,
  },
  restaurantBg: {
    backgroundColor: colors.theme,
  },
  restaurantText: {
    color: 'rgba(156, 220, 255, 1)',
    fontWeight: 'bold',
  },
  userText: {
    color: 'rgb(0, 122, 255)',
    fontWeight: 'bold',
  },
  runnerText: {
    color: 'rgb(102, 76, 255)',
    fontWeight: 'bold',
  },
  lockerText: {
    color: 'rgb(0, 200, 83)',
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  contentContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    paddingHorizontal: 14,
    paddingTop: 20,
    height: '20%',
    borderTopColor: colors.themeLight,
    borderTopWidth: 1,
  },
  lockerDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: 'gray',
    marginTop: 4,
    marginBottom: 6,
  },
  lockerName: {
    textTransform: 'capitalize',
    color: colors.theme,
    fontWeight: '600',
    width: 180,
  },
  lightBorder: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderColor: colors.border,
    borderWidth: 1,
    marginVertical: 20,
  },
  restaurant: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderBottomColor: colors.themeLight,
    borderBottomWidth: 1,
    paddingBottom: 14,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  foodItems: {
    paddingTop: 20,
    borderBottomColor: colors.themeLight,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mv5: {
    marginVertical: 5,
  },
  mb20: {
    marginBottom: 20,
  },
  mdText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'gray',
  },
  themeColor: {
    color: colors.theme,
  },
  blackColor: {
    color: '#000',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(63, 128, 176)',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginBottom: 30,
  },
  phone: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: 'rgb(156, 220, 255)',
  },
  buttonText: {
    color: 'rgb(156, 220, 255)',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    color: colors.darkGray,
    fontWeight: '600',
    fontSize: 14,
    width: '70%',
    textTransform: 'capitalize',
  },
  lightBgCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#2E5E821A',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 180,
    minHeight: 40,
  },
  icon: {
    width: 26,
    height: 26,
  },
});
