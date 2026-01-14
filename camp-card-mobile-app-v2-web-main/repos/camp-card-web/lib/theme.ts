// Camp Card  Web Theme (Modern Enterprise Design)
// Use as a single source of truth for colors/spacing/radius across the web app

export const colors = {
  // Primary Brand Colors - Modern Blue
  primary50: '#F8FAFC',
  primary900: '#0F172A',
  primary800: '#1E293B',
  primary700: '#334155',
  primary600: '#475569',
  primary500: '#64748B',
  primary400: '#94A3B8',
  primary300: '#CBD5E1',
  primary200: '#E2E8F0',
  primary100: '#F1F5F9',

  // Accent Colors
  accent: '#3B82F6',
  accentLight: '#60A5FA',
  accentDark: '#1E40AF',

  // Semantic Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#06B6D4',
  infoLight: '#CFFAFE',

  // Neutral Colors
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Legacy Support (mapped to new system)
  navy900: '#0F172A',
  navy800: '#1E293B',
  navy700: '#334155',
  navy600: '#475569',
  blue500: '#3B82F6',
  blue400: '#60A5FA',
  blue600: '#1E40AF',
  highlight: '#94A3B8',
  red500: '#EF4444',
  red600: '#DC2626',
  green500: '#10B981',
  green600: '#059669',

  text: '#111827',
  muted: 'rgba(17, 24, 39, 0.65)',
  border: '#E5E7EB',
};

export const radius = {
  card: '12px',
  button: '8px',
  xl: '16px',
  lg: '12px',
  md: '8px',
  sm: '6px',
  xs: '4px',
};

export const space = {
  xs: '3px',
  sm: '6px',
  md: '8px',
  lg: '11px',
  xl: '17px',
  '2xl': '22px',
  '3xl': '33px',
};

export const shadow = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const gradients = {
  primary: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
  accent: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
};

export const typography = {
  headline: {
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1.2',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  subtitle: {
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '1.4',
  },
  body: {
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  bodySmall: {
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '1.4',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};
