import { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { RESULTS, request, check, PERMISSIONS, openSettings } from 'react-native-permissions';
import { BlurView } from '@react-native-community/blur'; // Use expo-blur if using Expo
import Geolocation from 'react-native-geolocation-service';
// import { requestLocationPermission, openLocationSettings } from 'utils/permissions';
import LocationSVG from 'components/svg/LocationSVG';
import LocationMarker from 'components/svg/LocationMarker';

const LocationModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

  const permission = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  });

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleOutsidePress = () => {
    setModalVisible(false);
  };

  const checkLocationPermission = async () => {
    const result = await check(permission);
    setPermissionStatus(result);
    if (result !== RESULTS.GRANTED) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const result = await request(permission);
      setPermissionStatus(result);
      return result;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setPermissionStatus(RESULTS.UNAVAILABLE);
      return RESULTS.UNAVAILABLE;
    }
  };

  const handleRequestPermission = async () => {
    const result = await request(permission);
    if (result === RESULTS.GRANTED) {
      setModalVisible(false);
      // You can now use Geolocation
      Geolocation.getCurrentPosition(
        position => {
          console.log(position);
        },
        error => console.log('Error', error),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
      );
    }
  };

  // const openAppSettings = () => {
  //   if (Platform.OS === 'ios') {
  //     Linking.openSettings().catch(() => Alert.alert('Unable to open settings'));
  //   } else {
  //     Linking.openSettings().catch(() => Alert.alert('Unable to open settings'));
  //   }
  // };

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openSettings();
    } else {
      Linking.openSettings();
    }
  };

  const handleButtonPress = async () => {
    if (permissionStatus === RESULTS.BLOCKED) {
      // Open app settings if permission is blocked
      openAppSettings();
    } else {
      // Request permission directly if it's denied
      await requestLocationPermission();
    }
    setModalVisible(false);
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    checkLocationPermission();
    console.log('Hello Sir', permissionStatus);
  }, [permissionStatus]);

  // const requestPermission = async () => {
  //   const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION); // Use PERMISSIONS.IOS.LOCATION_WHEN_IN_USE for iOS
  //   setPermissionStatus(result);

  //   if (result === RESULTS.GRANTED) {
  //     Alert.alert('Permission Granted', 'You can now use location services.');
  //   } else {
  //     Alert.alert('Permission Denied', 'You will not be able to use location services.');
  //   }

  //   // setModalVisible(false);
  // };

  // useEffect(() => {
  //   requestPermission();
  //   // requestLocationPermission();
  //   const checkPermissionsAndLocation = async () => {
  //     const permissionStatus = await checkLocationPermission();
  //     const locationEnabled = await checkLocationEnabled();

  //     if (permissionStatus === RESULTS.DENIED || permissionStatus === RESULTS.BLOCKED || !locationEnabled) {
  //       setModalVisible(true);
  //     }
  //   };

  //   checkPermissionsAndLocation();
  // }, []);

  // const handleOpenSettings = () => {
  //   openLocationSettings();
  //   setModalVisible(false);
  // };

  // const handleRequestPermission = async () => {
  //   await requestLocationPermission();
  //   // if (status === RESULTS.GRANTED) {
  //   //   setModalVisible(false);
  //   // } else {
  //   //   Alert.alert('Location Permission', 'Location permission is required for this feature.', [
  //   //     { text: 'OK' },
  //   //   ]);
  //   // }
  // };

  const titleText = 'Location Permission is Off';
  const bodyText = 'Enable device location for accurate, hassle free delivery to your lockers.';

  return (
    <View style={styles.container}>
      {/* <Button title="Show Modal" onPress={toggleModal} /> */}

      <Modal transparent={true} animationType="slide" visible={modalVisible} onRequestClose={toggleModal}>
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.modalBackground}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light" // You can use 'dark', 'extraLight', etc.
              blurAmount={20}
              reducedTransparencyFallbackColor="white"
            />
            <View>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  {/* <Image style={styles.locationIcon} source={require('assets/images/location.svg')} /> */}
                  <View style={styles.content}>
                    <LocationSVG />
                    <Text style={styles.titleText}>{titleText}</Text>
                    <Text style={styles.modalText}>{bodyText}</Text>
                  </View>
                  <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
                    <LocationMarker style={styles.marker} />
                    <Text style={[styles.buttonText, styles.mainColor]}>Enable Location</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#2E5E82',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContainer: {
    width: 350,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 15,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  marker: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#2b2b2b',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default LocationModal;
