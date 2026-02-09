import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../config/ThemeContext';

interface BadgeProps {
  text: string;
  color?: string;
  backgroundColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md';
}

export default function Badge({
  text,
  color,
  backgroundColor,
  icon,
  size = 'md',
}: BadgeProps) {
  const { theme } = useTheme();

  const bgColor = backgroundColor || theme.colors.primary + '15';
  const textColor = color || theme.colors.primary;
  const fontSize = size === 'sm' ? 11 : 13;
  const iconSize = size === 'sm' ? 12 : 14;
  const paddingV = size === 'sm' ? 2 : 4;
  const paddingH = size === 'sm' ? 6 : 10;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingVertical: paddingV, paddingHorizontal: paddingH }]}>
      {icon && (
        <Ionicons name={icon} size={iconSize} color={textColor} style={{ marginRight: 4 }} />
      )}
      <Text style={[styles.text, { color: textColor, fontSize }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
