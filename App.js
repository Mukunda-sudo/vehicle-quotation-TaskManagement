import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import SplashScreen from './Screens/SplashScreen';
import LoginScreen from './Screens/LoginScreen';
import SignupScreen from './Screens/SignupScreen';
import HomeScreen from './Screens/HomeScreen';
import TaskSheetScreen from './Screens/TaskSheetScreen';
import DigitalQuotationScreen from './Screens/DigitalQuotationScreen';
import FormLinksScreen from './Screens/FormLinksScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
        />
        <Stack.Screen
          name="SignupScreen"
          component={SignupScreen}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
        />
        <Stack.Screen
          name="TaskSheetScreen"
          component={TaskSheetScreen}
        />
        <Stack.Screen
          name="DigitalQuotationScreen"
          component={DigitalQuotationScreen}
        />
        <Stack.Screen
          name="FormLinksScreen"
          component={FormLinksScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
