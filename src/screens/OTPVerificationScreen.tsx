import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../components/Button';
import {verifyOTP} from '../services/DatabaseService';

const {width, height} = Dimensions.get('window');

const OTPVerificationScreen = ({navigation, route}: any) => {
  const email = route?.params?.email || 'user@example.com';
  const [otp, setOtp] = useState(['', '', '', '']);
  const [errors, setErrors] = useState<{otp?: string; general?: string}>({});
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputRefs = useRef<any>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 4) {
      setErrors({otp: 'Please enter complete 4-digit OTP'});
      shakeInputs();
      return;
    }

    setLoading(true);
    try {
      // Verify OTP (fixed 1234)
      await verifyOTP(email, otpString);
      
      Alert.alert(
        'Verification Successful',
        'Your account has been verified. Please login.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login', {email}),
          },
        ],
      );
    } catch (error: any) {
      setErrors({
        general: error.message || 'Invalid OTP. Please use 1234.',
      });
      shakeInputs();
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    Alert.alert('OTP Sent', 'Your OTP is: 1234');
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <View style={styles.container}>
      {/* Decorative Elements */}
      <View style={styles.decorativeElements} pointerEvents="none">
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify OTP</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.logoCircle}>
              <View style={styles.logoInnerCircle}>
                <Text style={styles.logoIcon}>৳</Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We've sent a 4-digit verification code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          {/* Error message */}
          {errors.general && (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={16} color="#ff4757" />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          {errors.otp && (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={16} color="#ff4757" />
              <Text style={styles.errorText}>{errors.otp}</Text>
            </View>
          )}

          {/* OTP Input Fields */}
          <Animated.View
            style={[
              styles.otpContainer,
              {transform: [{translateX: shakeAnimation}]},
            ]}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  focusedIndex === index && styles.otpInputFocused,
                  digit && styles.otpInputFilled,
                  (errors.otp || errors.general) && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </Animated.View>

          {/* Verify Button */}
          <Button
            title="Verify OTP"
            onPress={handleVerify}
            loading={loading}
            disabled={!isOtpComplete}
          />

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResendOTP} activeOpacity={0.7}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
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
    opacity: 0.08,
  },
  circle1: {
    width: 160,
    height: 160,
    backgroundColor: '#00b894',
    top: -80,
    right: -80,
  },
  circle2: {
    width: 100,
    height: 100,
    backgroundColor: '#00a085',
    bottom: -50,
    left: -50,
  },
  circle3: {
    width: 70,
    height: 70,
    backgroundColor: '#00b894',
    top: height * 0.15,
    right: -35,
  },
  circle4: {
    width: 50,
    height: 50,
    backgroundColor: '#00a085',
    bottom: height * 0.25,
    right: width * 0.15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#00b894',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },
  logoInnerCircle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#00a085',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoIcon: {
    fontSize: 35,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  emailText: {
    fontWeight: '600',
    color: '#00b894',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4757',
  },
  errorText: {
    color: '#ff4757',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#1a202c',
    backgroundColor: '#fff',
  },
  otpInputFocused: {
    borderColor: '#00b894',
    backgroundColor: '#f7fafc',
  },
  otpInputFilled: {
    borderColor: '#00b894',
    backgroundColor: '#f0fff4',
  },
  otpInputError: {
    borderColor: '#ff4757',
    backgroundColor: '#fef2f2',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  resendText: {
    fontSize: 14,
    color: '#64748b',
  },
  resendLink: {
    fontSize: 14,
    color: '#00b894',
    fontWeight: '600',
  },
});

export default OTPVerificationScreen;

