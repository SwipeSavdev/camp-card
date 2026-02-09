import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../config/ThemeContext';
import { useResponsive, ResponsiveInfo } from './useResponsive';
import { Theme } from '../config/theme';

export function useThemeStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme, responsive: ResponsiveInfo) => T,
): T {
  const { theme } = useTheme();
  const responsive = useResponsive();

  return useMemo(
    () => StyleSheet.create(factory(theme, responsive)),
    [theme, responsive.width, responsive.height],
  );
}
