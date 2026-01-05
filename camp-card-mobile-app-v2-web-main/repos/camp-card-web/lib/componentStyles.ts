import { colors, radius, space, shadow, typography } from '@/lib/theme';
import { CSSProperties } from 'react';

// Card Component
export const cardStyles = {
 base: {
 backgroundColor: colors.white,
 borderRadius: radius.card,
 border: `1px solid ${colors.gray200}`,
 boxShadow: shadow.card,
 padding: space['2xl'],
 } as CSSProperties,
 compact: {
 backgroundColor: colors.white,
 borderRadius: radius.card,
 border: `1px solid ${colors.gray200}`,
 boxShadow: shadow.xs,
 padding: space.xl,
 } as CSSProperties,
 elevated: {
 backgroundColor: colors.white,
 borderRadius: radius.card,
 border: 'none',
 boxShadow: shadow.md,
 padding: space['2xl'],
 } as CSSProperties,
};

// Button Component Styles
export const buttonStyles = {
 primary: {
 base: {
 backgroundColor: colors.accent,
 color: colors.white,
 border: 'none',
 borderRadius: radius.button,
 padding: `${space.lg} ${space['2xl']}`,
 fontSize: '14px',
 fontWeight: '600',
 cursor: 'pointer',
 transition: 'all 0.2s ease',
 boxShadow: `0 2px 8px rgba(59, 130, 246, 0.3)`,
 } as CSSProperties,
 hover: {
 backgroundColor: colors.accentLight,
 boxShadow: `0 4px 12px rgba(59, 130, 246, 0.4)`,
 } as CSSProperties,
 active: {
 backgroundColor: colors.accentDark,
 } as CSSProperties,
 },
 secondary: {
 base: {
 backgroundColor: colors.gray100,
 color: colors.text,
 border: `1px solid ${colors.gray300}`,
 borderRadius: radius.button,
 padding: `${space.lg} ${space['2xl']}`,
 fontSize: '14px',
 fontWeight: '600',
 cursor: 'pointer',
 transition: 'all 0.2s ease',
 } as CSSProperties,
 hover: {
 backgroundColor: colors.gray200,
 borderColor: colors.gray400,
 } as CSSProperties,
 },
 ghost: {
 base: {
 backgroundColor: 'transparent',
 color: colors.accent,
 border: `1px solid ${colors.accent}`,
 borderRadius: radius.button,
 padding: `${space.lg} ${space['2xl']}`,
 fontSize: '14px',
 fontWeight: '600',
 cursor: 'pointer',
 transition: 'all 0.2s ease',
 } as CSSProperties,
 hover: {
 backgroundColor: colors.accent,
 color: colors.white,
 } as CSSProperties,
 },
 small: {
 base: {
 backgroundColor: colors.accent,
 color: colors.white,
 border: 'none',
 borderRadius: radius.button,
 padding: `${space.md} ${space.lg}`,
 fontSize: '13px',
 fontWeight: '600',
 cursor: 'pointer',
 transition: 'all 0.2s ease',
 } as CSSProperties,
 },
 danger: {
 base: {
 backgroundColor: colors.error,
 color: colors.white,
 border: 'none',
 borderRadius: radius.button,
 padding: `${space.lg} ${space['2xl']}`,
 fontSize: '14px',
 fontWeight: '600',
 cursor: 'pointer',
 transition: 'all 0.2s ease',
 } as CSSProperties,
 hover: {
 backgroundColor: '#DC2626',
 boxShadow: `0 4px 12px rgba(239, 68, 68, 0.3)`,
 } as CSSProperties,
 },
};

// Badge Styles
export const badgeStyles = {
 primary: {
 backgroundColor: colors.accent,
 color: colors.white,
 } as CSSProperties,
 success: {
 backgroundColor: colors.success,
 color: colors.white,
 } as CSSProperties,
 warning: {
 backgroundColor: colors.warning,
 color: colors.white,
 } as CSSProperties,
 error: {
 backgroundColor: colors.error,
 color: colors.white,
 } as CSSProperties,
 info: {
 backgroundColor: colors.info,
 color: colors.white,
 } as CSSProperties,
};

// Stat Card Style
export const statCardStyle = {
 backgroundColor: colors.white,
 borderRadius: radius.card,
 border: `1px solid ${colors.gray200}`,
 padding: space.xl,
 boxShadow: shadow.xs,
} as CSSProperties;

// Input Styles
export const inputStyles = {
 base: {
 backgroundColor: colors.white,
 border: `1px solid ${colors.gray300}`,
 borderRadius: radius.button,
 padding: `${space.lg} ${space.lg}`,
 fontSize: '14px',
 color: colors.text,
 transition: 'all 0.2s ease',
 fontFamily: 'inherit',
 } as CSSProperties,
 focus: {
 borderColor: colors.accent,
 outline: 'none',
 boxShadow: `0 0 0 3px ${colors.accent}20`,
 } as CSSProperties,
};

// Alert Styles
export const alertStyles = {
 success: {
 backgroundColor: colors.successLight,
 borderLeft: `4px solid ${colors.success}`,
 padding: space.lg,
 borderRadius: radius.md,
 color: '#065F46',
 } as CSSProperties,
 warning: {
 backgroundColor: colors.warningLight,
 borderLeft: `4px solid ${colors.warning}`,
 padding: space.lg,
 borderRadius: radius.md,
 color: '#92400E',
 } as CSSProperties,
 error: {
 backgroundColor: colors.errorLight,
 borderLeft: `4px solid ${colors.error}`,
 padding: space.lg,
 borderRadius: radius.md,
 color: '#7F1D1D',
 } as CSSProperties,
 info: {
 backgroundColor: colors.infoLight,
 borderLeft: `4px solid ${colors.info}`,
 padding: space.lg,
 borderRadius: radius.md,
 color: '#164E63',
 } as CSSProperties,
};

// Section Title
export const sectionTitleStyle = {
 fontSize: '18px',
 fontWeight: '700',
 color: colors.text,
 marginBottom: space.lg,
 marginTop: 0,
} as CSSProperties;

// Grid layouts
export const gridStyles = {
 twoCol: {
 display: 'grid',
 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
 gap: space['2xl'],
 } as CSSProperties,
 threeCol: {
 display: 'grid',
 gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
 gap: space['2xl'],
 } as CSSProperties,
 fourCol: {
 display: 'grid',
 gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
 gap: space['2xl'],
 } as CSSProperties,
};
