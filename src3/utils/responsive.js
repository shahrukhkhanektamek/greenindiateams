import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

// Get device dimensions
const { width, height } = Dimensions.get('window');

// Design dimensions (based on iPhone 11)
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

// Check device type
const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = width * pixelDensity;
  const adjustedHeight = height * pixelDensity;
  return (adjustedWidth >= 1000 || adjustedHeight >= 1000);
};

const isSmallDevice = () => width < 375;
const isLargeDevice = () => width > 414;

// Responsive width
const wp = (percentage) => {
  const value = (percentage * width) / 100;
  return Math.round(value);
};

// Responsive height
const hp = (percentage) => {
  const value = (percentage * height) / 100;
  return Math.round(value);
};

// Scale font size based on device width
const scaleFont = (size) => {
  const scaleFactor = width / DESIGN_WIDTH;
  const newSize = size * scaleFactor;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

// Scale size based on device width (for padding, margin, etc.)
const scaleSize = (size) => {
  const scaleFactor = width / DESIGN_WIDTH;
  return Math.round(size * scaleFactor);
};

// Get responsive value based on device
const responsiveValue = (values) => {
  if (isSmallDevice()) {
    return values.small || values.base;
  } else if (isLargeDevice()) {
    return values.large || values.base;
  } else if (isTablet()) {
    return values.tablet || values.base;
  }
  return values.base;
};

// Responsive style creator
const createResponsiveStyle = (baseStyle, responsiveOverrides = {}) => {
  let responsiveStyle = { ...baseStyle };
  
  // Apply small device overrides
  if (isSmallDevice() && responsiveOverrides.small) {
    responsiveStyle = { ...responsiveStyle, ...responsiveOverrides.small };
  }
  
  // Apply large device overrides
  if (isLargeDevice() && responsiveOverrides.large) {
    responsiveStyle = { ...responsiveStyle, ...responsiveOverrides.large };
  }
  
  // Apply tablet overrides
  if (isTablet() && responsiveOverrides.tablet) {
    responsiveStyle = { ...responsiveStyle, ...responsiveOverrides.tablet };
  }
  
  return responsiveStyle;
};

// Check orientation
const isPortrait = () => height >= width;
const isLandscape = () => width >= height;

// Safe area values
const getStatusBarHeight = () => {
  return Platform.select({
    ios: isLandscape() ? 0 : 44,
    android: StatusBar.currentHeight,
    default: 0,
  });
};

const getBottomSpace = () => {
  return Platform.select({
    ios: isLandscape() ? 21 : 34,
    android: 0,
    default: 0,
  });
};

export default {
  width,
  height,
  wp,
  hp,
  scaleFont,
  scaleSize,
  responsiveValue,
  createResponsiveStyle,
  isSmallDevice,
  isLargeDevice,
  isTablet,
  isPortrait,
  isLandscape,
  getStatusBarHeight,
  getBottomSpace,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
};