// import { useState, useEffect } from 'react';
// import { StyleSheet, AppState } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
// import { setCustomText } from 'react-native-global-props';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useSelector, useDispatch } from 'react-redux';
// import IntroScreen from 'screens/IntroScreen';
// import { RESULTS } from 'react-native-permissions';
// import LocationPermissionScreen from 'screens/LocationPermissionScreen';
// import { initializeCart } from 'redux/slices/initializeCart';
// import { setTimeSlot } from 'redux/slices/restaurantsSlice';
// import BottomTabNavigator from './navigators/BottomTabNavigator';
// import { AuthStackNavigator } from './navigators/AuthStackNavigator';
// import { checkLocationPermission } from './utils/permissions';

// const customTextProps = {
//   style: {
//     fontFamily: 'Inter-SemiBold',
//     fontSize: 28,
//     color: 'black',
//     fontWeight: '600',
//   },
// };

// setCustomText(customTextProps);

// const App = () => {
//   const Stack = createStackNavigator();
//   const { isAuthenticated, isFirstTime, manualLocation } = useSelector(state => state.authentication);
//   const [locationPermissionChecked, setLocationPermissionChecked] = useState(false);
//   const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

//   const dispatch = useDispatch();

//   useEffect(() => {
//     checkInitialPermission();
//     const subscription = AppState.addEventListener('change', handleAppStateChange);
//     return () => {
//       subscription.remove();
//     };
//   }, []);

//   const checkInitialPermission = async () => {
//     const status = await checkLocationPermission();
//     setLocationPermissionGranted(status === RESULTS.GRANTED);
//     setLocationPermissionChecked(true);
//   };

//   const handleAppStateChange = nextAppState => {
//     if (nextAppState === 'active') {
//       checkInitialPermission();
//     }
//   };

//   const handlePermissionGranted = () => {
//     setLocationPermissionGranted(true);
//   };

//   useEffect(() => {
//     dispatch(setTimeSlot(selectedTime));
//     dispatch(initializeCart());
//   }, [dispatch]);

//   if (isFirstTime) {
//     return (
//       <SafeAreaView style={styles.fullWidth}>
//         <NavigationContainer>
//           <Stack.Navigator
//             screenOptions={{
//               gestureEnabled: true,
//               ...TransitionPresets.SlideFromRightIOS,
//               headerShown: false,
//             }}
//           >
//             <Stack.Screen name="IntroScreen" component={IntroScreen} />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </SafeAreaView>
//     );
//   }

//   if (!locationPermissionChecked) {
//     // Show a loading screen or splash screen while checking permissions
//     return null;
//   }

//   return (
//     <SafeAreaView style={styles.fullWidth}>
//       <NavigationContainer>
//         {!isAuthenticated ? (
//           <AuthStackNavigator />
//         ) : !locationPermissionGranted && !manualLocation ? (
//           <LocationPermissionScreen onPermissionGranted={handlePermissionGranted} />
//         ) : (
//           <BottomTabNavigator />
//         )}
//       </NavigationContainer>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   fullWidth: {
//     flex: 1,
//   },
// });

// export default App;
import { useState, useEffect } from 'react';
import { StyleSheet, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { setCustomText } from 'react-native-global-props';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import IntroScreen from 'screens/IntroScreen';
import { RESULTS } from 'react-native-permissions';
import LocationPermissionScreen from 'screens/LocationPermissionScreen';
import { initializeCart } from 'redux/slices/initializeCart';
import { setTimeSlot } from 'redux/slices/restaurantsSlice';
import BottomTabNavigator from './navigators/BottomTabNavigator';
import { AuthStackNavigator } from './navigators/AuthStackNavigator';
import { checkLocationPermission } from './utils/permissions';

const customTextProps = {
  style: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
};

setCustomText(customTextProps);

const App = () => {
  const Stack = createStackNavigator();
  const { isAuthenticated, isFirstTime, manualLocation } = useSelector(state => state.authentication);
  const [locationPermissionChecked, setLocationPermissionChecked] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  const dispatch = useDispatch();

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
    setLocationPermissionChecked(true);
  };

  const handleAppStateChange = nextAppState => {
    if (nextAppState === 'active') {
      checkInitialPermission();
    }
  };

  const handlePermissionGranted = () => {
    setLocationPermissionGranted(true);
  };

  useEffect(() => {
    const roundToNext15 = date => {
      const minutes = date.getMinutes();
      const remainder = minutes % 15;
      if (remainder > 0) {
        date.setMinutes(minutes + (15 - remainder));
      }
      date.setSeconds(0);
      date.setMilliseconds(0);
      return date;
    };

    const currentTime = new Date();
    const timeIn60Mins = new Date(currentTime.getTime() + 60 * 60 * 1000); // 60 minutes later

    const roundedTime = roundToNext15(timeIn60Mins);

    // Format the time to 'HH:mm'
    const formattedTime = roundedTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    setSelectedTime(formattedTime);
  }, []);

  useEffect(() => {
    if (selectedTime) {
      dispatch(setTimeSlot(selectedTime));
    }
    dispatch(initializeCart());
  }, [dispatch, selectedTime]);

  if (isFirstTime) {
    return (
      <SafeAreaView style={styles.fullWidth}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              gestureEnabled: true,
              ...TransitionPresets.SlideFromRightIOS,
              headerShown: false,
            }}
          >
            <Stack.Screen name="IntroScreen" component={IntroScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    );
  }

  if (!locationPermissionChecked) {
    // Show a loading screen or splash screen while checking permissions
    return null;
  }

  return (
    <SafeAreaView style={styles.fullWidth}>
      <NavigationContainer>
        {!isAuthenticated ? (
          <AuthStackNavigator />
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
