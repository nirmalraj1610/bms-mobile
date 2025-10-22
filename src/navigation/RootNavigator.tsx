import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import StudioDetailsScreen from '../screens/StudioDetailsScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import SplashScreen from '../screens/SplashScreen';
import GettingStartedScreen from '../screens/GettingStartedScreen';
import OurWorksScreen from '../screens/OurWorksScreen';
import GalleryScreen from '../screens/GalleryScreen';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="GettingStarted" component={GettingStartedScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen 
          name="StudioDetails" 
          component={StudioDetailsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen}
          options={{
            headerShown: true,
            title: 'Book Studio',
          }}
        />
        <Stack.Screen 
          name="BookingConfirmation" 
          component={BookingConfirmationScreen}
          options={{
            headerShown: true,
            title: 'Booking Confirmed',
          }}
        />
        <Stack.Screen 
          name="OurWorks" 
          component={OurWorksScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Gallery" 
          component={GalleryScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;