import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import TabItem from 'components/common/TabItem';
import { HomeStackScreen, OrderListStackScreen, ProfileStackScreen } from './StackNavigator';

const Tab = createBottomTabNavigator();

const tabIt = (focused, tabName) => {
  let iconSrc;
  switch (tabName) {
    case 'Home':
      iconSrc = require('assets/images/home-icon.png');
      break;
    case 'Orders':
      iconSrc = require('assets/images/orders-icon.png');
      break;
    case 'Profile':
      iconSrc = require('assets/images/user-icon.png');
      break;
    default:
      iconSrc = null;
  }
  return <TabItem focused={focused} iconSrc={iconSrc} tabName={tabName} />;
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeStackScreen" // Ensure this is correct
      screenOptions={{
        tabBarShowLabel: false,
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
            'RestaurantScreen',
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
            tabBarIcon: ({ focused }) => tabIt(focused, 'Home'),
          };
        }}
      />

      {/* Orders */}
      <Tab.Screen
        name="OrderListStackScreen"
        component={OrderListStackScreen}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route);
          return {
            tabBarStyle: {
              display: routeName === 'OrderStatusScreen' ? 'none' : 'flex',
              height: 65,
              paddingTop: 10,
            },
            tabBarIcon: ({ focused }) => tabIt(focused, 'Orders'),
          };
        }}
      />

      {/* Profile */}
      <Tab.Screen
        name="ProfileStackScreen"
        component={ProfileStackScreen}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route);
          return {
            tabBarStyle: {
              display: routeName === 'SettingsScreen' ? 'none' : 'flex',
              height: 65,
              justifyContent: 'center',
              paddingTop: 10,
            },
            tabBarIcon: ({ focused }) => tabIt(focused, 'Profile'),
          };
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
