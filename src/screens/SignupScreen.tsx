import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import {registerUser} from '../services/DatabaseService';

const {width, height} = Dimensions.get('window');

const SignupScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: any = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await registerUser(email.trim(), password);
      
      // Navigate directly to OTP screen without alert
      navigation.navigate('OTPVerification', {email: email.trim()});
    } catch (error: any) {
      if (error.message === 'User already exists') {
        setErrors({
          general: 'This email is already registered. Please login instead.',
        });
      } else {
        setErrors({general: 'Registration failed. Please try again.'});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <View style={styles.logoInnerCircle}>
              <Text style={styles.logoIcon}>৳</Text>
            </View>
          </View>
          <Text style={styles.logoSubtext}>Hisab</Text>
        </View>

        {/* Register Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to start managing your finances
          </Text>

          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
          />

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Text style={styles.linkTextBold}>Login</Text>
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{'\n'}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: height,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    zIndex: 10,
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
    shadowOffset: {
      width: 0,
      height: 6,
    },
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
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 32,
    color: '#00b894',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
    color: '#2d3436',
  },
  subtitle: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'left',
    marginBottom: 25,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorText: {
    color: '#e53e3e',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  passwordHintContainer: {
    marginBottom: 20,
  },
  passwordHint: {
    fontSize: 12,
    color: '#636e72',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  linkText: {
    color: '#636e72',
    fontSize: 16,
  },
  linkTextBold: {
    color: '#00b894',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsContainer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  termsText: {
    fontSize: 12,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#00b894',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;

