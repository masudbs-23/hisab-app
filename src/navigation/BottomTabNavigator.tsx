import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import TransactionScreen from '../screens/TransactionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import NotificationScreen from '../screens/NotificationScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

const getTabBarVisibility = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  const hiddenScreens = ['Statistics', 'Notification', 'PrivacyPolicy'];
  
  if (routeName && hiddenScreens.includes(routeName)) {
    return 'none';
  }
  return 'flex';
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={({route}) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
          },
        })}
      />
      <Tab.Screen name="Transaction" component={TransactionScreen} />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={({route}) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

