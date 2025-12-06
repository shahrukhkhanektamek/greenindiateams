import { StyleSheet } from 'react-native';
import responsive from '../utils/responsive';
import bootstrapStyles, { generateResponsiveStyles } from './bootstrapStyles';
import { colors } from './colors';

// Merge bootstrap styles with responsive variations
const responsiveStyles = generateResponsiveStyles();

// Create comprehensive styles object
const globalStyles = StyleSheet.create({
  // Import all bootstrap styles
  ...bootstrapStyles,
  ...responsiveStyles,
  
  // =========== CUSTOM COMPONENT STYLES ===========
  // Button variants
  btn: {
    ...bootstrapStyles.flexRow,
    ...bootstrapStyles.itemsCenter,
    ...bootstrapStyles.justifyCenter,
    ...bootstrapStyles.rounded,
    ...bootstrapStyles.p3,
    ...bootstrapStyles.bgPrimary,
  },
  
  btnText: {
    ...bootstrapStyles.textWhite,
    ...bootstrapStyles.fontBold,
    ...bootstrapStyles.textBase,
  },
  
  btnOutline: {
    ...bootstrapStyles.btn,
    ...bootstrapStyles.bgTransparent,
    ...bootstrapStyles.border,
    ...bootstrapStyles.borderPrimary,
  },
  
  btnOutlineText: {
    ...bootstrapStyles.textPrimary,
    ...bootstrapStyles.fontBold,
    ...bootstrapStyles.textBase,
  },
  
  btnSm: {
    ...bootstrapStyles.p2,
  },
  
  btnLg: {
    ...bootstrapStyles.p4,
  },
  
  // Card variants
  card: {
    ...bootstrapStyles.bgWhite,
    ...bootstrapStyles.roundedLg,
    ...bootstrapStyles.p4,
    ...bootstrapStyles.shadow,
    ...bootstrapStyles.mb3,
  },
  
  cardBody: {
    ...bootstrapStyles.flex1,
  },
  
  cardTitle: {
    ...bootstrapStyles.textXl,
    ...bootstrapStyles.fontBold,
    ...bootstrapStyles.textBlack,
    ...bootstrapStyles.mb2,
  },
  
  cardText: {
    ...bootstrapStyles.textBase,
    ...bootstrapStyles.textGray,
    ...bootstrapStyles.mb3,
  },
  
  // Form controls
  formControl: {
    ...bootstrapStyles.w100,
    ...bootstrapStyles.p3,
    ...bootstrapStyles.border,
    ...bootstrapStyles.rounded,
    ...bootstrapStyles.borderGray,
    ...bootstrapStyles.textBase,
    ...bootstrapStyles.textBlack,
    ...bootstrapStyles.bgWhite,
  },
  
  formLabel: {
    ...bootstrapStyles.textSm,
    ...bootstrapStyles.fontMedium,
    ...bootstrapStyles.textBlack,
    ...bootstrapStyles.mb1,
  },
  
  formText: {
    ...bootstrapStyles.textSm,
    ...bootstrapStyles.textMuted,
    ...bootstrapStyles.mt1,
  },
  
  // Alert variants
  alert: {
    ...bootstrapStyles.p4,
    ...bootstrapStyles.rounded,
    ...bootstrapStyles.mb3,
  },
  
  alertSuccess: {
    backgroundColor: colors.success + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  
  alertError: {
    backgroundColor: colors.error + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  
  alertWarning: {
    backgroundColor: colors.warning + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  
  alertInfo: {
    backgroundColor: colors.secondary + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  
  // Badge variants
  badge: {
    ...bootstrapStyles.inlineFlex,
    ...bootstrapStyles.px2,
    ...bootstrapStyles.py1,
    ...bootstrapStyles.textXs,
    ...bootstrapStyles.fontBold,
    ...bootstrapStyles.roundedFull,
    ...bootstrapStyles.textWhite,
  },
  
  badgePrimary: {
    backgroundColor: colors.primary,
  },
  
  badgeSecondary: {
    backgroundColor: colors.secondary,
  },
  
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  
  // Navigation
  navItem: {
    ...bootstrapStyles.flexRow,
    ...bootstrapStyles.itemsCenter,
    ...bootstrapStyles.p3,
    ...bootstrapStyles.bgTransparent,
  },
  
  navItemActive: {
    backgroundColor: colors.primary + '20',
  },
  
  // Screen containers
  screenContainer: {
    ...bootstrapStyles.flex1,
    ...bootstrapStyles.bgSurface,
  },
  
  screenContent: {
    ...bootstrapStyles.flex1,
    ...bootstrapStyles.container,
    ...bootstrapStyles.pt4,
    ...bootstrapStyles.pb6,
  },
  
  // Section styles
  section: {
    ...bootstrapStyles.mb6,
  },
  
  sectionTitle: {
    ...bootstrapStyles.text2xl,
    ...bootstrapStyles.fontBold,
    ...bootstrapStyles.textBlack,
    ...bootstrapStyles.mb4,
  },
  
  sectionSubtitle: {
    ...bootstrapStyles.textLg,
    ...bootstrapStyles.textGray,
    ...bootstrapStyles.mb4,
  },
  
  // Layout helpers
  centerAll: {
    ...bootstrapStyles.flex1,
    ...bootstrapStyles.justifyCenter,
    ...bootstrapStyles.itemsCenter,
  },
  
  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  
  // Responsive helpers
  responsivePadding: {
    paddingHorizontal: responsive.responsiveValue({
      base: 16,
      small: 12,
      large: 20,
      tablet: 24,
    }),
  },
  
  responsiveMargin: {
    marginHorizontal: responsive.responsiveValue({
      base: 16,
      small: 12,
      large: 20,
      tablet: 24,
    }),
  },
  
  // Aspect ratios
  aspectRatio: (ratio) => ({
    aspectRatio: ratio,
    width: '100%',
  }),
  
  aspectRatio1x1: {
    aspectRatio: 1,
    width: '100%',
  },
  
  aspectRatio4x3: {
    aspectRatio: 4/3,
    width: '100%',
  },
  
  aspectRatio16x9: {
    aspectRatio: 16/9,
    width: '100%',
  },
});

// Export individual style groups for easier access
export const layoutStyles = {
  container: globalStyles.container,
  row: globalStyles.row,
  col: globalStyles.col,
};

export const flexStyles = {
  flex: globalStyles.flex1,
  flexRow: globalStyles.flexRow,
  flexCol: globalStyles.flexColumn,
  justifyCenter: globalStyles.justifyCenter,
  itemsCenter: globalStyles.itemsCenter,
};

export const spacingStyles = {
  p: globalStyles.p3,
  m: globalStyles.m3,
  px: globalStyles.px3,
  py: globalStyles.py3,
  mx: globalStyles.mx3,
  my: globalStyles.my3,
};

export const textStyles = {
  h1: [globalStyles.text4xl, globalStyles.fontBold],
  h2: [globalStyles.text3xl, globalStyles.fontBold],
  h3: [globalStyles.text2xl, globalStyles.fontBold],
  h4: [globalStyles.textXl, globalStyles.fontBold],
  h5: [globalStyles.textLg, globalStyles.fontBold],
  h6: [globalStyles.textBase, globalStyles.fontBold],
  body: globalStyles.textBase,
  small: globalStyles.textSm,
  caption: globalStyles.textXs,
};

// Helper function to combine styles
export const clsx = (...styles) => {
  return styles.filter(Boolean).flat();
};

export default globalStyles;