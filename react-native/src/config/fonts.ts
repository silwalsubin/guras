import { Platform } from 'react-native';

// Font configuration for the meditation app
export const FONTS = {
  // Primary font - System fonts (iOS: San Francisco, Android: Roboto)
  PRIMARY: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  PRIMARY_BOLD: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  PRIMARY_SEMIBOLD: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  PRIMARY_MEDIUM: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  PRIMARY_LIGHT: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Secondary font - System fonts
  SECONDARY: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  SECONDARY_BOLD: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  SECONDARY_SEMIBOLD: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  SECONDARY_MEDIUM: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  SECONDARY_BLACK: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  SECONDARY_LIGHT: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Fallback fonts for better compatibility
  FALLBACK: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Quote-specific font - Georgia is excellent for inspirational text
  QUOTE: Platform.select({
    ios: 'Georgia',
    android: 'Georgia',
    default: 'Georgia',
  }),
};

// Font sizes for consistent typography
export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  BASE: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 28,
  DISPLAY: 32,
  DISPLAY_LG: 40,
  DISPLAY_XL: 48,
};

// Font weights
export const FONT_WEIGHTS = {
  LIGHT: '300' as const,
  REGULAR: '400' as const,
  MEDIUM: '500' as const,
  SEMIBOLD: '600' as const,
  BOLD: '700' as const,
  EXTRABOLD: '800' as const,
};

// Typography styles for consistent usage
export const TYPOGRAPHY = {
  // Headings
  H1: {
    fontFamily: FONTS.PRIMARY_BOLD,
    fontSize: FONT_SIZES.DISPLAY_XL,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  H2: {
    fontFamily: FONTS.PRIMARY_BOLD,
    fontSize: FONT_SIZES.DISPLAY_LG,
    fontWeight: FONT_WEIGHTS.BOLD,
  },
  H3: {
    fontFamily: FONTS.PRIMARY_SEMIBOLD,
    fontSize: FONT_SIZES.DISPLAY,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
  },
  H4: {
    fontFamily: FONTS.PRIMARY_SEMIBOLD,
    fontSize: FONT_SIZES.XXXL,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
  },
  H5: {
    fontFamily: FONTS.PRIMARY_MEDIUM,
    fontSize: FONT_SIZES.XXL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  H6: {
    fontFamily: FONTS.PRIMARY_MEDIUM,
    fontSize: FONT_SIZES.XL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  
  // Body text
  BODY_LARGE: {
    fontFamily: FONTS.PRIMARY,
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  BODY: {
    fontFamily: FONTS.PRIMARY,
    fontSize: FONT_SIZES.BASE,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  BODY_SMALL: {
    fontFamily: FONTS.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  BODY_XSMALL: {
    fontFamily: FONTS.PRIMARY,
    fontSize: FONT_SIZES.XS,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  
  // Buttons
  BUTTON_LARGE: {
    fontFamily: FONTS.SECONDARY_SEMIBOLD,
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
  },
  BUTTON: {
    fontFamily: FONTS.SECONDARY_SEMIBOLD,
    fontSize: FONT_SIZES.BASE,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
  },
  BUTTON_SMALL: {
    fontFamily: FONTS.SECONDARY_MEDIUM,
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  
  // Labels and captions
  LABEL: {
    fontFamily: FONTS.SECONDARY_MEDIUM,
    fontSize: FONT_SIZES.SM,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  CAPTION: {
    fontFamily: FONTS.SECONDARY,
    fontSize: FONT_SIZES.XS,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  
  // Special text
  LOGO: {
    fontFamily: FONTS.QUOTE,
    fontSize: FONT_SIZES.XXL,
    fontWeight: FONT_WEIGHTS.SEMIBOLD,
    fontStyle: 'italic',
  },
  QUOTE: {
    fontFamily: FONTS.QUOTE,
    fontSize: FONT_SIZES.LG,
    fontWeight: FONT_WEIGHTS.REGULAR,
    fontStyle: 'italic',
  },
}; 