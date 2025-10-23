import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {ActivityIndicator, View} from 'react-native';
import OnboardingScreen from '../screens/OnboardingScreen';
import BottomTabNavigator from './BottomTabNavigator';
import {useAuth} from '../context/AuthContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const {isLoading} = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fffe'}}>
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {showOnboarding ? (
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} onComplete={() => setShowOnboarding(false)} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="MainApp" component={BottomTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

