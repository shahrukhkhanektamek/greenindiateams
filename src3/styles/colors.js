// Color Palette - Centralized colors
export const colors = {
  // Primary colors
  primary: '#FF6B6B',       // Main brand color
  primaryLight: '#FFE6E6',  // Light variant
  primaryDark: '#D64545',   // Dark variant
  
  // Secondary colors
  secondary: '#4ECDC4',     // Secondary color
  secondaryLight: '#A7E6E1',// Light variant
  secondaryDark: '#2DA69C', // Dark variant
  
  // Neutral colors
  background: '#FFFFFF',    // Background color
  surface: '#F8F8F8',       // Surface color
  card: '#FFFFFF',          // Card background
  
  // Text colors
  text: '#333333',          // Primary text
  textLight: '#666666',     // Secondary text
  textMuted: '#999999',     // Muted text
  textDisabled: '#CCCCCC',  // Disabled text
  
  // Border colors
  border: '#E0E0E0',        // Border color
  borderLight: '#F0F0F0',   // Light border
  borderDark: '#CCCCCC',    // Dark border
  
  // Status colors
  success: '#4CAF50',       // Success color
  successLight: '#E8F5E9',  // Success light
  warning: '#FF9800',       // Warning color
  warningLight: '#FFF3E0',  // Warning light
  error: '#F44336',         // Error color
  errorLight: '#FFEBEE',    // Error light
  info: '#2196F3',          // Info color
  infoLight: '#E3F2FD',     // Info light
  
  // Grayscale
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Social colors
  facebook: '#1877F2',
  google: '#DB4437',
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  
  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Gradients
  gradientPrimary: ['#FF6B6B', '#FF8E53'],
  gradientSecondary: ['#4ECDC4', '#44A08D'],
  gradientSuccess: ['#4CAF50', '#8BC34A'],
};

// Export color palettes for different themes
export const lightTheme = {
  ...colors,
  background: '#FFFFFF',
  surface: '#F8F8F8',
  text: '#333333',
  textLight: '#666666',
};

export const darkTheme = {
  ...colors,
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textLight: '#CCCCCC',
  border: '#333333',
};

export default colors;