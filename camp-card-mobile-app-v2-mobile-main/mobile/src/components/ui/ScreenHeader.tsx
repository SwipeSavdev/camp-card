import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../config/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    label?: string;
  };
}

export default function ScreenHeader({
  title,
  subtitle,
  backgroundColor,
  rightAction,
}: ScreenHeaderProps) {
  const { theme, roleTheme } = useTheme();
  const bgColor = backgroundColor || roleTheme.headerBg;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.textOnPrimary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textOnPrimary, opacity: 0.85 }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={styles.actionButton}
          accessibilityLabel={rightAction.label || rightAction.icon}
          accessibilityRole="button"
        >
          <Ionicons name={rightAction.icon} size={24} color={theme.colors.textOnPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
});
