import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';

import { colors } from '../../styles/colors';

const MovableButton = ({ 
  onPress, 
  buttonText = "Help",
  initialPosition = 'left-bottom', // 'left-bottom', 'right-bottom', 'left-top', 'right-top', or {x, y}
  buttonSize = 60,
  buttonColor = 'transparent',
  textColor = colors.primary,
  margin = 20, // Screen margin from edges
}) => {
  const [dimensions, setDimensions] = useState({ 
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height 
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Update dimensions on screen rotation
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
      // Recalculate position when screen size changes
      calculateInitialPosition(window.width, window.height);
    });
    
    return () => subscription?.remove();
  }, []);

  // Calculate initial position based on prop
  const calculateInitialPosition = (width, height) => {
    let x, y;
    
    switch(initialPosition) {
      case 'left-bottom':
        x = margin;
        y = height - buttonSize - margin;
        break;
      case 'right-bottom':
        x = width - buttonSize - margin;
        y = height - buttonSize - margin-150;
        break;
      case 'left-top':
        x = margin;
        y = margin;
        break;
      case 'right-top':
        x = width - buttonSize - margin;
        y = margin;
        break;
      case 'center':
        x = (width - buttonSize) / 2;
        y = (height - buttonSize) / 2;
        break;
      case 'center-bottom':
        x = (width - buttonSize) / 2;
        y = height - buttonSize - margin;
        break;
      default:
        // If initialPosition is an object with x, y coordinates
        if (typeof initialPosition === 'object' && initialPosition.x !== undefined && initialPosition.y !== undefined) {
          x = initialPosition.x;
          y = initialPosition.y;
        } else {
          // Default to left-bottom
          x = margin;
          y = height - buttonSize - margin;
        }
    }
    
    setPosition({ x, y });
  };

  // Initialize position on component mount
  useEffect(() => {
    calculateInitialPosition(dimensions.width, dimensions.height);
  }, [dimensions]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    
    onPanResponderMove: (event, gestureState) => {
      const newX = position.x + gestureState.dx;
      const newY = position.y + gestureState.dy;
      
      // Apply boundaries with margin
      const boundedX = Math.max(margin, Math.min(dimensions.width - buttonSize - margin, newX));
      const boundedY = Math.max(margin, Math.min(dimensions.height - buttonSize - margin, newY));
      
      setPosition({
        x: boundedX,
        y: boundedY
      });
    },
    
    onPanResponderRelease: (event, gestureState) => {
      setIsDragging(false);
      
      // If it was a tap (not drag), call onPress
      if (
        Math.abs(gestureState.dx) < 5 && 
        Math.abs(gestureState.dy) < 5
      ) {
        if (onPress) {
        //   onPress();
        }
      }
    }
  });

  const handlePress = () => {
    if (!isDragging && onPress) {
      onPress();
    }
  };

  const resetToInitialPosition = () => {
    calculateInitialPosition(dimensions.width, dimensions.height);
  };

  return (
    <View
      style={[
        styles.button,
        {
          left: position.x,
          top: position.y,
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
        //   backgroundColor: buttonColor,
          borderWidth:2,
          borderColor:colors.primary
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.touchableArea}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Alternative: Simpler version with fixed left-bottom position
export const SimpleBottomButton = ({ 
  onPress, 
  buttonText = "hrlp" 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const buttonSize = 60;
  const margin = 20;

  // Calculate initial position at left bottom
  const initialX = margin;
  const initialY = screenHeight - buttonSize - margin;

  const [buttonPosition, setButtonPosition] = useState({ 
    x: initialX, 
    y: initialY 
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    
    onPanResponderMove: (event, gestureState) => {
      const newX = buttonPosition.x + gestureState.dx;
      const newY = buttonPosition.y + gestureState.dy;
      
      // Apply boundaries
      const boundedX = Math.max(0, Math.min(screenWidth - buttonSize, newX));
      const boundedY = Math.max(0, Math.min(screenHeight - buttonSize, newY));
      
      setButtonPosition({
        x: boundedX,
        y: boundedY
      });
    },
    
    onPanResponderRelease: (event, gestureState) => {
      setIsDragging(false);
      
      // If it was a tap (not drag), call onPress
      if (
        Math.abs(gestureState.dx) < 5 && 
        Math.abs(gestureState.dy) < 5
      ) {
        if (onPress) {
        //   onPress();
        }
      }
    }
  });

  const handlePress = () => {
    if (!isDragging && onPress) {
    //   onPress();
    }
  };

  return (
    <View
      style={[
        styles.button,
        {
          left: buttonPosition.x,
          top: buttonPosition.y,
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.touchableArea}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    backgroundColor: 'white', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
    opacity:0.5, 
  },
  touchableArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MovableButton;