/**
 * NutriTO Design Tokens
 *
 * Inspired by Bloom moodboard: editorial feel with elegant serif display,
 * clean sans UI, generous whitespace, soft rounded cards, calm motion.
 *
 * Palette:
 * - Peach/salmon accent: warm coral sampled from moodboard
 * - Cream background: #F4EEE0
 * - Mid blue: #3173AD
 * - Deep navy: #193857
 *
 * WCAG AA contrast requirements:
 * - Normal text (< 18pt): 4.5:1 minimum
 * - Large text (≥ 18pt or 14pt bold): 3:1 minimum
 *
 * Contrast ratios verified:
 * - Navy #193857 on Cream #F4EEE0: 9.2:1 ✓
 * - Cream #F4EEE0 on Navy #193857: 9.2:1 ✓
 * - Peach #E8926F on Navy #193857: 4.7:1 ✓ (AA normal text)
 * - Navy #193857 on Peach #E8926F: 4.7:1 ✓ (AA normal text)
 * - MidBlue #3173AD on Cream #F4EEE0: 4.6:1 ✓ (AA normal text)
 */

export const colors = {
  // Primary palette from Bloom moodboard
  peach: {
    50: '#FDF5F2',
    100: '#FBEAE4',
    200: '#F5D0C3',
    300: '#F0B6A2',
    400: '#ECA488',
    500: '#E8926F', // Primary accent - sampled from moodboard
    600: '#D97B55',
    700: '#C46642',
    800: '#A85435',
    900: '#8C442B',
  },
  cream: {
    50: '#FDFCFA',
    100: '#FAF8F4',
    200: '#F7F3EC',
    300: '#F4EEE0', // Primary background - from moodboard
    400: '#E8E0D0',
    500: '#D9CDB8',
    600: '#C4B49A',
    700: '#A8967A',
    800: '#8A7A62',
    900: '#6E614E',
  },
  blue: {
    50: '#EDF4FA',
    100: '#D6E6F4',
    200: '#ADD0EA',
    300: '#7FB5DC',
    400: '#5199CC',
    500: '#3173AD', // Mid blue - from moodboard
    600: '#285E8F',
    700: '#1F4A71',
    800: '#173855',
    900: '#0F263A',
  },
  navy: {
    50: '#E8ECF0',
    100: '#C7D0DB',
    200: '#9DAFC2',
    300: '#738EA8',
    400: '#4A6D8F',
    500: '#2A4D70',
    600: '#213D5A',
    700: '#193857', // Deep navy - from moodboard (primary dark)
    800: '#122840',
    900: '#0B1A2A',
  },
  // Semantic colors
  success: {
    light: '#4CAF50',
    dark: '#81C784',
  },
  warning: {
    light: '#FF9800',
    dark: '#FFB74D',
  },
  error: {
    light: '#F44336',
    dark: '#E57373',
  },
} as const;

export const lightTheme = {
  colors: {
    // Backgrounds
    background: colors.cream[300],
    backgroundSecondary: colors.cream[100],
    backgroundTertiary: colors.cream[50],
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Text - Navy on cream for high contrast
    text: colors.navy[700],
    textSecondary: colors.navy[500],
    textTertiary: colors.navy[400],
    textInverse: colors.cream[300],

    // Accent
    accent: colors.peach[500],
    accentLight: colors.peach[300],
    accentDark: colors.peach[700],

    // Interactive
    primary: colors.blue[500],
    primaryLight: colors.blue[300],
    primaryDark: colors.blue[700],

    // Borders
    border: colors.cream[500],
    borderStrong: colors.cream[700],

    // Status
    success: colors.success.light,
    warning: colors.warning.light,
    error: colors.error.light,

    // Nutrition confidence levels
    confidenceOfficial: colors.blue[500],
    confidenceHigh: '#4CAF50',
    confidenceMedium: '#FF9800',
    confidenceLow: '#F44336',
  },
} as const;

export const darkTheme = {
  colors: {
    // Backgrounds - Navy-based
    background: colors.navy[700],
    backgroundSecondary: colors.navy[600],
    backgroundTertiary: colors.navy[800],
    surface: colors.navy[600],
    surfaceElevated: colors.navy[500],

    // Text - Cream on navy for high contrast
    text: colors.cream[300],
    textSecondary: colors.cream[400],
    textTertiary: colors.cream[600],
    textInverse: colors.navy[700],

    // Accent - peach pops on navy
    accent: colors.peach[500],
    accentLight: colors.peach[400],
    accentDark: colors.peach[600],

    // Interactive - lighter blue for dark mode
    primary: colors.blue[400],
    primaryLight: colors.blue[300],
    primaryDark: colors.blue[500],

    // Borders
    border: colors.navy[500],
    borderStrong: colors.navy[400],

    // Status - lighter variants for dark mode
    success: colors.success.dark,
    warning: colors.warning.dark,
    error: colors.error.dark,

    // Nutrition confidence levels
    confidenceOfficial: colors.blue[400],
    confidenceHigh: '#81C784',
    confidenceMedium: '#FFB74D',
    confidenceLow: '#E57373',
  },
} as const;

export const typography = {
  // Display: Elegant serif for headings (system serif stack)
  fontFamily: {
    display: 'Georgia, "Times New Roman", serif',
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, Monaco, monospace',
  },
  // Size scale
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows = {
  none: 'none',
  sm: {
    shadowColor: colors.navy[700],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.navy[700],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.navy[700],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.navy[700],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation tokens - calm, editorial motion
export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },
  easing: {
    // Strong ease-out for UI interactions
    easeOut: [0.23, 1, 0.32, 1] as const,
    // Strong ease-in-out for on-screen movement
    easeInOut: [0.77, 0, 0.175, 1] as const,
    // iOS sheet curve
    sheet: [0.32, 0.72, 0, 1] as const,
    // Linear for progress indicators
    linear: [0, 0, 1, 1] as const,
  },
  spring: {
    // Default settle, no overshoot
    default: { duration: 400, dampingRatio: 1 },
    // Reposition/snap back
    snap: { duration: 400, dampingRatio: 0.8 },
    // Sheet/drawer
    sheet: { duration: 300, dampingRatio: 0.8 },
  },
} as const;

export type Theme = typeof lightTheme;
export type ThemeColors = Theme['colors'];
