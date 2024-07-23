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
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import colors from 'constants/colors';
import Geolocation from 'react-native-geolocation-service';
import OrderStatus from '../components/OrderStatus';

const { width, height } = Dimensions.get('window');

const TrackOrderModal = ({ orderId, isVisible, onClose, runnerLocation, lockerLocation }) => {
  const [userLocation, setUserLocation] = useState(null);
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

  useEffect(() => {
    getCurrentLocation();
  }, [isVisible]);

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
                <Marker style={styles.center} coordinate={runnerLocation} tracksViewChanges={false}>
                  <Image source={require('assets/images/runner.png')} />
                  <View style={[styles.markerContainer, styles.runnerBg]}>
                    <Text style={styles.runnerText}>Runner</Text>
                  </View>
                </Marker>
                <Marker style={styles.center} coordinate={lockerLocation} tracksViewChanges={false}>
                  <Image source={require('assets/images/locker.png')} />
                  <View style={[styles.markerContainer, styles.lockerBg]}>
                    <Text style={styles.lockerText}>Locker</Text>
                  </View>
                </Marker>
                <Polyline
                  coordinates={[
                    runnerLocation,
                    { latitude: runnerLocation.latitude, longitude: lockerLocation.longitude },
                    lockerLocation,
                  ]}
                  strokeColor={colors.theme}
                  strokeWidth={2}
                  lineDashPattern={[3, 2]}
                />
              </MapView>
            )}
            <TouchableOpacity style={styles.mapCenter} onPress={getCurrentLocation}>
              <Image style={styles.mapCenterImage} source={require('assets/images/map-center.png')} />
            </TouchableOpacity>
            <OrderStatus orderId={orderId} />
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.button}>
                <Image style={styles.phone} source={require('assets/images/phone.png')} />
                <Text style={styles.buttonText}>Call Runner</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Image style={styles.phone} source={require('assets/images/phone.png')} />
                <Text style={styles.buttonText}>Call Customer Care</Text>
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
    backgroundColor: 'rgb(228, 255, 211)',
    marginTop: -22,
  },
  userText: {
    textAlign: 'center',
    color: colors.theme,
  },
  runnerText: {
    textAlign: 'center',
    color: 'rgb(107, 21, 147)',
  },
  lockerText: {
    textAlign: 'center',
    color: 'rgb(46, 130, 75)',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.theme,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  button: {
    backgroundColor: 'rgb(63, 128, 176)',
    padding: 10,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    borderColor: 'rgb(156, 220, 255)',
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  buttonText: {
    color: 'rgb(156, 220, 255)',
    fontWeight: 'bold',
  },
  phone: {
    width: 18,
    height: 18,
    tintColor: 'rgb(156, 220, 255)',
  },
  mt60: {
    marginTop: 60,
  },
});
