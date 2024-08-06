import { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  Modal,
  Platform,
  StyleSheet,
  Button,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { RESULTS, request, check, PERMISSIONS } from 'react-native-permissions';
import { BlurView } from '@react-native-community/blur'; // Use expo-blur if using Expo
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

  const requestLocationPermission = async () => {
    console.log('Pressed');
    try {
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        setModalVisible(false);
      } else {
        handlePermissionDenied();
        // setModalVisible(true);
      }
      setPermissionStatus(result);
    } catch (error) {
      console.error(error);
    }
  };

  // const getLocation = () => {
  //   Geolocation.getCurrentPosition(
  //     position => {
  //       setLocation(position);
  //       setErrorMsg(null);
  //     },
  //     error => {
  //       // setErrorMsg("Error getting location");
  //       console.error(error);
  //     },
  //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
  //   );
  // };

  const handlePermissionDenied = () => {
    Alert.alert(
      'Location Permission Required',
      'This app needs access to your location. Would you like to open settings and grant permission?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ],
    );
  };

  useEffect(() => {
    const checkPermission = async () => {
      const result = await check(permission);
      if (result === RESULTS.GRANTED) {
        getLocation();
      } else {
        requestLocationPermission();
      }
      setPermissionStatus(result);
    };

    checkPermission();
  }, []);

  const openAppSettings = () => {
    console.log('Location settings');
    Linking.openSettings();
  };

  const handleButtonPress = async () => {
    // if (permissionStatus === RESULTS.BLOCKED) {
    // Open app settings if permission is blocked
    openAppSettings();
    // }
    // else {
    //   // Request permission directly if it's denied
    //   console.log('handle press', permissionStatus);
    //   await request(permission);
    // }
    // setModalVisible(false);
  };

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

            {/* <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 20 }}>
                {location
                  ? `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`
                  : errorMsg || "Requesting location permission..."}
              </Text>
              <Button
                title="Request Location Permission"
                onPress={requestLocationPermission}
              />
            </View> */}
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
