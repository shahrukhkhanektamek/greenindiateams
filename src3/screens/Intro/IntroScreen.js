import React, { useState, useRef, useEffect } from 'react';
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
const AUTO_SCROLL_INTERVAL = 3000; // 3秒自动滚动

const IntroScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const autoScrollTimerRef = useRef(null);

  const slides = [
    {
      id: '1',
      title: 'Welcome to ServiceProvider',
      description: 'Join thousands of service professionals earning daily through our platform',
      image: require("../../assets/img/banner/img1.jpeg"),
      color: colors.primary,
    },
    {
      id: '2',
      title: 'Welcome to ServiceProvider',
      description: 'Join thousands of service professionals earning daily through our platform',
      image: require("../../assets/img/banner/img1.jpeg"),
      color: colors.primary,
    },
    {
      id: '3',
      title: 'Welcome to ServiceProvider',
      description: 'Join thousands of service professionals earning daily through our platform',
      image: require("../../assets/img/banner/img1.jpeg"),
      color: colors.primary,
    }
    
  ];

  // 自动滚动功能
  useEffect(() => {
    startAutoScroll();
    
    return () => {
      stopAutoScroll();
    };
  }, [currentIndex]);

  const startAutoScroll = () => {
    stopAutoScroll(); // 先停止之前的定时器
    
    autoScrollTimerRef.current = setTimeout(() => {
      if (currentIndex < slides.length - 1) {
        const nextIndex = currentIndex + 1;
        flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
      } else {
        // 如果是最后一页，回到第一页
        flatListRef.current.scrollToIndex({ index: 0, animated: true });
        setCurrentIndex(0);
      }
    }, AUTO_SCROLL_INTERVAL);
  };

  const stopAutoScroll = () => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  };

  const handleManualScroll = (newIndex) => {
    stopAutoScroll();
    setCurrentIndex(newIndex);
    // 手动滚动后重新开始自动滚动
    startAutoScroll();
  };

  const renderItem = ({ item }) => {
    return (
      <View style={{ width, paddingHorizontal: 20 }}>
        {/* Image Container */}
        <View style={clsx(styles.itemsCenter, styles.justifyCenter)}>          
            <Image
              source={item.image}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />         
        </View>
    
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={clsx(styles.flexRow, styles.justifyCenter, styles.itemsCenter, styles.mb4)}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              clsx(styles.roundedFull, styles.mx1),
              {
                height: 8,
                width: i === currentIndex ? 20 : 8,
                backgroundColor: i === currentIndex ? colors.primary : `${colors.primary}30`,
                opacity: i === currentIndex ? 1 : 0.5,
              }
            ]}
          />
        ))}
      </View>
    );
  };

  const SkipButton = () => {
    if (currentIndex === slides.length - 1) return null;
    
    return (
      <TouchableOpacity
        style={clsx(styles.p4)}
        onPress={() => {
          stopAutoScroll();
          navigation.replace('ProviderOTPLogin');
        }}
      >
        <Text style={clsx(styles.textPrimary, styles.fontMedium)}>
          Skip
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={clsx(styles.flex1, styles.bgWhite)}>
        <View style={clsx(styles.flexRow, styles.itemsCenter,styles.justifyCenter)}>
          <Image source={require('../../assets/img/logo.png')} style={{resizeMode:'contain',width:200,height:100,margin:'auto'}} />
        </View>

      {/* 固定高度容器用于图片滑动 */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
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
            handleManualScroll(newIndex);
          }}
          onScrollBeginDrag={() => {
            // 用户开始拖动时停止自动滚动
            stopAutoScroll();
          }}
          onScrollEndDrag={() => {
            // 用户结束拖动后重新开始自动滚动
            startAutoScroll();
          }}
          scrollEventThrottle={16}
        />
      </View>

      {/* 固定底部区域 */}
      <View style={clsx(styles.px6, styles.pb6, styles.pt4, styles.bgWhite)}>
        {/* 点状指示器 */}
        <Paginator />
        
        {/* 固定底部按钮区域 */}
        <View style={clsx(styles.mt4)}>
         
          
          {/* Get Started 按钮 - 始终显示但最后一页样式不同 */}
          <TouchableOpacity
            style={[
              clsx(
                styles.roundedLg,
                styles.p4,
                styles.itemsCenter,
                styles.justifyCenter,
                styles.wFull
              ),
              { 
                height: 56,
                backgroundColor: currentIndex === slides.length - 1 ? colors.primary : `${colors.primary}`
              }
            ]}
            onPress={() => {
              stopAutoScroll();
              navigation.replace('ProviderOTPLogin');
            }}
          >
            <Text style={[
              clsx(styles.fontBold, styles.textLg),
              { 
                color: currentIndex === slides.length - 1 ? colors.white : colors.white 
              }
            ]}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Get Started'}
            </Text>
          </TouchableOpacity>
          
          
        </View>
      </View>
    </View>
  );
};

export default IntroScreen;