import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, LogBox, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { MenuProvider } from 'react-native-popup-menu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


// Import components
import ProviderNavigator from './src3/navigation/ProviderNavigator';
import { AppProvider } from './src3/Context/AppContext';
import ErrorBoundary from './src3/components/Common/ErrorBoundary'; 
import NetworkIndicator from './src3/components/Common/NetworkIndicator';
import notificationService from './src3/components/Common/notificationService'; 

// Import navigation service
import { navigationRef } from './src3/navigation/navigationService';

if (__DEV__) {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
    'Require cycle:',
  ]);
}



export default function App() {
  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      await notificationService.initialize();
    };
    
    initializeNotifications();
  }, []);

  const initializeApp = () => {
    console.log('App initialized');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent={Platform.OS === 'android'}
          />
          
          <SafeAreaView 
            style={{ 
              flex: 1, 
              backgroundColor: '#FFFFFF',
            }} 
            edges={['top', 'bottom', 'left', 'right']}
          >
            <NetworkIndicator />
            <MenuProvider>
              <AppProvider>
                {/* Pass navigationRef to NavigationContainer */}
                <NavigationContainer ref={navigationRef}> 
                  {/* <MainLayout>  */}
                    <ProviderNavigator />
                  {/* </MainLayout>  */}
                </NavigationContainer>
              </AppProvider>
            </MenuProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}