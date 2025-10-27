import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useLanguage} from '../context/LanguageContext';

const {width, height} = Dimensions.get('window');

const OnboardingScreen = ({navigation, onComplete}: any) => {
  const {t} = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const setOnboardingComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f0f9ff"
        translucent={false}
      />
      <View style={styles.container}>
        {/* Decorative Background Elements */}
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
        <View style={styles.backgroundCircle3} />

        {/* Animated Logo */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                {scale: pulseAnim},
                {scale: scaleAnim}
              ]
            }
          ]}>
          <View style={styles.logoInnerCircle}>
            <MaterialIcon name="currency-bdt" size={50} color="#fff" />
            <Text style={styles.logoBengaliTitle}>{t('onboarding.appName')}</Text>
          </View>
          <Text style={styles.logoSubtext}>{t('onboarding.tagline')}</Text>
        </Animated.View>

        {/* Animated Title */}
        <Animated.View 
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}]
            }
          ]}>
          <Text style={styles.title}>{t('onboarding.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.subtitle')}
          </Text>
        </Animated.View>

        {/* Animated Features */}
        <Animated.View 
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
            }
          ]}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, styles.feature1]}>
              <Icon name="trending-up" size={30} color="#00b894" />
            </View>
            <Text style={styles.featureTitle}>{t('onboarding.feature1')}</Text>
            <Text style={styles.featureDescription}>{t('onboarding.feature1Desc')}</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, styles.feature2]}>
              <MaterialIcon name="chart-pie" size={30} color="#6c5ce7" />
            </View>
            <Text style={styles.featureTitle}>{t('onboarding.feature2')}</Text>
            <Text style={styles.featureDescription}>{t('onboarding.feature2Desc')}</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, styles.feature3]}>
              <Icon name="card" size={30} color="#fd79a8" />
            </View>
            <Text style={styles.featureTitle}>{t('onboarding.feature3')}</Text>
            <Text style={styles.featureDescription}>{t('onboarding.feature3Desc')}</Text>
          </View>
        </Animated.View>

        {/* Animated Button */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}]
            }
          ]}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={setOnboardingComplete}
            activeOpacity={0.8}>
            <Text style={styles.getStartedButtonText}>{t('onboarding.getStarted')}</Text>
            <Icon name="arrow-forward" size={24} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>

          <Text style={styles.termsText}>
            {t('onboarding.terms')}
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f9ff',
    position: 'relative',
    overflow: 'hidden',
  },
  // Decorative Background Elements
  backgroundCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 184, 148, 0.08)',
    top: -100,
    right: -100,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(108, 92, 231, 0.06)',
    bottom: -50,
    left: -50,
  },
  backgroundCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(253, 121, 168, 0.08)',
    top: height * 0.4,
    left: -30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
    zIndex: 10,
  },
  logoInnerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00b894',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoBengaliTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 18,
    color: '#00b894',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    color: '#2d3436',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.85,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 70,
    paddingHorizontal: 5,
    zIndex: 10,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  featureIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  feature1: {
    borderLeftWidth: 3,
    borderLeftColor: '#00b894',
  },
  feature2: {
    borderLeftWidth: 3,
    borderLeftColor: '#6c5ce7',
  },
  feature3: {
    borderLeftWidth: 3,
    borderLeftColor: '#fd79a8',
  },
  featureTitle: {
    fontSize: 14,
    color: '#2d3436',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  featureDescription: {
    fontSize: 11,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    zIndex: 10,
  },
  getStartedButton: {
    backgroundColor: '#00b894',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#00b894',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 15,
    width: '100%',
    minHeight: 65,
    gap: 10,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  termsText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 30,
    fontWeight: '500',
  },
});

export default OnboardingScreen;

