import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles, { clsx } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

const IntroScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const slides = [
    {
      id: '1',
      title: 'Welcome to ServiceProvider',
      description: 'Join thousands of service professionals earning daily through our platform',
      image: 'https://cdn-icons-png.flaticon.com/512/3067/3067256.png',
      color: colors.primary,
    },
    {
      id: '2',
      title: 'Flexible Schedule',
      description: 'Work when you want, where you want. Set your own hours and service areas',
      image: 'https://cdn-icons-png.flaticon.com/512/3067/3067259.png',
      color: colors.secondary,
    },
    {
      id: '3',
      title: 'Earn More',
      description: 'Higher earnings with our competitive pricing and bonus incentives',
      image: 'https://cdn-icons-png.flaticon.com/512/3067/3067263.png',
      color: colors.success,
    },
    {
      id: '4',
      title: 'Grow Your Business',
      description: 'Access training, tools, and support to build your service business',
      image: 'https://cdn-icons-png.flaticon.com/512/3067/3067260.png',
      color: colors.info,
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <View style={{ width, paddingHorizontal: 20 }}>
        <View style={clsx(styles.itemsCenter, styles.justifyCenter, styles.mb12)}>
          <View 
            style={[
              clsx(styles.roundedFull, styles.itemsCenter, styles.justifyCenter),
              { 
                width: 200, 
                height: 200, 
                backgroundColor: `${item.color}20`,
                marginBottom: 40,
              }
            ]}
          >
            <Image
              source={{ uri: item.image }}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </View>
          
          <Text style={[clsx(styles.text3xl, styles.fontBold, styles.textCenter), { color: colors.text, marginBottom: 20 }]}>
            {item.title}
          </Text>
          
          <Text style={[clsx(styles.textBase, styles.textCenter), { color: colors.textLight, lineHeight: 24 }]}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={clsx(styles.flexRow, styles.justifyCenter, styles.itemsCenter, styles.mb8)}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              clsx(styles.roundedFull, styles.mx1),
              {
                height: 8,
                width: i === currentIndex ? 20 : 8,
                backgroundColor: i === currentIndex ? colors.primary : `${colors.primary}30`,
                opacity: i === currentIndex ? 1 : 0.3,
              }
            ]}
          />
        ))}
      </View>
    );
  };

  const NextButton = () => {
    return (
      <TouchableOpacity
        style={clsx(
          styles.bgPrimary,
          styles.roundedFull,
          styles.p4,
          styles.itemsCenter,
          styles.justifyCenter,
          { width: 56, height: 56 }
        )}
        onPress={() => {
          if (currentIndex < slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
          } else {
            navigation.replace('ProviderOTPLogin');
          }
        }}
      >
        <Icon 
          name={currentIndex === slides.length - 1 ? "check" : "arrow-forward"} 
          size={24} 
          color={colors.white} 
        />
      </TouchableOpacity>
    );
  };

  const SkipButton = () => {
    if (currentIndex === slides.length - 1) return null;
    
    return (
      <TouchableOpacity
        style={clsx(styles.p4)}
        onPress={() => navigation.replace('ProviderOTPLogin')}
      >
        <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
          Skip
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={clsx(styles.flex1, styles.bgWhite)}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      
      {/* Skip Button */}
      <View style={clsx(styles.flexRow, styles.justifyEnd, styles.px4, styles.pt12)}>
        <SkipButton />
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onMomentumScrollEnd={(ev) => {
          const newIndex = Math.floor(ev.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        scrollEventThrottle={16}
      />

      {/* Paginator */}
      <Paginator />

      {/* Bottom Section */}
      <View style={clsx(styles.px6, styles.pb8)}>
        <View style={clsx(styles.flexRow, styles.justifyBetween, styles.itemsCenter)}>
          <TouchableOpacity
            style={clsx(
              styles.flexRow,
              styles.itemsCenter,
              currentIndex === 0 && { opacity: 0 }
            )}
            onPress={() => {
              if (currentIndex > 0) {
                flatListRef.current.scrollToIndex({ index: currentIndex - 1 });
                setCurrentIndex(currentIndex - 1);
              }
            }}
            disabled={currentIndex === 0}
          >
            <Icon name="arrow-back" size={24} color={currentIndex === 0 ? colors.transparent : colors.primary} />
            <Text style={[clsx(styles.textPrimary, styles.fontMedium, styles.ml2), currentIndex === 0 && { color: colors.transparent }]}>
              Back
            </Text>
          </TouchableOpacity>

          <NextButton />

          {currentIndex === slides.length - 1 ? (
            <TouchableOpacity
              style={clsx(
                styles.border,
                styles.borderPrimary,
                styles.roundedFull,
                styles.px6,
                styles.py3
              )}
              onPress={() => navigation.replace('ProviderSignup')}
            >
              <Text style={clsx(styles.textPrimary, styles.fontBold)}>
                Sign Up
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* Get Started Button (Only on last slide) */}
        {currentIndex === slides.length - 1 && (
          <TouchableOpacity
            style={clsx(
              styles.bgPrimary,
              styles.roundedLg,
              styles.p4,
              styles.itemsCenter,
              styles.justifyCenter,
              styles.mt6
            )}
            onPress={() => navigation.replace('ProviderSignup')}
          >
            <Text style={clsx(styles.textWhite, styles.textLg, styles.fontBold)}>
              Get Started
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default IntroScreen;