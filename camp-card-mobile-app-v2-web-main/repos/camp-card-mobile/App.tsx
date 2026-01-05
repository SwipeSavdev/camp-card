import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';

// Create React Query client
const queryClient = new QueryClient({
 defaultOptions: {
 queries: {
 retry: 2,
 staleTime: 5 * 60 * 1000, // 5 minutes
 },
 },
});

/**
 * Main App Component
 * Sets up providers and navigation
 */
export default function App() {
 const { initialize } = useAuthStore();

 // Initialize auth on app start
 React.useEffect(() => {
 initialize();
 }, []);

 return (
 <GestureHandlerRootView style={{ flex: 1 }}>
 <SafeAreaProvider>
 <QueryClientProvider client={queryClient}>
 <NavigationContainer>
 <RootNavigator />
 <StatusBar style="auto" />
 </NavigationContainer>
 </QueryClientProvider>
 </SafeAreaProvider>
 </GestureHandlerRootView>
 );
}
