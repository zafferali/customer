/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Image,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import colors from 'constants/colors';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import { Svg, Image as ImageSvg } from 'react-native-svg';
import OrderStatus from '../components/OrderStatus';

const { height } = Dimensions.get('window');

const TrackOrderModal = ({ orderId, isVisible, onClose }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [runnerLocation, setRunnerLocation] = useState(null);
  const [lockerLocation, setLockerLocation] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [orderStatus, setOrderStatus] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingLocker, setIsLoadingLocker] = useState(true);
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);
  const mapRef = useRef(null);

  const getCurrentLocation = () => {
    if (isVisible) {
      setIsLoadingUser(true);
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setIsLoadingUser(false);
        },
        error => {
          setIsLoadingUser(false);
          console.log('location err', error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    }
  };

  const fetchLockerLocation = async () => {
    try {
      setIsLoadingLocker(true);
      const orderDoc = await firestore().collection('orders').doc(orderId).get();
      const lockerRef = orderDoc.data()?.locker;
      const lockerDoc = await lockerRef?.get();
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
      const restaurantGeo = restaurantDoc.data().location.geo;
      setRestaurantLocation({ latitude: restaurantGeo.latitude, longitude: restaurantGeo.longitude });
    } catch (error) {
      console.log('Error fetching restaurant location', error);
    } finally {
      setIsLoadingRestaurant(false);
    }
  };

  const fetchRunnerLocation = () => {
    const orderRef = firestore().collection('orders').doc(orderId);

    let orderUnsubscribe = null;
    let runnerUnsubscribe = null;

    try {
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
                console.error('Error in runner listener:', error);
              },
            );
          }
        },
        error => {
          console.error('Error in order listener:', error);
        },
      );
    } catch (error) {
      console.error('Error setting up listeners:', error);
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
  });

  useEffect(() => {
    if (isVisible) {
      getCurrentLocation();
      fetchLockerLocation();
      fetchRunnerLocation();
      fetchRestaurantLocation();
    }
  }, [isVisible]);

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
  ]);

  const isMapReady = () => {
    switch (orderStatus) {
      case 'received':
      case 'on the way':
      case 'ready':
        return !isLoadingRestaurant;
      case 'picked':
        return !isLoadingLocker && runnerLocation;
      case 'delivered':
        return !isLoadingUser && !isLoadingLocker;
      case 'completed':
        return !isLoadingLocker;
      default:
        return !isLoadingUser;
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
    <SafeAreaView>
      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modal}>
          <View style={styles.container}>
            <View style={[styles.header, Platform.OS === 'ios' && styles.mt60]}>
              <Text style={styles.headerText}>Track Order</Text>
              <TouchableOpacity onPress={onClose}>
                <Image source={require('assets/images/close.png')} style={styles.closeButton} />
              </TouchableOpacity>
            </View>
            {!isMapReady() ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.theme} />
              </View>
            ) : (
              <MapView
                showsUserLocation={true}
                followsUserLocation={true}
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
                    <Polyline coordinates={route} strokeColor={colors.theme} strokeWidth={2} />
                  )}
              </MapView>
            )}
            <View style={styles.bottomSection}>
              <OrderStatus mapScreen orderId={orderId} />
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button}>
                  <Image style={styles.phone} source={require('assets/images/phone.png')} />
                  <Text style={styles.buttonText}>Call Runner</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                  <Image style={styles.phone} source={require('assets/images/phone.png')} />
                  <Text style={styles.buttonText}>Customer Care</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TrackOrderModal;

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  container: {
    height,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.theme,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 20,
    height: 20,
  },
  map: {
    flex: 1,
  },
  // mapCenter: {
  //   position: 'absolute',
  //   bottom: 230,
  //   right: 14,
  //   backgroundColor: colors.themeLight,
  //   padding: 6,
  //   borderRadius: 100,
  // },
  // mapCenterImage: {
  //   width: 20,
  //   height: 20,
  // },
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: colors.theme,
    width: '100%',
  },
  bottomSection: {
    position: 'realtive',
    bottom: 0,
    backgroundColor: colors.theme,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(63, 128, 176)',
    padding: 10,
    borderRadius: 10,
    borderColor: 'rgb(156, 220, 255)',
    borderWidth: 3,
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
  mt60: {
    marginTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
