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

//   const dispatch = useDispatch();

//   useEffect(() => {
//     dispatch(initializeCart());
//   }, [dispatch]);

//   return (
//     <SafeAreaView style={styles.fullWidth}>
//       <NavigationContainer>
//         {!isAuthenticated ? (
//           <AuthStackNavigator />
//         </NavigationContainer>
//       </SafeAreaView>
//     );
//   }

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
//         {!locationPermissionGranted && !manualLocation ? (
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
  const [locationPermissionChecked, setLocationPermissionChecked] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

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
    dispatch(initializeCart());
  }, [dispatch]);

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
