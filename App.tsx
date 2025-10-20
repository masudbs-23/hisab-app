/**
 * Hisab - Personal Finance Tracker
 *
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import 'react-native-gesture-handler';
import {AuthProvider} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppNavigator />
    </AuthProvider>
  );
}

export default App;
