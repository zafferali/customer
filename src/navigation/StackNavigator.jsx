import React from 'react';
import { StyleSheet } from 'react-native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import HomeScreen from 'screens/HomeScreen';
import TimeSlotScreen from 'screens/TimeSlotScreen';
import RestaurantHomeScreen from 'screens/HomeScreen/RestaurantHomeScreen';
import CartScreen from 'screens/CartScreen';
import LockerScreen from 'screens/LockerScreen';
import OrderListScreen from 'screens/OrderListScreen';
import OrderStatusScreen from 'screens/OrderListScreen/OrderStatusScreen';
import ProfileScreen from 'screens/ProfileScreen';
import SettingsScreen from 'screens/ProfileScreen/SettingsScreen';


const HomeStack = createStackNavigator();
const OrderListStack = createStackNavigator();
const ProfileStack = createStackNavigator();


export const HomeStackScreen = () => (

    <HomeStack.Navigator
        initialRouteName='TimeSlotScreen'
        screenOptions={{
            headerTitleStyle: styles.headerTitle,
            headerBackTitleVisible: false, // Hides the back title next to the back button (iOS)
            gestureEnabled: true, // Enable gesture navigation
            ...TransitionPresets.SlideFromRightIOS,
            headerShown: false,
        }}
    >   
        <HomeStack.Screen
            name="TimeSlotScreen"
            component={TimeSlotScreen}
        />
        <HomeStack.Screen
            name="HomeScreen"
            component={HomeScreen}
        />
        <HomeStack.Screen
            name="RestaurantHomeScreen"
            component={RestaurantHomeScreen}
        />
         <HomeStack.Screen
            name="CartScreen"
            component={CartScreen}
        />
         <HomeStack.Screen
            name="LockerScreen"
            component={LockerScreen}
        />
    </HomeStack.Navigator>
);

export const OrderListStackScreen = () => (

    <OrderListStack.Navigator
        screenOptions={{
            headerTitleStyle: styles.headerTitle,
            headerBackTitleVisible: false, // Hides the back title next to the back button (iOS)
            gestureEnabled: true,
            ...TransitionPresets.SlideFromRightIOS,
            headerShown: false,
        }}
    >
        <OrderListStack.Screen
            name="OrderListScreen"
            component={OrderListScreen}
        />
        <OrderListStack.Screen
            name="OrderStatusScreen"
            component={OrderStatusScreen}
        />
    </OrderListStack.Navigator>
);


export const ProfileStackScreen = () => (
    <ProfileStack.Navigator
        screenOptions={{
            headerTitleStyle: styles.headerTitle,
            gestureEnabled: true,
            ...TransitionPresets.SlideFromRightIOS,
            headerShown: false,
        }}
    >
        <ProfileStack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ headerShown: false }}
        />
        <ProfileStack.Screen
            name="SettingsScreen"
            component={SettingsScreen}
            options={{ title: 'Settings', headerTitleStyle: styles.headerSmallTitle }}
        />
    </ProfileStack.Navigator>
);


const styles = StyleSheet.create({
    headerTitle: {
        fontSize: 38,
        fontWeight: 'bold',
    },
    headerSmallTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    }
})
