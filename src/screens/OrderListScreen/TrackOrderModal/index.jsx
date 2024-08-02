import React, { useState, useEffect, useRef } from 'react';
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
  const [route, setRoute] = useState([]);
  const mapRef = useRef(null);

  const getCurrentLocation = () => {
    if (isVisible) {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000,
            );
          }
        },
        error => {
          console.log('location err', error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    }
  };

  const fetchLockerLocation = async () => {
    try {
      const orderDoc = await firestore().collection('orders').doc(orderId).get();
      const lockerRef = orderDoc.data().locker;
      const lockerDoc = await lockerRef?.get();
      const lockerGeo = lockerDoc.data().location.geo;
      setLockerLocation({ latitude: lockerGeo.latitude, longitude: lockerGeo.longitude });
    } catch (error) {
      console.log('Error fetching locker location', error);
    }
  };

  const fetchRunnerLocation = () => {
    const orderRef = firestore().collection('orders').doc(orderId);
    orderRef.onSnapshot(async orderDoc => {
      const runnerRef = orderDoc.data()?.runner;
      runnerRef.onSnapshot(runnerDoc => {
        const runnerGeo = runnerDoc.data().geo;
        setRunnerLocation({ latitude: runnerGeo.latitude, longitude: runnerGeo.longitude });
      });
    });
  };

  const fetchRoute = async () => {
    if (runnerLocation && lockerLocation) {
      const apiKey = 'AIzaSyDDjWIA0w2194r9vmlPyKZ9M8j64BHU7Ss';
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${runnerLocation.latitude},${runnerLocation.longitude}&destination=${lockerLocation.latitude},${lockerLocation.longitude}&key=${apiKey}`;

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

  /**
   * Decodes a polyline string into an array of latitude and longitude coordinates.
   *
   * @param {string} t - The polyline string to decode.
   * @param {number} [e] - The precision of the decoded coordinates. Defaults to 5.
   * @return {Array<{latitude: number, longitude: number}>} An array of latitude and longitude coordinates.
   */
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

  useEffect(() => {
    if (isVisible) {
      getCurrentLocation();
      fetchLockerLocation();
      fetchRunnerLocation();
    }
  }, [isVisible]);

  useEffect(() => {
    fetchRoute();
  }, [runnerLocation, lockerLocation]);

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
            {userLocation && (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker style={styles.center} coordinate={userLocation} tracksViewChanges={false}>
                  <Image source={require('assets/images/user.png')} />
                  <View style={[styles.markerContainer, styles.userBg]}>
                    <Text style={styles.userText}>You</Text>
                  </View>
                </Marker>
                {runnerLocation && (
                  <Marker style={styles.center} coordinate={runnerLocation} tracksViewChanges={false}>
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
                  </Marker>
                )}
                {lockerLocation && (
                  <Marker style={styles.center} coordinate={lockerLocation} tracksViewChanges={false}>
                    <Image source={require('assets/images/locker.png')} />
                    <View style={[styles.markerContainer, styles.lockerBg]}>
                      <Text style={styles.lockerText}>Locker</Text>
                    </View>
                  </Marker>
                )}
                {route.length > 0 && (
                  <Polyline coordinates={route} strokeColor={colors.theme} strokeWidth={2} />
                )}
              </MapView>
            )}
            <TouchableOpacity style={styles.mapCenter} onPress={getCurrentLocation}>
              <Image style={styles.mapCenterImage} source={require('assets/images/map-center.png')} />
            </TouchableOpacity>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  mapCenter: {
    position: 'absolute',
    bottom: 230,
    right: 14,
    backgroundColor: colors.themeLight,
    padding: 6,
    borderRadius: 100,
  },
  mapCenterImage: {
    width: 20,
    height: 20,
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
    position: 'relative',
    bottom: 0,
    backgroundColor: colors.theme,
    width: '100%',
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
});
