import React, { useState, useEffect } from 'react';
import { StyleSheet, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { setCustomText } from 'react-native-global-props';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import IntroScreen from 'screens/IntroScreen';
import { RESULTS } from 'react-native-permissions';
import LocationPermissionScreen from 'screens/LocationPermissionScreen';
import BottomTabNavigator from './navigators/BottomTabNavigator';
import { AuthStackNavigator } from './navigators/AuthStackNavigator';
import { checkLocationPermission } from './utils/permissions';

const customTextProps = {
  style: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    color: 'black',
    fontWeight: '600',
  },
};
setCustomText(customTextProps);

const App = () => {
  const Stack = createStackNavigator();
  const { isAuthenticated, isFirstTime, manualLocation } = useSelector(state => state.authentication);
  console.log('hi', isAuthenticated);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    checkInitialPermission();

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const checkInitialPermission = async () => {
    const status = await checkLocationPermission();
    setLocationPermissionGranted(status === RESULTS.GRANTED);
  };

  const handleAppStateChange = nextAppState => {
    if (nextAppState === 'active') {
      checkInitialPermission();
    }
  };

  const handlePermissionGranted = () => {
    setLocationPermissionGranted(true);
  };

  return (
    <SafeAreaView style={styles.fullWidth}>
      <NavigationContainer>
        {!isAuthenticated ? (
          <AuthStackNavigator />
        ) : isFirstTime ? (
          <Stack.Navigator
            screenOptions={{
              gestureEnabled: true,
              ...TransitionPresets.SlideFromRightIOS,
              headerShown: false,
            }}
          >
            <Stack.Screen name="IntroScreen" component={IntroScreen} />
          </Stack.Navigator>
        ) : !locationPermissionGranted && !manualLocation ? (
          <LocationPermissionScreen onPermissionGranted={handlePermissionGranted} />
        ) : (
          <BottomTabNavigator />
        )}
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    flex: 1,
  },
});

export default App;
