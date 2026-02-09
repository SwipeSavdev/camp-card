import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
  horizontalPadding: number;
  contentMaxWidth: number;
  columns: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLandscape = width > height;

  return {
    width,
    height,
    isTablet,
    isLandscape,
    horizontalPadding: isTablet ? 32 : 16,
    contentMaxWidth: isTablet ? 600 : width,
    columns: isTablet ? 3 : 2,
  };
}
