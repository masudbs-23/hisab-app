import React from 'react';
import {View, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

const CustomTabBar = ({state, descriptors, navigation}: any) => {
  const icons: any = {
    Home: 'home',
    Transaction: 'swap-horizontal',
    Cards: 'plus',
    Profile: 'account',
  };

  // Check if tab bar should be hidden
  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const tabBarStyle = focusedDescriptor?.options?.tabBarStyle;
  
  if (tabBarStyle?.display === 'none') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;
          const isCardsTab = route.name === 'Cards';

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

          // Special styling for Cards (+ icon) tab
          if (isCardsTab) {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? {selected: true} : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={styles.plusButton}>
                <View style={styles.plusIconContainer}>
                  <Icon
                    name={icons[route.name]}
                    size={32}
                    color="#fff"
                  />
                </View>
              </TouchableOpacity>
            );
          }

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
    width: width * 0.85,
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
    paddingHorizontal: 20,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  plusButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  plusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00b894',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
});

export default CustomTabBar;

