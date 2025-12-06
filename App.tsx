import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ProviderNavigator from './src3/navigation/ProviderNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProviderNavigator />
    </SafeAreaProvider>
  );
}