import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../config/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.base,
    {
      paddingVertical: size === 'sm' ? spacing.sm : size === 'lg' ? spacing.base : spacing.md,
      paddingHorizontal: size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.base,
      borderRadius: size === 'sm' ? 6 : 12,
    },
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    { fontSize: size === 'sm' ? 13 : size === 'lg' ? 18 : 16 },
  ];

  switch (variant) {
    case 'primary':
      containerStyles.push({ backgroundColor: colors.primary });
      textStyles.push({ color: colors.textOnPrimary });
      break;
    case 'secondary':
      containerStyles.push({ backgroundColor: colors.secondary });
      textStyles.push({ color: colors.textOnPrimary });
      break;
    case 'outline':
      containerStyles.push({
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
      });
      textStyles.push({ color: colors.primary });
      break;
    case 'ghost':
      containerStyles.push({ backgroundColor: 'transparent' });
      textStyles.push({ color: colors.primary });
      break;
  }

  if (isDisabled) {
    containerStyles.push({ opacity: 0.5 });
  }

  if (fullWidth) {
    containerStyles.push({ width: '100%' });
  }

  if (style) {
    containerStyles.push(style);
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={containerStyles}
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textOnPrimary}
          size="small"
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 20}
              color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textOnPrimary}
              style={{ marginRight: spacing.sm }}
            />
          )}
          <Text style={[...textStyles, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
