import { PixelRatio, Platform } from 'react-native';
import responsive from './responsive';

// Normalize font size for different devices
export const normalizeFont = (size) => {
  const newSize = responsive.scaleFont(size);
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
  }
};

// Normalize size (padding, margin, etc.)
export const normalizeSize = (size) => {
  return responsive.scaleSize(size);
};

// Normalize line height based on font size
export const normalizeLineHeight = (fontSize, multiplier = 1.2) => {
  return Math.round(fontSize * multiplier);
};

// Generate font sizes for different text types
export const fontSizes = {
  xs: normalizeFont(10),
  sm: normalizeFont(12),
  base: normalizeFont(14),
  lg: normalizeFont(16),
  xl: normalizeFont(18),
  '2xl': normalizeFont(20),
  '3xl': normalizeFont(24),
  '4xl': normalizeFont(30),
  '5xl': normalizeFont(36),
  '6xl': normalizeFont(48),
};

// Generate spacing scale
export const spacingScale = {
  0: 0,
  '0.5': normalizeSize(2),
  1: normalizeSize(4),
  '1.5': normalizeSize(6),
  2: normalizeSize(8),
  '2.5': normalizeSize(10),
  3: normalizeSize(12),
  '3.5': normalizeSize(14),
  4: normalizeSize(16),
  5: normalizeSize(20),
  6: normalizeSize(24),
  7: normalizeSize(28),
  8: normalizeSize(32),
  9: normalizeSize(36),
  10: normalizeSize(40),
  12: normalizeSize(48),
  14: normalizeSize(56),
  16: normalizeSize(64),
  20: normalizeSize(80),
  24: normalizeSize(96),
  28: normalizeSize(112),
  32: normalizeSize(128),
};

// Border radius scale
export const borderRadiusScale = {
  none: 0,
  sm: normalizeSize(2),
  default: normalizeSize(4),
  md: normalizeSize(6),
  lg: normalizeSize(8),
  xl: normalizeSize(12),
  '2xl': normalizeSize(16),
  '3xl': normalizeSize(24),
  full: normalizeSize(9999),
};

export default {
  normalizeFont,
  normalizeSize,
  normalizeLineHeight,
  fontSizes,
  spacingScale,
  borderRadiusScale,
};