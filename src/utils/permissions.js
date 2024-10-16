import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';

import Geolocation from 'react-native-geolocation-service';

export const requestCallPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CALL_PHONE, {
        title: 'Call Permission',
        message: 'This app needs access to your phone so you can make direct calls from the app.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert('Permission Required', 'Call permission is required to make phone calls');
        return false;
      }
    } catch (err) {
      Alert.alert('Permission Error', 'Failed to request call permission');
      return false;
    }
  } else if (Platform.OS === 'ios') {
    // iOS doesn't require explicit permission to make phone calls
    return true;
  }
};

export const requestNotificationPermission = async () => {
  try {
    const currentStatus = await messaging().hasPermission();

    if (currentStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      return true;
    } else if (currentStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
      const permissionResult = await request(
        Platform.OS === 'android' ? PERMISSIONS.ANDROID.NOTIFICATIONS : PERMISSIONS.IOS.NOTIFICATIONS,
      );

      if (permissionResult === RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const promptForSettings = () => {
  Alert.alert(
    'Notification Permission',
    'Notifications are disabled. Please enable them in settings to receive updates.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ],
  );
};

export const checkLocationPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      return await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    } else if (Platform.OS === 'android') {
      return await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    }
  } catch (error) {
    return RESULTS.UNAVAILABLE;
  }
};

export const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      return await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    } else if (Platform.OS === 'android') {
      return await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    }
  } catch (error) {
    return RESULTS.UNAVAILABLE;
  }
};

export const openLocationSettings = () => {
  Linking.openSettings();
};

export const checkLocationEnabled = () => {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  });
};
