import React from 'react';
import {View, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

const CustomTabBar = ({state, descriptors, navigation}: any) => {
  const icons: any = {
    Home: 'home',
    Transaction: 'swap-horizontal',
    Profile: 'account',
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tab}>
            <Icon
              name={icons[route.name]}
              size={28}
              color={isFocused ? '#00b894' : '#999'}
            />
          </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: width * 0.75,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default CustomTabBar;

