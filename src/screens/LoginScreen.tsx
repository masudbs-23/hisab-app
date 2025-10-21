import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import {loginUser} from '../services/DatabaseService';
import {useAuth} from '../context/AuthContext';
import {readAndParseSMS, requestSMSPermission} from '../services/SMSService';

const {width, height} = Dimensions.get('window');

const LoginScreen = ({navigation}: any) => {
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await loginUser(email.trim(), password);
      
      // Save user to context
      await login(result.user);
      
      // Request SMS permission and sync (silently without alerts)
      const hasPermission = await requestSMSPermission();
      if (hasPermission) {
        await readAndParseSMS(result.user.id);
      }
      
      // Navigation will be handled automatically by auth state change
    } catch (error: any) {
      setErrors({
        general: error.message || 'Login failed. Please check your credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <View style={styles.logoInnerCircle}>
            <Text style={styles.logoIcon}>৳</Text>
          </View>
        </View>
        <Text style={styles.logoSubtext}>Hisab</Text>
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login to your account</Text>

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

        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={() => {
            // You can add a ForgotPassword screen later
            console.log('Forgot password');
          }}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button title="Login" onPress={handleLogin} loading={isLoading} />

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.linkText}>Don't have an account? </Text>
          <Text style={styles.linkTextBold}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Decorative Elements - Add pointerEvents="none" */}
      <View style={styles.decorativeElements} pointerEvents="none">
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: '#00a085',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoIcon: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    letterSpacing: 0.5,
    marginBottom: 5,
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
    marginBottom: 25,
    textAlign: 'left',
    color: '#2d3436',
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#00a085',
    fontSize: 14,
    fontWeight: '600',
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
    width: 180,
    height: 180,
    backgroundColor: '#00b894',
    top: -90,
    right: -90,
  },
  circle2: {
    width: 120,
    height: 120,
    backgroundColor: '#00a085',
    bottom: -60,
    left: -60,
  },
  circle3: {
    width: 80,
    height: 80,
    backgroundColor: '#00b894',
    top: height * 0.25,
    right: -40,
  },
  circle4: {
    width: 60,
    height: 60,
    backgroundColor: '#00a085',
    bottom: height * 0.3,
    right: width * 0.1,
  },
});

export default LoginScreen;

