import React, { useRef } from 'react';
import { Alert, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import * as Updates from 'expo-updates';

import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { useNotifications } from './src/utils/notifications';
import { ThemeProvider } from './src/config/ThemeContext';
import { analyticsService } from './src/services/analyticsService';
import { useTrackingPermission } from './src/hooks/useTrackingPermission';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Deep linking configuration for multi-card system
const linking: LinkingOptions<any> = {
  prefixes: [
    Linking.createURL('/'),
    'campcard://',
    'https://campcardapp.org/app',
    'https://www.campcardapp.org/app',
  ],
  config: {
    screens: {
      // Gift claim deep link: campcard://claim/TOKEN or https://campcardapp.org/app/claim/TOKEN
      ClaimGift: {
        path: 'claim/:token',
        parse: {
          token: (token: string) => token,
        },
      },
      // Card inventory
      CardInventory: 'cards',
      // Offer details
      OfferDetail: {
        path: 'offer/:offerId',
        parse: {
          offerId: (offerId: string) => Number.parseInt(offerId, 10),
        },
      },
      // Merchant details
      MerchantDetail: {
        path: 'merchant/:merchantId',
        parse: {
          merchantId: (merchantId: string) => Number.parseInt(merchantId, 10),
        },
      },
      // Password reset
      ResetPassword: {
        path: 'reset-password/:token',
        parse: {
          token: (token: string) => token,
        },
      },
      // Email verification
      EmailVerification: {
        path: 'verify-email/:token',
        parse: {
          token: (token: string) => token,
        },
      },
    },
  },
};

/**
 * Main App Component
 * Sets up providers and navigation
 */
export default function App() {
  const { initialize } = useAuthStore();
  const navigationRef = useRef<any>(null);
  const routeNameRef = useRef<string | undefined>(undefined);
  const appState = useRef(AppState.currentState);

  // Request ATT permission before any tracking (iOS only)
  const { isReady: attReady, isTrackingAllowed } = useTrackingPermission();

  // Initialize push notifications (automatically registers when authenticated)
  useNotifications();

  // Initialize auth on app start
  React.useEffect(() => {
    initialize();
  }, []);

  // Start analytics session only after ATT permission is resolved
  React.useEffect(() => {
    if (!attReady) return;

    analyticsService.setTrackingAllowed(isTrackingAllowed);
    analyticsService.startSession();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        analyticsService.trackAction('app_foreground');
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        analyticsService.trackAction('app_background');
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      analyticsService.endSession();
    };
  }, [attReady]);

  // Check for OTA updates on app load (production only)
  React.useEffect(() => {
    if (__DEV__) return;
    (async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Update Available',
            'A new version has been downloaded. Restart to apply.',
            [{ text: 'Restart', onPress: () => { Updates.reloadAsync(); } }],
          );
        }
      } catch {
        // Silently fail - OTA updates are not critical
      }
    })();
  }, []);

  // Track screen views on navigation state change
  const onNavigationStateChange = () => {
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
    if (currentRouteName && currentRouteName !== routeNameRef.current) {
      analyticsService.trackScreenView(currentRouteName);
    }
    routeNameRef.current = currentRouteName;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer
              ref={navigationRef}
              linking={linking}
              onReady={() => {
                routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
              }}
              onStateChange={onNavigationStateChange}
            >
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
