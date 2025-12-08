import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ProviderNavigator from './src3/navigation/ProviderNavigator';
import { StatusBar } from 'react-native';

import { AppProvider } from './src3/Context/AppContext';
// import CustomSidebar from './src3';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, }} edges={['top','bottom']}>
        <AppProvider>
          <StatusBar barStyle="dark-content" />
          <ProviderNavigator />
        </AppProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}