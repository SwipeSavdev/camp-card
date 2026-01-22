import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';

import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { useNotifications } from './src/utils/notifications';

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

  // Initialize push notifications (automatically registers when authenticated)
  useNotifications();

  // Initialize auth on app start
  React.useEffect(() => {
    initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer linking={linking}>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
