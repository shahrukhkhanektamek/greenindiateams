import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

const NetworkIndicator = () => {
  const netInfo = useNetInfo();
  
  if (!netInfo.isConnected) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No Internet Connection</Text>
      </View>
    );
  }
  
  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF3B30',
    padding: 10,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NetworkIndicator;