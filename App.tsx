/**
 * Hisab - Personal Finance Tracker
 *
 * @format
 */

import React from 'react';
import {StatusBar, Text, TextInput, Platform} from 'react-native';
import 'react-native-gesture-handler';
import {AuthProvider} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Set default font family for all Text and TextInput components
const defaultFontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'sans-serif',
});

// @ts-ignore - Setting default props for Text component
if (Text.defaultProps == null) {
  // @ts-ignore
  Text.defaultProps = {};
}
// @ts-ignore
Text.defaultProps.style = {fontFamily: defaultFontFamily};

// @ts-ignore - Setting default props for TextInput component
if (TextInput.defaultProps == null) {
  // @ts-ignore
  TextInput.defaultProps = {};
}
// @ts-ignore
TextInput.defaultProps.style = {fontFamily: defaultFontFamily};

function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppNavigator />
    </AuthProvider>
  );
}

export default App;
