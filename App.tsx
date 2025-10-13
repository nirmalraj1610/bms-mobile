/**
 * BookMyShoot - Photography Studio Booking App
 * React Native Mobile Application
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/constants';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={COLORS.primary}
        translucent={false}
      />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
