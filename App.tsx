/**
 * BookMyShoot - Photography Studio Booking App
 * React Native Mobile Application
 *
 * @format
 */

import React from 'react';
import { StatusBar, Text, TextInput } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/constants';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import Toast from "react-native-toast-message";

// Set global default font family to Manrope for Text and TextInput
if ((Text as any).defaultProps == null) {
  (Text as any).defaultProps = {};
}
(Text as any).defaultProps.style = [
  { fontFamily: 'Manrope-Regular' },
  (Text as any).defaultProps.style,
];

if ((TextInput as any).defaultProps == null) {
  (TextInput as any).defaultProps = {};
}
(TextInput as any).defaultProps.style = [
  { fontFamily: 'Manrope-Regular' },
  (TextInput as any).defaultProps.style,
];

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={COLORS.primary}
          translucent={false}
        />
        <RootNavigator />
        <Toast position='top'/>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
