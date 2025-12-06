import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import Provider Screens
import DashboardScreen from '../screens/Provider/DashboardScreen';
import TodayJobsScreen from '../screens/Provider/TodayJobsScreen';
import JobDetailsScreen from '../screens/Provider/JobDetailsScreen';
import EarningsScreen from '../screens/Provider/EarningsScreen';
import ScheduleScreen from '../screens/Provider/ScheduleScreen';
import PerformanceScreen from '../screens/Provider/PerformanceScreen';
import ToolsScreen from '../screens/Provider/ToolsScreen';
import TrainingScreen from '../screens/Provider/TrainingScreen';
import ProfileScreen from '../screens/Common/ProfileScreen';
import SettingsScreen from '../screens/Common/SettingsScreen';

// Import Auth Screens
import ProviderLoginScreen from '../screens/Auth/ProviderLoginScreen';
import ProviderSignupScreen from '../screens/Auth/ProviderSignupScreen';
import VerificationScreen from '../screens/Auth/VerificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tabs Navigator
function ProviderTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'dashboard' : 'dashboard';
              break;
            case 'Jobs':
              iconName = focused ? 'assignment' : 'assignment';
              break;
            case 'Earnings':
              iconName = focused ? 'account-balance-wallet' : 'account-balance-wallet';
              break;
            case 'Schedule':
              iconName = focused ? 'calendar-today' : 'calendar-today';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu';
              break;
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={TodayJobsScreen}
        options={{ tabBarLabel: 'Jobs' }}
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen}
        options={{ tabBarLabel: 'Earnings' }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={ScheduleScreen}
        options={{ tabBarLabel: 'Schedule' }}
      />
      <Tab.Screen 
        name="More" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
function ProviderNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ProviderLogin"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        {/* Auth Stack */}
        <Stack.Screen name="ProviderLogin" component={ProviderLoginScreen} />
        <Stack.Screen name="ProviderSignup" component={ProviderSignupScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        
        {/* Main App Stack */}
        <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
        
        {/* Common Screens */}
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
        <Stack.Screen name="Performance" component={PerformanceScreen} />
        <Stack.Screen name="Tools" component={ToolsScreen} />
        <Stack.Screen name="Training" component={TrainingScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default ProviderNavigator;