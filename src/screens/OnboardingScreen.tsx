import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');

const OnboardingScreen = ({navigation}: any) => {
  const setOnboardingComplete = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f8fffe"
        translucent={false}
      />
      <View style={styles.container}>
      {/* Enhanced Logo with Gradient Background */}
      <View style={styles.logoContainer}>
        <View style={styles.logoInnerCircle}>
          <Text style={styles.logoIcon}>৳</Text>
          <Text style={styles.logoBengaliTitle}>হিসাব</Text>
        </View>
        <Text style={styles.logoSubtext}>Your Financial Assistant</Text>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Smart Money Management</Text>
        <Text style={styles.subtitle}>
          Track your income and expenses with intelligent insights designed for Bangladesh
        </Text>
      </View>

      {/* Enhanced Feature highlights */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>📊</Text>
          </View>
          <Text style={styles.featureTitle}>Easy Tracking</Text>
          <Text style={styles.featureDescription}>Monitor your daily transactions</Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>💡</Text>
          </View>
          <Text style={styles.featureTitle}>Smart Insights</Text>
          <Text style={styles.featureDescription}>AI-powered financial advice</Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>🎯</Text>
          </View>
          <Text style={styles.featureTitle}>Set Goals</Text>
          <Text style={styles.featureDescription}>Achieve your financial dreams</Text>
        </View>
      </View>

      {/* Single Get Started Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={setOnboardingComplete}
          activeOpacity={0.8}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

      {/* Decorative Elements - Add pointerEvents="none" */}
      <View style={styles.decorativeElements} pointerEvents="none">
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fffe',
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  logoInnerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#00b894',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  logoBengaliTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  logoIcon: {
    fontSize: 56,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
  logoSubtext: {
    fontSize: 24,
    color: '#00b894',
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2d3436',
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.85,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 60,
    paddingHorizontal: 10,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 14,
    color: '#2d3436',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 11,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    zIndex: 10,
  },
  getStartedButton: {
    backgroundColor: '#00b894',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00b894',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    width: '100%',
    minHeight: 70,
    justifyContent: 'center',
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  termsText: {
    fontSize: 12,
    color: '#b2bec3',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#00b894',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#00a085',
    bottom: -75,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#00b894',
    top: height * 0.3,
    right: -50,
  },
});

export default OnboardingScreen;

