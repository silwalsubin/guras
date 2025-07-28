
// Color palette for the meditation app
export const COLORS = {
  // Primary brand colors
  PRIMARY: '#14B8A6',
  PRIMARY_DARK: '#0D9488',
  PRIMARY_LIGHT: '#5EEAD4',
  
  // Secondary colors
  SECONDARY: '#6366F1',
  SECONDARY_DARK: '#4F46E5',
  SECONDARY_LIGHT: '#A5B4FC',
  
  // Neutral colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  
  // Gray scale
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',
  
  // Status colors
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  
  // Background colors
  BACKGROUND_LIGHT: '#F0F8FF',
  BACKGROUND_LIGHT_SECONDARY: '#E6F3FF',
  BACKGROUND_DARK: '#1A1A2E',
  BACKGROUND_DARK_SECONDARY: '#252540',
  
  // Text colors
  TEXT_PRIMARY_LIGHT: '#2D3748',
  TEXT_SECONDARY_LIGHT: '#718096',
  TEXT_PRIMARY_DARK: '#FFFFFF',
  TEXT_SECONDARY_DARK: '#CBD5E0',
  
  // Border colors
  BORDER_LIGHT: 'rgba(0,0,0,0.1)',
  BORDER_DARK: 'rgba(255,255,255,0.1)',
  
  // Overlay colors
  OVERLAY_LIGHT: 'rgba(230, 243, 255, 0.8)',
  OVERLAY_DARK: 'rgba(22, 33, 62, 0.7)',
  
  // Navigation colors
  NAV_ACTIVE: '#14B8A6',
  NAV_INACTIVE: '#718096',
  
  // Card colors
  CARD_LIGHT: '#FFFFFF',
  CARD_DARK: '#2A2A3E',
  
  // Shadow colors
  SHADOW: '#000000',
};

// Theme-aware color getters
export const getThemeColors = (isDarkMode: boolean) => ({
  // Background colors
  background: isDarkMode ? COLORS.BACKGROUND_DARK : COLORS.BACKGROUND_LIGHT,
  backgroundSecondary: isDarkMode ? COLORS.BACKGROUND_DARK_SECONDARY : COLORS.BACKGROUND_LIGHT_SECONDARY,
  
  // Text colors
  textPrimary: isDarkMode ? COLORS.TEXT_PRIMARY_DARK : COLORS.TEXT_PRIMARY_LIGHT,
  textSecondary: isDarkMode ? COLORS.TEXT_SECONDARY_DARK : COLORS.TEXT_SECONDARY_LIGHT,
  
  // Card colors
  card: isDarkMode ? COLORS.CARD_DARK : COLORS.CARD_LIGHT,
  
  // Border colors
  border: isDarkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,
  
  // Overlay colors
  overlay: isDarkMode ? COLORS.OVERLAY_DARK : COLORS.OVERLAY_LIGHT,
  
  // Navigation colors
  navActive: COLORS.NAV_ACTIVE,
  navInactive: isDarkMode ? COLORS.TEXT_SECONDARY_DARK : COLORS.NAV_INACTIVE,
});

// Semantic color getters
export const getSemanticColors = () => ({
  success: COLORS.SUCCESS,
  warning: COLORS.WARNING,
  error: COLORS.ERROR,
  info: COLORS.INFO,
});

// Brand color getters
export const getBrandColors = () => ({
  primary: COLORS.PRIMARY,
  primaryDark: COLORS.PRIMARY_DARK,
  primaryLight: COLORS.PRIMARY_LIGHT,
  secondary: COLORS.SECONDARY,
  secondaryDark: COLORS.SECONDARY_DARK,
  secondaryLight: COLORS.SECONDARY_LIGHT,
});

// Color utilities
export const colorUtils = {
  // Opacity helpers
  withOpacity: (color: string, opacity: number) => {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  
  // Lighten color
  lighten: (color: string) => {
    // Simple lighten implementation
    return color; // Placeholder - implement if needed
  },
  
  // Darken color
  darken: (color: string) => {
    // Simple darken implementation
    return color; // Placeholder - implement if needed
  },
}; 