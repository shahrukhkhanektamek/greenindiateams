import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './colors';

const { width, height } = Dimensions.get('window');

// Helper function to combine styles
export const clsx = (...styles) => {
  return styles.filter(Boolean).flat();
};

// Responsive scaling
export const scaleFont = (size) => {
  const scaleFactor = width / 375; // iPhone 11 width
  return Math.round(size * scaleFactor);
};

export const scaleSize = (size) => {
  const scaleFactor = width / 375;
  return Math.round(size * scaleFactor);
};

// Global Styles
const globalStyles = StyleSheet.create({
  // =========== CONTAINERS ===========
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  
  // =========== FLEXBOX ===========
  flex1: { flex: 1 },
  flexGrow1: { flexGrow: 1 },
  flexRow: { flexDirection: 'row' },
  flexCol: { flexDirection: 'column' },
  flexWrap: { flexWrap: 'wrap' },
  
  // Justify Content
  justifyStart: { justifyContent: 'flex-start' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyCenter: { justifyContent: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyAround: { justifyContent: 'space-around' },
  
  // Align Items
  itemsStart: { alignItems: 'flex-start' },
  itemsEnd: { alignItems: 'flex-end' },
  itemsCenter: { alignItems: 'center' },
  itemsStretch: { alignItems: 'stretch' },
  
  // =========== SPACING ===========
  // Padding
  p0: { padding: 0 },
  p2: { padding: scaleSize(8) },
  p3: { padding: scaleSize(12) },
  p4: { padding: scaleSize(16) },
  p6: { padding: scaleSize(24) },
  p8: { padding: scaleSize(32) },
  p12: { padding: scaleSize(48) },
  
  px0: { paddingHorizontal: 0 },
  px2: { paddingHorizontal: scaleSize(8) },
  px3: { paddingHorizontal: scaleSize(12) },
  px4: { paddingHorizontal: scaleSize(16) },
  px6: { paddingHorizontal: scaleSize(24) },
  px8: { paddingHorizontal: scaleSize(32) },
  
  py0: { paddingVertical: 0 },
  py2: { paddingVertical: scaleSize(8) },
  py3: { paddingVertical: scaleSize(12) },
  py4: { paddingVertical: scaleSize(16) },
  py6: { paddingVertical: scaleSize(24) },
  py8: { paddingVertical: scaleSize(32) },
  
  pt8: { paddingTop: scaleSize(32) },
  pt12: { paddingTop: scaleSize(48) },
  
  pt2: { paddingTop: scaleSize(10) },
  pt3: { paddingTop: scaleSize(12) },
  pb2: { paddingBottom: scaleSize(10) },
  pb3: { paddingBottom: scaleSize(12) },
  pb4: { paddingBottom: scaleSize(14) },
  pb5: { paddingBottom: scaleSize(16) },
  pb6: { paddingBottom: scaleSize(24) },
  pb8: { paddingBottom: scaleSize(32) },
  
  // Margin
  m0: { margin: 0 },
  m2: { margin: scaleSize(8) },
  m4: { margin: scaleSize(16) },
  m6: { margin: scaleSize(24) },
  m8: { margin: scaleSize(32) },
  
  mtN8: { marginTop: scaleSize(-32) },
  mt2: { marginTop: scaleSize(8) },
  mt4: { marginTop: scaleSize(16) },
  mt6: { marginTop: scaleSize(24) },
  mt8: { marginTop: scaleSize(32) },
  
  mb1: { marginBottom: scaleSize(4) },
  mb2: { marginBottom: scaleSize(8) },
  mb3: { marginBottom: scaleSize(8) },
  mb4: { marginBottom: scaleSize(16) },
  mb6: { marginBottom: scaleSize(24) },

  mr1: { marginRight: scaleSize(4) },
  mr2: { marginRight: scaleSize(8) },
  mr3: { marginRight: scaleSize(12) },
  mr4: { marginRight: scaleSize(16) },
  mr6: { marginRight: scaleSize(24) },
  
  mx0: { marginHorizontal: 0 },
  mx2: { marginHorizontal: scaleSize(8) },
  mx4: { marginHorizontal: scaleSize(16) },
  
  my2: { marginVertical: scaleSize(8) },
  my4: { marginVertical: scaleSize(16) },
  my6: { marginVertical: scaleSize(24) },
  my8: { marginVertical: scaleSize(32) },
  
  // =========== TYPOGRAPHY ===========
  // Font Sizes
  textXs: { fontSize: scaleFont(10) },
  textSm: { fontSize: scaleFont(12) },
  textBase: { fontSize: scaleFont(14) },
  textLg: { fontSize: scaleFont(16) },
  textXl: { fontSize: scaleFont(18) },
  text2xl: { fontSize: scaleFont(20) },
  text3xl: { fontSize: scaleFont(24) },
  text4xl: { fontSize: scaleFont(30) },
  text5xl: { fontSize: scaleFont(36) },
  text6xl: { fontSize: scaleFont(40) },
  text7xl: { fontSize: scaleFont(46) },
  text8xl: { fontSize: scaleFont(52) },
  text12xl: { fontSize: scaleFont(80) },
  
  // Font Weights
  fontThin: { fontWeight: '100' },
  fontLight: { fontWeight: '300' },
  fontNormal: { fontWeight: '400' },
  fontMedium: { fontWeight: '500' },
  fontSemibold: { fontWeight: '600' },
  fontBold: { fontWeight: '700' },
  fontBlack: { fontWeight: '900' },
  
  // Text Alignment
  textLeft: { textAlign: 'left' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textJustify: { textAlign: 'justify' },
  
  // Text Colors
  textWhite: { color: colors.white },
  textBlack: { color: colors.black }, 
  textPrimary: { color: colors.primary },
  textSecondary: { color: colors.secondary },
  textSuccess: { color: colors.success },
  textWarning: { color: colors.warning },
  textError: { color: colors.error },
  textInfo: { color: colors.info },
  textMuted: { color: colors.textMuted },
  textLight: { color: colors.textLight },
  textGray: { color: colors.gray500 },
  
  // =========== BACKGROUND ===========
  bgTransparent: { backgroundColor: 'transparent' },
  bgWhite: { backgroundColor: colors.white },
  bgBlack: { backgroundColor: colors.black },
  bgPrimary: { backgroundColor: colors.primary },
  bgPrimaryLight: { backgroundColor: colors.primaryLight },
  bgSecondary: { backgroundColor: colors.secondary },
  bgSecondaryLight: { backgroundColor: colors.secondaryLight },
  bgSuccess: { backgroundColor: colors.success },
  bgSuccessLight: { backgroundColor: colors.successLight },
  bgWarning: { backgroundColor: colors.warning },
  bgWarningLight: { backgroundColor: colors.warningLight },
  bgError: { backgroundColor: colors.error },
  bgErrorLight: { backgroundColor: colors.errorLight },
  bgInfo: { backgroundColor: colors.info },
  bgInfoLight: { backgroundColor: colors.infoLight },
  bgGray: { backgroundColor: colors.gray100 },
  bgSurface: { backgroundColor: colors.surface },
  
  // =========== BORDER ===========
  border0: { borderWidth: 0 },
  border: { borderWidth: 1 },
  border2: { borderWidth: 2 },
  border4: { borderWidth: 4 },
  
  borderTransparent: { borderColor: 'transparent' },
  borderWhite: { borderColor: colors.white },
  borderBlack: { borderColor: colors.black },
  borderPrimary: { borderColor: colors.primary },
  borderSecondary: { borderColor: colors.secondary },
  borderSuccess: { borderColor: colors.success },
  borderWarning: { borderColor: colors.warning },
  borderError: { borderColor: colors.error },
  borderGray: { borderColor: colors.border },
  borderLight: { borderColor: colors.borderLight },
  
  // =========== BORDER RADIUS ===========
  roundedNone: { borderRadius: 0 },
  roundedSm: { borderRadius: scaleSize(4) },
  rounded: { borderRadius: scaleSize(8) },
  roundedMd: { borderRadius: scaleSize(12) },
  roundedLg: { borderRadius: scaleSize(16) },
  roundedXl: { borderRadius: scaleSize(20) },
  rounded2xl: { borderRadius: scaleSize(24) },
  rounded3xl: { borderRadius: scaleSize(32) },
  roundedFull: { borderRadius: scaleSize(9999) },
  roundedT3xl: { 
    borderTopLeftRadius: scaleSize(32),
    borderTopRightRadius: scaleSize(32),
  },

  // Background colors
  bgGray50: { backgroundColor: colors.gray50 },
  bgGray200: { backgroundColor: colors.gray200 },

    // Add to the WIDTH & HEIGHT section:
    w1: { width: 1 },
    h1: { height: 1 },


    w10: { width: scaleSize(40) },
    w14: { width: scaleSize(56) },

    // Spacing
    px2: { paddingHorizontal: scaleSize(8) },
    py2: { paddingVertical: scaleSize(8) },

    // Text
    textXl: { fontSize: scaleFont(20) }, // बड़ा font size

    // Border
    borderDashed: { borderStyle: 'dashed' },

    // Position
    topNegative1: { top: -scaleSize(4) },
    rightNegative1: { right: -scaleSize(4) },

    // Background
    bgBlack50: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },

    // Height
    h80: { height: scaleSize(320) },
    maxH80: { maxHeight: scaleSize(320) },

    // Add to the SPACING section:
    mx1: { marginHorizontal: scaleSize(4) },

    // Add to the BACKGROUND section:
    bgGray100: { backgroundColor: colors.gray100 },

    // Add gap utility (if not exists):
    gap1: { gap: scaleSize(4) },
    gap2: { gap: scaleSize(8) },
    gap3: { gap: scaleSize(12) },
    gap4: { gap: scaleSize(16) },
  
  // =========== SHADOW ===========
  shadowNone: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  shadowSm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom:10,
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  shadowMd: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  shadowLg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // =========== WIDTH & HEIGHT ===========
  wFull: { width: '100%' },
  w2: { width: scaleSize(8) },
  w4: { width: scaleSize(16) },
  w5: { width: scaleSize(20) },
  w6: { width: scaleSize(24) },
  w8: { width: scaleSize(32) },
  w12: { width: scaleSize(48) },
  w16: { width: scaleSize(64) },
  w20: { width: scaleSize(80) },
  w24: { width: scaleSize(96) },
  
  hFull: { height: '100%' },
  hPx: { height: 1 },
  h2: { height: scaleSize(8) },
  h4: { height: scaleSize(16) },
  h5: { height: scaleSize(20) },
  h6: { height: scaleSize(24) },
  h8: { height: scaleSize(32) },
  h12: { height: scaleSize(48) },
  h16: { height: scaleSize(64) },
  h20: { height: scaleSize(80) },
  h24: { height: scaleSize(96) },
  
  // =========== POSITION ===========
  positionRelative: { position: 'relative' },
  positionAbsolute: { position: 'absolute' },
  
  top0: { top: 0 },
  top2: { top: scaleSize(8) },
  top4: { top: scaleSize(16) },
  
  bottom0: { bottom: 0 },
  bottom2: { bottom: scaleSize(8) },
  bottom4: { bottom: scaleSize(16) },
  
  left0: { left: 0 },
  left2: { left: scaleSize(8) },
  left4: { left: scaleSize(16) },
  
  right0: { right: 0 },
  right2: { right: scaleSize(8) },
  right4: { right: scaleSize(16) },
  
  // =========== OPACITY ===========
  opacity0: { opacity: 0 },
  opacity25: { opacity: 0.25 },
  opacity50: { opacity: 0.5 },
  opacity75: { opacity: 0.75 },
  opacity100: { opacity: 1 },
  
  // =========== LAYOUT UTILITIES ===========
  overflowHidden: { overflow: 'hidden' },
  overflowVisible: { overflow: 'visible' },
  
  z0: { zIndex: 0 },
  z10: { zIndex: 10 },
  z20: { zIndex: 20 },
  z30: { zIndex: 30 },
  z40: { zIndex: 40 },
  z50: { zIndex: 50 },
  
  // =========== SPECIAL ===========
  centerAll: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  card: {
    backgroundColor: colors.white,
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    marginBottom: scaleSize(16),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(12),
    fontSize: scaleFont(16),
    color: colors.text,
  },
  
  button: {
    backgroundColor: colors.primary,
    borderRadius: scaleSize(8),
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: colors.white,
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: scaleSize(8),
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonOutlineText: {
    color: colors.primary,
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
});

export default globalStyles;