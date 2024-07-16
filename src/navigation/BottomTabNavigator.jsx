import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { View, StyleSheet, Image, Text } from 'react-native';
import { HomeStackScreen, OrderListStackScreen, ProfileStackScreen } from './StackNavigator';
import colors from '../constants/colors';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="TimeSlotScreen"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.menuContainer,
        headerShown: false,
      }}
    >
      {/* Home */}
      <Tab.Screen
        name="HomeStackScreen"
        component={HomeStackScreen}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('HomeStackScreen', {
              screen: 'HomeScreen',
            });
          },
        })}
        options={({ route }) => {
          const hideOnScreens = [
            'TimeSlotScreen',
            'RestaurantHomeScreen',
            'CartScreen',
            'LockerScreen',
            'PaymentScreen',
            'OrderStatusScreen',
          ];
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'TimeSlotScreen';

          return {
            tabBarStyle: {
              display: hideOnScreens.includes(routeName) ? 'none' : 'flex',
              height: 65,
              paddingTop: 10,
            },
            tabBarIcon: ({ focused }) => (
              <View style={styles.menuItem}>
                <Image
                  source={require('assets/images/home-icon.png')}
                  resizeMode="contain"
                  style={[styles.menuIcon, { tintColor: focused ? colors.theme : colors.textLight }]}
                />
                <Text style={[styles.menuText, { color: focused ? colors.theme : colors.textLight }]}>
                  Home
                </Text>
              </View>
            ),
          };
        }}
      />

      {/* Orders */}
      <Tab.Screen
        name="OrderListStackScreen"
        component={OrderListStackScreen}
        options={({ route }) => ({
          tabBarStyle: {
            display: getFocusedRouteNameFromRoute(route) === 'OrderStatusScreen' ? 'none' : 'flex',
            height: 65,
            paddingTop: 10,
          },
          tabBarIcon: ({ focused }) => (
            <View style={styles.menuItem}>
              <Image
                source={require('assets/images/orders-icon.png')}
                resizeMode="contain"
                style={[styles.menuIcon, { tintColor: focused ? colors.theme : colors.textLight }]}
              />
              <Text style={[styles.menuText, { color: focused ? colors.theme : colors.textLight }]}>
                Orders
              </Text>
            </View>
          ),
        })}
      />

      {/* Profile */}
      <Tab.Screen
        name="ProfileStackScreen"
        component={ProfileStackScreen}
        options={({ route }) => ({
          tabBarStyle: {
            display: getFocusedRouteNameFromRoute(route) === 'SettingsScreen' ? 'none' : 'flex',
            height: 65,
            justifyContent: 'center',
            paddingTop: 10,
          },
          tabBarIcon: ({ focused }) => (
            <View style={styles.menuItem}>
              <Image
                source={require('assets/images/user-icon.png')}
                resizeMode="contain"
                style={[styles.menuIcon, { tintColor: focused ? colors.theme : colors.textLight }]}
              />
              <Text style={[styles.menuText, { color: focused ? colors.theme : colors.textLight }]}>
                Profile
              </Text>
            </View>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  //   menuContainer: {
  //     height: 100,
  //     paddingVertical: 40,
  //     backgroundColor: '#FAFAFA',
  //     borderTopWidth: 1,
  //     borderTopColor: '#E0E0E0',
  //   },
  menuItem: {
    alignItems: 'center',
    // marginVertical: 20,
  },
  menuIcon: {
    width: 18,
    height: 20,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
});

export default BottomTabNavigator;
