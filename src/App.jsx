import React, { useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import {AuthStackNavigator} from './navigation/AuthStackNavigator';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import { setCustomText } from 'react-native-global-props';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import IntroScreen from 'screens/IntroScreen';

const customTextProps = {
  style: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    color: 'black',
    fontWeight: '600',
  }
};
setCustomText(customTextProps);

function App() {
  const Stack = createStackNavigator()
  const isAuthenticated = useSelector(state => state.authentication.isAuthenticated)
  const isFirstTime = useSelector(state => state.authentication.isFirstTime)
  
  return (
    <SafeAreaView style={{flex: 1}}>
      {/* <StatusBar backgroundColor="transparent" translucent={true} /> */}
        <NavigationContainer>
          {!isAuthenticated ? 
          <AuthStackNavigator/> 
          : isFirstTime? 
          <Stack.Navigator
          screenOptions={{
            gestureEnabled: true, // Enable gesture navigation
            ...TransitionPresets.SlideFromRightIOS,
            headerShown: false}}
          >
            <Stack.Screen name='IntroScreen' component={IntroScreen} /> 
          </Stack.Navigator>
          : <BottomTabNavigator /> }
        </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

});

export default App;