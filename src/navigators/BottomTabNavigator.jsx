import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import TabItem from 'components/common/TabItem';
import { HomeStackScreen, OrderListStackScreen, ProfileStackScreen } from './StackNavigator';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="TimeSlotScreen"
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
            tabBarIcon: ({ focused }) => (
              <TabItem focused={focused} iconSrc={require('assets/images/home-icon.png')} tabName="Home" />
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
            <TabItem focused={focused} iconSrc={require('assets/images/orders-icon.png')} tabName="Orders" />
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
            <TabItem focused={focused} iconSrc={require('assets/images/user-icon.png')} tabName="Profile" />
          ),
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
