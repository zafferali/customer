import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from 'screens/Auth/LoginScreen';
import IntroScreen from 'screens/IntroScreen';

const AuthStack = createStackNavigator();

export const AuthStackNavigator = ({ authenticate }) => (
  <AuthStack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="LoginScreen" component={LoginScreen} authenticate={authenticate} />
    {/* <AuthStack.Screen name="IntroScreen" component={IntroScreen}/> */}
  </AuthStack.Navigator>
);
