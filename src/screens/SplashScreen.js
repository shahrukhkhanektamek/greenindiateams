
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';


const SplashScreen = ()=> {

  return (
    <View style={styles.container}>
      <Image source={require('../assets/img/logo.png')} style={styles.logo} />      
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // Background color for splash    
  },
  logo: {
    width: 350,
    // height: 150, // Set the size of the logo
    resizeMode:'contain'
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SplashScreen;