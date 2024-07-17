import { Alert, Linking } from 'react-native';
import { requestCallPermission } from './permissions';

export const makeCall = async phoneNumber => {
  const isPermissionGranted = await requestCallPermission();

  if (isPermissionGranted) {
    const phoneNumberString = `tel:${phoneNumber}`;
    Linking.openURL(phoneNumberString).catch(err => {
      console.error('An error occurred', err);
      Alert.alert('Failed to make a call', 'An unexpected error occurred');
    });
  } else {
    // The Alert here is optional since the alert for permission denied is in the global function
    console.log('Call permission denied');
  }
};
