import { PermissionsAndroid, Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

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
      console.log('Notification permissions are enabled');
      return true;
    } else if (currentStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
      const permissionResult = await request(
        Platform.OS === 'android' ? PERMISSIONS.ANDROID.NOTIFICATIONS : PERMISSIONS.IOS.NOTIFICATIONS,
      );

      if (permissionResult === RESULTS.GRANTED) {
        console.log('Notification permissions granted');
        return true;
      } else {
        console.log('Notification permissions not granted');
        return false;
      }
    } else {
      console.log('Notification permissions are not enabled');
      return false;
    }
  } catch (error) {
    console.error('Failed to check notification permissions', error);
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
