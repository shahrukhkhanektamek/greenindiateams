// Color Palette for Green India Team
export const colors = {
  // =========== GREEN INDIA TEAM PRIMARY COLORS ===========
  // Primary Greens - Based on your branding
  primary: '#2E7D32',        // Forest Green - Main brand color
  primaryLight: '#4CAF50',   // Fresh Green
  primaryLighter: '#81C784', // Light Green
  primaryDark: '#1B5E20',    // Deep Emerald
  primaryDarker: '#33691E',  // Olive Green
  
  // Secondary/Accent Colors
  secondary: '#FFB300',      // Sunshine Yellow - Accent color
  secondaryLight: '#FFCA28', // Light Yellow
  secondaryDark: '#FF8F00',  // Dark Yellow/Orange
  
  tertiary: '#26A69A',       // Teal - Supporting color
  tertiaryLight: '#4DB6AC',  // Light Teal
  tertiaryDark: '#00796B',   // Dark Teal
  
  // =========== STATUS & SYSTEM COLORS ===========
  // Status colors (using green-based success)
  success: '#2E7D32',        // Same as primary for consistency
  successLight: '#E8F5E9',
  successDark: '#1B5E20',
  
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  warningDark: '#F57C00',
  
  error: '#F44336',
  errorLight: '#FFEBEE',
  errorDark: '#D32F2F',
  
  info: '#2196F3',
  infoLight: '#E3F2FD',
  infoDark: '#1976D2',
  
  // =========== NEUTRAL & UI COLORS ===========
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8F8F8',
  backgroundTertiary: '#F5F5F5',
  
  // Surface & Card colors
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  
  // Text colors
  text: '#212121',           // Dark Gray for main text
  textSecondary: '#666666',  // Medium Gray
  textTertiary: '#9E9E9E',   // Light Gray
  textDisabled: '#BDBDBD',   // Disabled text
  textInverse: '#FFFFFF',    // White text on dark backgrounds
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  borderFocused: '#2E7D32',  // Green border for focused inputs
  
  // =========== GRAYSCALE ===========
  white: '#FFFFFF',
  black: '#000000',
  
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  winner: '#c5eec7',
  winnerL: '#fdf7d7',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // =========== SPECIAL COLORS ===========
  // Eco/Environmental specific
  ecoGreen: '#43A047',
  ecoBlue: '#0288D1',
  ecoBrown: '#795548',
  
  // Social colors
  facebook: '#1877F2',
  google: '#DB4437',
  whatsapp: '#25D366',
  
  // Transparent & Effects
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.3)',
  
  // =========== GRADIENTS ===========
  // Green gradients
  gradientPrimary: ['#2E7D32', '#4CAF50'],       // Forest to Fresh Green
  gradientSecondary: ['#1B5E20', '#2E7D32'],     // Dark to Medium Green
  gradientAccent: ['#FFB300', '#FFCA28'],        // Yellow gradient
  
  // Mixed gradients
  gradientEco: ['#2E7D32', '#26A69A'],           // Green to Teal
  gradientSunrise: ['#FFB300', '#FF9800'],       // Yellow to Orange
  
  // UI gradients
  gradientCard: ['#FFFFFF', '#F8F8F8'],          // Subtle card gradient
  gradientButton: ['#2E7D32', '#1B5E20'],        // Primary button gradient
  
  // =========== SHADOWS & EFFECTS ===========
  shadowColor: '#000000',
  shadowOpacity: 0.1,
  
  // =========== ACCESSIBILITY ===========
  // High contrast colors for accessibility
  highContrastText: '#000000',
  highContrastBackground: '#FFFFFF',
  
  // Focus indicators
  focusRing: '#2E7D32',
  focusRingLight: 'rgba(46, 125, 50, 0.3)',
  
  // =========== THEME VARIATIONS ===========
  // For dark mode support (you can expand this)
  dark: {
    primary: '#4CAF50',           // Lighter green for dark mode
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
  },
  
  // For light mode
  light: {
    primary: '#2E7D32',
    background: '#FFFFFF',
    surface: '#F8F8F8',
    text: '#212121',
    textSecondary: '#666666',
    border: '#E0E0E0',
  }
};

// Helper functions for dynamic theming
export const getThemeColors = (theme = 'light') => {
  const baseColors = { ...colors };
  if (theme === 'dark') {
    return {
      ...baseColors,
      primary: colors.dark.primary,
      background: colors.dark.background,
      surface: colors.dark.surface,
      text: colors.dark.text,
      textSecondary: colors.dark.textSecondary,
      border: colors.dark.border,
    };
  }
  return {
    ...baseColors,
    primary: colors.light.primary,
    background: colors.light.background,
    surface: colors.light.surface,
    text: colors.light.text,
    textSecondary: colors.light.textSecondary,
    border: colors.light.border,
  };
};

// Component-specific color mappings
export const componentColors = {
  // Button colors
  button: {
    primary: {
      background: colors.primary,
      text: colors.white,
      border: colors.primary,
    },
    secondary: {
      background: colors.secondary,
      text: colors.gray900,
      border: colors.secondary,
    },
    outline: {
      background: colors.transparent,
      text: colors.primary,
      border: colors.primary,
    },
  },
  
  // Input colors
  input: {
    background: colors.white,
    border: colors.border,
    text: colors.text,
    placeholder: colors.textTertiary,
    focused: {
      border: colors.primary,
      background: colors.white,
    },
  },
  
  // Card colors
  card: {
    background: colors.card,
    border: colors.borderLight,
    shadow: colors.overlay,
  },
  
  // Badge colors
  badge: {
    success: {
      background: colors.successLight,
      text: colors.successDark,
    },
    warning: {
      background: colors.warningLight,
      text: colors.warningDark,
    },
    info: {
      background: colors.infoLight,
      text: colors.infoDark,
    },
  },
};

// Usage examples in components:
/*
// In your component:
import { colors, getThemeColors } from './colors';

// For static colors:
const MyComponent = () => (
  <View style={{ backgroundColor: colors.primary }}>
    <Text style={{ color: colors.white }}>Green India Team</Text>
  </View>
);

// For theme-aware colors:
const ThemeAwareComponent = ({ theme }) => {
  const themeColors = getThemeColors(theme);
  return (
    <View style={{ backgroundColor: themeColors.background }}>
      <Text style={{ color: themeColors.text }}>Content</Text>
    </View>
  );
};
*/

export default colors;