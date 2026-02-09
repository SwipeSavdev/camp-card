import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
}: CardProps) {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const paddingValue = padding === 'sm' ? spacing.md : padding === 'lg' ? spacing.xl : spacing.base;

  const cardStyles: ViewStyle[] = [
    styles.base,
    { padding: paddingValue, backgroundColor: colors.card },
  ];

  switch (variant) {
    case 'elevated':
      cardStyles.push(styles.elevated);
      break;
    case 'outlined':
      cardStyles.push({ borderWidth: 1, borderColor: colors.border });
      break;
    case 'flat':
      break;
  }

  if (style) {
    cardStyles.push(style);
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={cardStyles}
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
