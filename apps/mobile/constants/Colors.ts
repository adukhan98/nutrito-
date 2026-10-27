/**
 * NutriTO Colors
 * Using the Bloom moodboard palette from @nutrito/shared
 */

// Import from shared when linked, use direct values for now
const colors = {
  peach: {
    500: '#E8926F',
    300: '#F0B6A2',
    700: '#C46642',
  },
  cream: {
    50: '#FDFCFA',
    100: '#FAF8F4',
    300: '#F4EEE0',
    500: '#D9CDB8',
    700: '#A8967A',
  },
  blue: {
    300: '#7FB5DC',
    400: '#5199CC',
    500: '#3173AD',
    700: '#1F4A71',
  },
  navy: {
    400: '#4A6D8F',
    500: '#2A4D70',
    600: '#213D5A',
    700: '#193857',
    800: '#122840',
  },
};

export default {
  light: {
    text: colors.navy[700],
    textSecondary: colors.navy[500],
    background: colors.cream[300],
    backgroundSecondary: colors.cream[100],
    surface: '#FFFFFF',
    tint: colors.peach[500],
    accent: colors.peach[500],
    primary: colors.blue[500],
    tabIconDefault: colors.navy[400],
    tabIconSelected: colors.peach[500],
    border: colors.cream[500],
    // Confidence colors
    confidenceOfficial: colors.blue[500],
    confidenceHigh: '#4CAF50',
    confidenceMedium: '#FF9800',
    confidenceLow: '#F44336',
  },
  dark: {
    text: colors.cream[300],
    textSecondary: colors.cream[500],
    background: colors.navy[700],
    backgroundSecondary: colors.navy[600],
    surface: colors.navy[600],
    tint: colors.peach[500],
    accent: colors.peach[500],
    primary: colors.blue[400],
    tabIconDefault: colors.cream[500],
    tabIconSelected: colors.peach[500],
    border: colors.navy[500],
    // Confidence colors
    confidenceOfficial: colors.blue[400],
    confidenceHigh: '#81C784',
    confidenceMedium: '#FFB74D',
    confidenceLow: '#E57373',
  },
};
