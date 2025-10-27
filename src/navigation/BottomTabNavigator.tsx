import React from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {CurvedBottomBarExpo} from 'react-native-curved-bottom-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CardsScreen from '../screens/CardsScreen';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
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
    </Stack.Navigator>
  );
};

const CardsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="CardsMain" component={CardsScreen} />
    </Stack.Navigator>
  );
};

const BottomTabNavigator = () => {
  const _renderIcon = (routeName: string, selectedTab: string) => {
    let icon = '';

    switch (routeName) {
      case 'Home':
        icon = 'home-outline';
        break;
      case 'Profile':
        icon = 'person-outline';
        break;
    }

    return (
      <Ionicons
        name={icon}
        size={25}
        color={routeName === selectedTab ? '#00b894' : 'gray'}
      />
    );
  };

  const renderTabBar = ({routeName, selectedTab, navigate}: any) => {
    return (
      <TouchableOpacity
        onPress={() => navigate(routeName)}
        style={styles.tabbarItem}>
        {_renderIcon(routeName, selectedTab)}
      </TouchableOpacity>
    );
  };

  return (
    <CurvedBottomBarExpo.Navigator
      type="DOWN"
      style={styles.bottomBar}
      shadowStyle={styles.shadow}
      height={60}
      circleWidth={50}
      bgColor="#f8f9fa"
      initialRouteName="Home"
      borderTopLeftRight
      borderColor="#DCDADA"
      borderWidth={1}
      width={undefined}
      circlePosition={undefined}
      screenListeners={undefined}
      id={undefined}
      defaultScreenOptions={undefined}
      backBehavior={undefined}
      screenOptions={{
        headerShown: false,
      }}
      renderCircle={({selectedTab, navigate}: any) => (
        <Animated.View style={styles.btnCircleUp}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigate('Cards')}>
            <Ionicons name={'add'} color="white" size={30} />
          </TouchableOpacity>
        </Animated.View>
      )}
      tabBar={renderTabBar}>
      <CurvedBottomBarExpo.Screen
        name="Home"
        position="LEFT"
        component={HomeStack}
        options={{headerShown: false}}
      />
      <CurvedBottomBarExpo.Screen
        name="Cards"
        component={CardsStack}
        position="CENTER"
        options={{headerShown: false}}
      />
      <CurvedBottomBarExpo.Screen
        name="Profile"
        component={ProfileStack}
        position="RIGHT"
        options={{headerShown: false}}
      />
    </CurvedBottomBarExpo.Navigator>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#DDDDDD',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {},
  btnCircleUp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00b894',
    bottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomTabNavigator;

