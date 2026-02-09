import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Theme,
  RoleTheme,
  lightTheme,
  darkTheme,
  roleColors,
  defaultRoleTheme,
  UserRoleKey,
} from './theme';
import { useAuthStore } from '../store/authStore';

const STORAGE_KEY = '@campcard_color_scheme';

type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  colorScheme: ColorScheme;
  roleTheme: RoleTheme;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  colorScheme: 'light',
  roleTheme: defaultRoleTheme,
  toggleColorScheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [userOverride, setUserOverride] = useState<ColorScheme | null>(null);
  const user = useAuthStore((state) => state.user);

  // Load persisted preference
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'light' || value === 'dark') {
        setUserOverride(value);
      }
    });
  }, []);

  const colorScheme: ColorScheme = userOverride ?? (systemColorScheme === 'dark' ? 'dark' : 'light');

  const toggleColorScheme = () => {
    const next: ColorScheme = colorScheme === 'light' ? 'dark' : 'light';
    setUserOverride(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const roleTheme = useMemo(() => {
    const role = user?.role as UserRoleKey | undefined;
    if (role && roleColors[role]) {
      return roleColors[role];
    }
    // Map UNIT_LEADER to TROOP_LEADER if needed
    if (role === 'UNIT_LEADER' as any) {
      return roleColors.TROOP_LEADER;
    }
    return defaultRoleTheme;
  }, [user?.role]);

  const value = useMemo(
    () => ({ theme, colorScheme, roleTheme, toggleColorScheme }),
    [theme, colorScheme, roleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
