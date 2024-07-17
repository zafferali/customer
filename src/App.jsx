import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { setCustomText } from 'react-native-global-props';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import IntroScreen from 'screens/IntroScreen';
import BottomTabNavigator from './navigators/BottomTabNavigator';
import { AuthStackNavigator } from './navigators/AuthStackNavigator';

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
  const isAuthenticated = useSelector(state => state.authentication.isAuthenticated);
  const isFirstTime = useSelector(state => state.authentication.isFirstTime);

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
