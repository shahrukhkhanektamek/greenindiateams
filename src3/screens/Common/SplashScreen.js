import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../../styles/colors';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Start scale animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Background Circles */}
      <View style={{
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -width * 0.5,
        left: -width * 0.25,
      }} />
      
      <View style={{
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        bottom: -width * 0.4,
        right: -width * 0.2,
      }} />

      {/* Main Content */}
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Logo */}
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 30,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3067/3067256.png' }}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Text style={{
            fontSize: 36,
            fontWeight: '800',
            color: colors.white,
            letterSpacing: 1,
          }}>
            Service
          </Text>
          <Text style={{
            fontSize: 36,
            fontWeight: '800',
            color: colors.white,
            letterSpacing: 1,
          }}>
            Provider
          </Text>
        </View>
        
        <Text style={{
          fontSize: 16,
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          marginTop: 10,
          letterSpacing: 0.5,
        }}>
          Professional Services at Your Doorstep
        </Text>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={{
        position: 'absolute',
        bottom: 100,
        alignItems: 'center',
      }}>
        <View style={{
          width: 200,
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 15,
        }}>
          <View 
            style={{
              height: '100%',
              backgroundColor: colors.white,
              borderRadius: 2,
              width: `${progress}%`,
            }} 
          />
        </View>
        <Text style={{
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.6)',
        }}>
          Loading your experience...
        </Text>
      </View>

      {/* Footer */}
      <View style={{
        position: 'absolute',
        bottom: 30,
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: 5,
        }}>
          Version 1.0.0
        </Text>
        <Text style={{
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.4)',
        }}>
          © 2024 ServiceProvider Pvt. Ltd.
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;