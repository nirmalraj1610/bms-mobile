import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import StudioDetailsScreen from '../screens/StudioDetailsScreen';
import PhotographerDetailsScreen from '../screens/PhotographerDetailsScreen';
import type { HomeStackParamList } from '../types';

const Stack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="StudioDetails" component={StudioDetailsScreen} />
      <Stack.Screen name="PhotographerDetails" component={PhotographerDetailsScreen} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;