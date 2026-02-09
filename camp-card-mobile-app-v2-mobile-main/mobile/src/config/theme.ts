import { TextStyle } from 'react-native';

// ============================================================================
// Theme Token Types
// ============================================================================

export interface ThemeColors {
  // Core BSA branding
  primary: string;
  secondary: string;
  accent: string;

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Surface colors
  background: string;
  surface: string;
  card: string;
  overlay: string;

  // Text colors
  text: string;
  textSecondary: string;
  textOnPrimary: string;

  // UI element colors
  border: string;
  disabled: string;
  white: string;
  navy: string;
}

export interface RoleTheme {
  primary: string;
  headerBg: string;
  tabActive: string;
}

export type UserRoleKey = 'SCOUT' | 'UNIT_LEADER' | 'TROOP_LEADER' | 'PARENT' | 'NATIONAL_ADMIN' | 'COUNCIL_ADMIN';

export interface Typography {
  sizes: {
    xs: number;
    sm: number;
    md: number;
    base: number;
    lg: number;
    xl: number;
    xxl: number;
    hero: number;
  };
  weights: {
    regular: TextStyle['fontWeight'];
    medium: TextStyle['fontWeight'];
    semibold: TextStyle['fontWeight'];
    bold: TextStyle['fontWeight'];
  };
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  base: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Theme {
  colors: ThemeColors;
  typography: Typography;
  spacing: Spacing;
}

// ============================================================================
// Typography & Spacing (shared across light/dark)
// ============================================================================

export const typography: Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 14,
    base: 16,
    lg: 18,
    xl: 24,
    xxl: 26,
    hero: 42,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// ============================================================================
// Light Theme (matches existing COLORS in constants.ts)
// ============================================================================

export const lightColors: ThemeColors = {
  primary: '#CE1126',
  secondary: '#003F87',
  accent: '#FFD700',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  text: '#212121',
  textSecondary: '#757575',
  textOnPrimary: '#FFFFFF',
  border: '#E0E0E0',
  disabled: '#BDBDBD',
  white: '#FFFFFF',
  navy: '#003F87',
};

export const lightTheme: Theme = {
  colors: lightColors,
  typography,
  spacing,
};

// ============================================================================
// Dark Theme
// ============================================================================

export const darkColors: ThemeColors = {
  primary: '#CE1126',
  secondary: '#4A90D9',
  accent: '#FFD700',
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
  info: '#42A5F5',
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  overlay: 'rgba(0, 0, 0, 0.7)',
  text: '#E0E0E0',
  textSecondary: '#A0A0A0',
  textOnPrimary: '#FFFFFF',
  border: '#333333',
  disabled: '#555555',
  white: '#FFFFFF',
  navy: '#4A90D9',
};

export const darkTheme: Theme = {
  colors: darkColors,
  typography,
  spacing,
};

// ============================================================================
// Role-Based Theme Colors
// ============================================================================

export const roleColors: Record<UserRoleKey, RoleTheme> = {
  SCOUT: {
    primary: '#CE1126',
    headerBg: '#CE1126',
    tabActive: '#CE1126',
  },
  UNIT_LEADER: {
    primary: '#003F87',
    headerBg: '#003F87',
    tabActive: '#003F87',
  },
  TROOP_LEADER: {
    primary: '#003F87',
    headerBg: '#003F87',
    tabActive: '#003F87',
  },
  PARENT: {
    primary: '#F59E0B',
    headerBg: '#F59E0B',
    tabActive: '#FFD700',
  },
  NATIONAL_ADMIN: {
    primary: '#003F87',
    headerBg: '#003F87',
    tabActive: '#003F87',
  },
  COUNCIL_ADMIN: {
    primary: '#003F87',
    headerBg: '#003F87',
    tabActive: '#003F87',
  },
};

// Default role theme fallback
export const defaultRoleTheme: RoleTheme = roleColors.SCOUT;
