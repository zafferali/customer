import { Linking, Alert } from 'react-native';

const openGoogleMaps = async (destinationLat, destinationLng) => {
  try {
    const locationPermission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

    if (locationPermission === RESULTS.GRANTED) {
      const currentLocation = await getCurrentLocation();
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationLat},${destinationLng}&travelmode=driving`;
      Linking.openURL(url);
    } else {
      // If permission is not granted, open Google Maps with only the destination
      const url = `https://www.google.com/maps/search/?api=1&query=${destinationLat},${destinationLng}`;
      Linking.openURL(url);

      // Optionally, inform the user that directions are not available without permission
      Alert.alert(
        'Limited Functionality',
        'Location permission was not granted. Showing destination without directions.',
      );
    }
  } catch (error) {
    console.error('Error opening Google Maps:', error);
  }
};

export default openGoogleMaps;
