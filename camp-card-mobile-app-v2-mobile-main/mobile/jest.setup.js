/**
 * Jest Setup File
 * Configures global mocks and test environment
 */

import 'react-native-gesture-handler/jestSetup';

// Use Node's native web streams instead of expo's polyfill — axios's fetch
// adapter feature-probe crashes against the polyfill under Jest.
const nodeStreams = require('node:stream/web');
global.ReadableStream = nodeStreams.ReadableStream;
global.WritableStream = nodeStreams.WritableStream;
global.TransformStream = nodeStreams.TransformStream;

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'BSA Camp Card',
    version: '1.0.0',
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    Balanced: 3,
    High: 4,
    Highest: 5,
    Low: 2,
    Lowest: 1,
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock expo-notifications (native push-token registration crashes under Jest)
jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'test-push-token' }),
  getDevicePushTokenAsync: jest.fn().mockResolvedValue({ data: 'test-device-token' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  removeNotificationSubscription: jest.fn(),
  AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1 },
}));

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
  getStringAsync: jest.fn().mockResolvedValue(''),
}));

// Mock expo-print
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file://test.pdf' }),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-native-qrcode-svg
jest.mock('react-native-qrcode-svg', () => 'QRCode');

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
  };
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setParams: jest.fn(),
      dispatch: jest.fn(),
      isFocused: jest.fn().mockReturnValue(true),
      canGoBack: jest.fn().mockReturnValue(true),
      addListener: jest.fn().mockReturnValue(() => {}),
      removeListener: jest.fn(),
    }),
    useRoute: () => ({
      key: 'test-route-key',
      name: 'TestScreen',
      params: {},
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Silence console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated') ||
     args[0].includes('useNativeDriver') ||
     args[0].includes('ReactNativeFiberHostComponent') ||
     args[0].includes('VirtualizedLists'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Silence console errors for expected test errors
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: An update to') ||
     args[0].includes('act(...)'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

// Global test timeout
jest.setTimeout(10000);
