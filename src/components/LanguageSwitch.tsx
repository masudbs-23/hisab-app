import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {useLanguage} from '../context/LanguageContext';

const {width} = Dimensions.get('window');

const LanguageSwitch: React.FC = () => {
  const {language, setLanguage} = useLanguage();
  const animatedValue = useRef(new Animated.Value(language === 'en' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: language === 'en' ? 0 : 1,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [language]);

  const toggleSwitch = () => {
    const newValue = language === 'en' ? 'bn' : 'en';
    setLanguage(newValue);
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 42],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#00b894', '#1e90ff'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleSwitch}
      style={styles.container}>
      <Animated.View style={[styles.track, {backgroundColor}]}>
        <View style={styles.labelsContainer}>
          <Text
            style={[
              styles.label,
              language === 'en' && styles.activeLabel,
            ]}>
            EN
          </Text>
          <Text
            style={[
              styles.label,
              language === 'bn' && styles.activeLabel,
            ]}>
            বাং
          </Text>
        </View>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{translateX}],
            },
          ]}>
          <Text style={styles.thumbText}>
            {language === 'en' ? 'EN' : 'বাং'}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  track: {
    width: 80,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  activeLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
  },
  thumb: {
    width: 36,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
  thumbText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2d3436',
  },
});

export default LanguageSwitch;

