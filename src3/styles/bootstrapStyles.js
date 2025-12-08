import { StyleSheet } from 'react-native';
import responsive from '../utils/responsive';
import normalize, { fontSizes, spacingScale, borderRadiusScale } from '../utils/normalize';
import { colors } from './colors';

// Bootstrap-like Utility Classes
const bootstrapStyles = StyleSheet.create({
  // =========== DISPLAY & POSITION ===========
  dFlex: { display: 'flex' },
  dNone: { display: 'none' },
  
  flexRow: { flexDirection: 'row' },
  flexRowReverse: { flexDirection: 'row-reverse' },
  flexColumn: { flexDirection: 'column' },
  flexColumnReverse: { flexDirection: 'column-reverse' },
  
  flexWrap: { flexWrap: 'wrap' },
  flexNoWrap: { flexWrap: 'nowrap' },
  
  flex1: { flex: 1 },
  flexAuto: { flex: 1 },
  flexNone: { flex: 0 },
  
  flexGrow0: { flexGrow: 0 },
  flexGrow1: { flexGrow: 1 },
  
  flexShrink0: { flexShrink: 0 },
  flexShrink1: { flexShrink: 1 },
  
  // =========== JUSTIFY CONTENT ===========
  justifyStart: { justifyContent: 'flex-start' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyCenter: { justifyContent: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyAround: { justifyContent: 'space-around' },
  justifyEvenly: { justifyContent: 'space-evenly' },
  
  // =========== ALIGN ITEMS ===========
  itemsStart: { alignItems: 'flex-start' },
  itemsEnd: { alignItems: 'flex-end' },
  itemsCenter: { alignItems: 'center' },
  itemsBaseline: { alignItems: 'baseline' },
  itemsStretch: { alignItems: 'stretch' },
  
  // =========== ALIGN SELF ===========
  selfAuto: { alignSelf: 'auto' },
  selfStart: { alignSelf: 'flex-start' },
  selfEnd: { alignSelf: 'flex-end' },
  selfCenter: { alignSelf: 'center' },
  selfStretch: { alignSelf: 'stretch' },
  selfBaseline: { alignSelf: 'baseline' },
  
  // =========== ALIGN CONTENT ===========
  contentStart: { alignContent: 'flex-start' },
  contentEnd: { alignContent: 'flex-end' },
  contentCenter: { alignContent: 'center' },
  contentBetween: { alignContent: 'space-between' },
  contentAround: { alignContent: 'space-around' },
  contentStretch: { alignContent: 'stretch' },
  
  // =========== POSITION ===========
  positionRelative: { position: 'relative' },
  positionAbsolute: { position: 'absolute' },
  
  top0: { top: 0 },
  top50: { top: '50%' },
  top100: { top: '100%' },
  
  bottom0: { bottom: 0 },
  bottom50: { bottom: '50%' },
  bottom100: { bottom: '100%' },
  
  start0: { left: 0 },
  start50: { left: '50%' },
  start100: { left: '100%' },
  
  end0: { right: 0 },
  end50: { right: '50%' },
  end100: { right: '100%' },
  
  // =========== WIDTH ===========
  w25: { width: '25%' },
  w33: { width: '33.333333%' },
  w50: { width: '50%' },
  w66: { width: '66.666667%' },
  w75: { width: '75%' },
  w100: { width: '100%' },
  wAuto: { width: 'auto' },
  
  // Responsive widths
  wScreen: { width: responsive.width },
  wMin: { width: 'min-content' },
  wMax: { width: 'max-content' },
  
  // =========== HEIGHT ===========
  h25: { height: '25%' },
  h33: { height: '33.333333%' },
  h50: { height: '50%' },
  h66: { height: '66.666667%' },
  h75: { height: '75%' },
  h100: { height: '100%' },
  hAuto: { height: 'auto' },
  
  // Responsive heights
  hScreen: { height: responsive.height },
  hMin: { height: 'min-content' },
  hMax: { height: 'max-content' },
  
  // =========== MARGIN ===========
  m0: { margin: spacingScale[0] },
  m1: { margin: spacingScale[1] },
  m2: { margin: spacingScale[2] },
  m3: { margin: spacingScale[3] },
  m4: { margin: spacingScale[4] },
  m5: { margin: spacingScale[5] },
  mAuto: { margin: 'auto' },
  
  // Margin Horizontal
  mx0: { marginHorizontal: spacingScale[0] },
  mx1: { marginHorizontal: spacingScale[1] },
  mx2: { marginHorizontal: spacingScale[2] },
  mx3: { marginHorizontal: spacingScale[3] },
  mx4: { marginHorizontal: spacingScale[4] },
  mx5: { marginHorizontal: spacingScale[5] },
  mxAuto: { marginHorizontal: 'auto' },
  
  // Margin Vertical
  my0: { marginVertical: spacingScale[0] },
  my1: { marginVertical: spacingScale[1] },
  my2: { marginVertical: spacingScale[2] },
  my3: { marginVertical: spacingScale[3] },
  my4: { marginVertical: spacingScale[4] },
  my5: { marginVertical: spacingScale[5] },
  myAuto: { marginVertical: 'auto' },
  
  // Margin Top
  mt0: { marginTop: spacingScale[0] },
  mt1: { marginTop: spacingScale[1] },
  mt2: { marginTop: spacingScale[2] },
  mt3: { marginTop: spacingScale[3] },
  mt4: { marginTop: spacingScale[4] },
  mt5: { marginTop: spacingScale[5] },
  mtAuto: { marginTop: 'auto' },
  
  // Margin Bottom
  mb0: { marginBottom: spacingScale[0] },
  mb1: { marginBottom: spacingScale[1] },
  mb2: { marginBottom: spacingScale[2] },
  mb3: { marginBottom: spacingScale[3] },
  mb4: { marginBottom: spacingScale[4] },
  mb5: { marginBottom: spacingScale[5] },
  mbAuto: { marginBottom: 'auto' },
  
  // Margin Start/Left
  ms0: { marginLeft: spacingScale[0] },
  ms1: { marginLeft: spacingScale[1] },
  ms2: { marginLeft: spacingScale[2] },
  ms3: { marginLeft: spacingScale[3] },
  ms4: { marginLeft: spacingScale[4] },
  ms5: { marginLeft: spacingScale[5] },
  msAuto: { marginLeft: 'auto' },
  
  // Margin End/Right
  me0: { marginRight: spacingScale[0] },
  me1: { marginRight: spacingScale[1] },
  me2: { marginRight: spacingScale[2] },
  me3: { marginRight: spacingScale[3] },
  me4: { marginRight: spacingScale[4] },
  me5: { marginRight: spacingScale[5] },
  meAuto: { marginRight: 'auto' },
  
  // =========== PADDING ===========
  p0: { padding: spacingScale[0] },
  p1: { padding: spacingScale[1] },
  p2: { padding: spacingScale[2] },
  p3: { padding: spacingScale[3] },
  p4: { padding: spacingScale[4] },
  p5: { padding: spacingScale[5] },
  
  // Padding Horizontal
  px0: { paddingHorizontal: spacingScale[0] },
  px1: { paddingHorizontal: spacingScale[1] },
  px2: { paddingHorizontal: spacingScale[2] },
  px3: { paddingHorizontal: spacingScale[3] },
  px4: { paddingHorizontal: spacingScale[4] },
  px5: { paddingHorizontal: spacingScale[5] },
  
  // Padding Vertical
  py0: { paddingVertical: spacingScale[0] },
  py1: { paddingVertical: spacingScale[1] },
  py2: { paddingVertical: spacingScale[2] },
  py3: { paddingVertical: spacingScale[3] },
  py4: { paddingVertical: spacingScale[4] },
  py5: { paddingVertical: spacingScale[5] },
  
  // Padding Top
  pt0: { paddingTop: spacingScale[0] },
  pt1: { paddingTop: spacingScale[1] },
  pt2: { paddingTop: spacingScale[2] },
  pt3: { paddingTop: spacingScale[3] },
  pt4: { paddingTop: spacingScale[4] },
  pt5: { paddingTop: spacingScale[5] },
  
  // Padding Bottom
  pb0: { paddingBottom: spacingScale[0] },
  pb1: { paddingBottom: spacingScale[1] },
  pb2: { paddingBottom: spacingScale[2] },
  pb3: { paddingBottom: spacingScale[3] },
  pb4: { paddingBottom: spacingScale[4] },
  pb5: { paddingBottom: spacingScale[5] },
  
  // Padding Start/Left
  ps0: { paddingLeft: spacingScale[0] },
  ps1: { paddingLeft: spacingScale[1] },
  ps2: { paddingLeft: spacingScale[2] },
  ps3: { paddingLeft: spacingScale[3] },
  ps4: { paddingLeft: spacingScale[4] },
  ps5: { paddingLeft: spacingScale[5] },
  
  // Padding End/Right
  pe0: { paddingRight: spacingScale[0] },
  pe1: { paddingRight: spacingScale[1] },
  pe2: { paddingRight: spacingScale[2] },
  pe3: { paddingRight: spacingScale[3] },
  pe4: { paddingRight: spacingScale[4] },
  pe5: { paddingRight: spacingScale[5] },
  
  // =========== BORDER ===========
  border0: { borderWidth: 0 },
  border: { borderWidth: 1 },
  border2: { borderWidth: 2 },
  border4: { borderWidth: 4 },
  border8: { borderWidth: 8 },
  
  // Border Color
  borderTransparent: { borderColor: 'transparent' },
  borderWhite: { borderColor: colors.white },
  borderBlack: { borderColor: colors.black },
  borderPrimary: { borderColor: colors.primary },
  borderSecondary: { borderColor: colors.secondary },
  borderSuccess: { borderColor: colors.success },
  borderWarning: { borderColor: colors.warning },
  borderError: { borderColor: colors.error },
  borderGray: { borderColor: colors.border },
  
  // Border Radius
  roundedNone: { borderRadius: borderRadiusScale.none },
  roundedSm: { borderRadius: borderRadiusScale.sm },
  rounded: { borderRadius: borderRadiusScale.default },
  roundedMd: { borderRadius: borderRadiusScale.md },
  roundedLg: { borderRadius: borderRadiusScale.lg },
  roundedXl: { borderRadius: borderRadiusScale.xl },
  rounded2xl: { borderRadius: borderRadiusScale['2xl'] },
  rounded3xl: { borderRadius: borderRadiusScale['3xl'] },
  roundedFull: { borderRadius: borderRadiusScale.full },
  
  roundedTopNone: { 
    borderTopLeftRadius: borderRadiusScale.none,
    borderTopRightRadius: borderRadiusScale.none,
  },
  roundedTop: { 
    borderTopLeftRadius: borderRadiusScale.default,
    borderTopRightRadius: borderRadiusScale.default,
  },
  roundedBottomNone: { 
    borderBottomLeftRadius: borderRadiusScale.none,
    borderBottomRightRadius: borderRadiusScale.none,
  },
  roundedBottom: { 
    borderBottomLeftRadius: borderRadiusScale.default,
    borderBottomRightRadius: borderRadiusScale.default,
  },
  
  // =========== TEXT ===========
  // Font Size
  textXs: { fontSize: fontSizes.xs },
  textSm: { fontSize: fontSizes.sm },
  textBase: { fontSize: fontSizes.base },
  textLg: { fontSize: fontSizes.lg },
  textXl: { fontSize: fontSizes.xl },
  text2xl: { fontSize: fontSizes['2xl'] },
  text3xl: { fontSize: fontSizes['3xl'] },
  text4xl: { fontSize: fontSizes['4xl'] },
  text5xl: { fontSize: fontSizes['5xl'] },
  text6xl: { fontSize: fontSizes['6xl'] },
  
  // Font Weight
  fontThin: { fontWeight: '100' },
  fontExtralight: { fontWeight: '200' },
  fontLight: { fontWeight: '300' },
  fontNormal: { fontWeight: '400' },
  fontMedium: { fontWeight: '500' },
  fontSemibold: { fontWeight: '600' },
  fontBold: { fontWeight: '700' },
  fontExtrabold: { fontWeight: '800' },
  fontBlack: { fontWeight: '900' },
  
  // Text Alignment
  textLeft: { textAlign: 'left' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textJustify: { textAlign: 'justify' },
  
  // Text Color
  textWhite: { color: colors.white },
  textBlack: { color: colors.black },
  textPrimary: { color: colors.primary },
  textSecondary: { color: colors.secondary },
  textSuccess: { color: colors.success },
  textWarning: { color: colors.warning },
  textError: { color: colors.error },
  textGray: { color: colors.textLight },
  textMuted: { color: colors.textMuted },
  
  // Text Decoration
  underline: { textDecorationLine: 'underline' },
  lineThrough: { textDecorationLine: 'line-through' },
  noUnderline: { textDecorationLine: 'none' },
  
  // Text Transform
  uppercase: { textTransform: 'uppercase' },
  lowercase: { textTransform: 'lowercase' },
  capitalize: { textTransform: 'capitalize' },
  normalCase: { textTransform: 'none' },
  
  // =========== BACKGROUND ===========
  bgTransparent: { backgroundColor: 'transparent' },
  bgWhite: { backgroundColor: colors.white },
  bgBlack: { backgroundColor: colors.black },
  bgPrimary: { backgroundColor: colors.primary },
  bgSecondary: { backgroundColor: colors.secondary },
  bgSuccess: { backgroundColor: colors.success },
  bgWarning: { backgroundColor: colors.warning },
  bgError: { backgroundColor: colors.error },
  bgGray: { backgroundColor: colors.gray },
  bgSurface: { backgroundColor: colors.surface },
  
  // =========== OPACITY ===========
  opacity0: { opacity: 0 },
  opacity25: { opacity: 0.25 },
  opacity50: { opacity: 0.5 },
  opacity75: { opacity: 0.75 },
  opacity100: { opacity: 1 },
  
  // =========== Z-INDEX ===========
  z0: { zIndex: 0 },
  z10: { zIndex: 10 },
  z20: { zIndex: 20 },
  z30: { zIndex: 30 },
  z40: { zIndex: 40 },
  z50: { zIndex: 50 },
  zAuto: { zIndex: 'auto' },
  
  // =========== OVERFLOW ===========
  overflowVisible: { overflow: 'visible' },
  overflowHidden: { overflow: 'hidden' },
  overflowScroll: { overflow: 'scroll' },
  
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
  shadowXl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  
  // =========== GRID SYSTEM ===========
  container: {
    width: '100%',
    paddingHorizontal: responsive.responsiveValue({
      base: spacingScale[4],
      small: spacingScale[2],
      large: spacingScale[6],
      tablet: spacingScale[8],
    }),
  },
  
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: responsive.responsiveValue({
      base: -spacingScale[2],
      small: -spacingScale[1],
      large: -spacingScale[3],
    }),
  },
  
  col: {
    paddingHorizontal: responsive.responsiveValue({
      base: spacingScale[2],
      small: spacingScale[1],
      large: spacingScale[3],
    }),
  },
  
  col1: { width: '8.333333%' },
  col2: { width: '16.666667%' },
  col3: { width: '25%' },
  col4: { width: '33.333333%' },
  col5: { width: '41.666667%' },
  col6: { width: '50%' },
  col7: { width: '58.333333%' },
  col8: { width: '66.666667%' },
  col9: { width: '75%' },
  col10: { width: '83.333333%' },
  col11: { width: '91.666667%' },
  col12: { width: '100%' },
  
  // Responsive columns
  colSm1: responsive.isSmallDevice() ? { width: '8.333333%' } : {},
  colSm2: responsive.isSmallDevice() ? { width: '16.666667%' } : {},
  colSm3: responsive.isSmallDevice() ? { width: '25%' } : {},
  colSm4: responsive.isSmallDevice() ? { width: '33.333333%' } : {},
  colSm5: responsive.isSmallDevice() ? { width: '41.666667%' } : {},
  colSm6: responsive.isSmallDevice() ? { width: '50%' } : {},
  colSm7: responsive.isSmallDevice() ? { width: '58.333333%' } : {},
  colSm8: responsive.isSmallDevice() ? { width: '66.666667%' } : {},
  colSm9: responsive.isSmallDevice() ? { width: '75%' } : {},
  colSm10: responsive.isSmallDevice() ? { width: '83.333333%' } : {},
  colSm11: responsive.isSmallDevice() ? { width: '91.666667%' } : {},
  colSm12: responsive.isSmallDevice() ? { width: '100%' } : {},
  
  colLg1: responsive.isLargeDevice() ? { width: '8.333333%' } : {},
  colLg2: responsive.isLargeDevice() ? { width: '16.666667%' } : {},
  colLg3: responsive.isLargeDevice() ? { width: '25%' } : {},
  colLg4: responsive.isLargeDevice() ? { width: '33.333333%' } : {},
  colLg5: responsive.isLargeDevice() ? { width: '41.666667%' } : {},
  colLg6: responsive.isLargeDevice() ? { width: '50%' } : {},
  colLg7: responsive.isLargeDevice() ? { width: '58.333333%' } : {},
  colLg8: responsive.isLargeDevice() ? { width: '66.666667%' } : {},
  colLg9: responsive.isLargeDevice() ? { width: '75%' } : {},
  colLg10: responsive.isLargeDevice() ? { width: '83.333333%' } : {},
  colLg11: responsive.isLargeDevice() ? { width: '91.666667%' } : {},
  colLg12: responsive.isLargeDevice() ? { width: '100%' } : {},
});

// Generate responsive style variations
export const generateResponsiveStyles = () => {
  const responsiveStyles = {};
  
  // Generate responsive text sizes
  ['textXs', 'textSm', 'textBase', 'textLg', 'textXl', 'text2xl', 'text3xl', 'text4xl', 'text5xl', 'text6xl'].forEach(styleName => {
    responsiveStyles[styleName] = responsive.createResponsiveStyle(
      bootstrapStyles[styleName],
      {
        small: { fontSize: fontSizes[styleName.replace('text', '').toLowerCase()] * 0.9 },
        large: { fontSize: fontSizes[styleName.replace('text', '').toLowerCase()] * 1.1 },
        tablet: { fontSize: fontSizes[styleName.replace('text', '').toLowerCase()] * 1.2 },
      }
    );
  });
  
  return responsiveStyles;
};

export default bootstrapStyles;