# Mobile App Integration Guide

## Complete Mobile-to-Backend Integration

### 1. Setup API Client (DONE)
```typescript
// File: src/services/apiClient.ts
// Already configured with:
// - Axios instance
// - Auth interceptors
// - Token refresh logic
// - Tenant headers
// - Error handling
```

### 2. Initialize Services (DONE)
```typescript
// File: src/services/platformServices.ts
// Provides unified interface for all entities:
// - usersService.list/get/create/update/delete
// - organizationsService.*
// - merchantsService.*
// - offersService.*
// - cardsService.*
// - analyticsService.*
// - syncService.*
// - healthService.*
```

### 3. Setup Sync Manager (DONE)
```typescript
// File: src/services/syncManager.ts
// Provides offline-first capabilities:
// - Queue operations
// - Sync when online
// - Conflict resolution
// - Exponential backoff retry
// - Auto-sync interval
```

## Mobile App Integration Steps

### Step 1: Initialize Sync Manager in Root Component

```typescript
// App.tsx or root navigation component
import { initializeSyncManager, getSyncManager } from '@/services/syncManager';
import { apiClient } from '@/services/apiClient';

export default function App() {
 useEffect(() => {
 // Initialize sync manager with browser's localStorage or async-storage
 if (typeof window !== 'undefined') {
 initializeSyncManager(
 window.localStorage,
 apiClient,
 console // logger
 );
 }
 }, []);

 return (
 // App navigation...
 );
}
```

### Step 2: Update Auth Store

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { apiClient } from '@/services/apiClient';

export const useAuthStore = create((set, get) => ({
 accessToken: null,
 refreshToken: null,
 user: null,

 login: async (email, password) => {
 try {
 const response = await apiClient.post('/auth/login', { email, password });
 set({
 accessToken: response.data.accessToken,
 refreshToken: response.data.refreshToken,
 user: response.data.user,
 });
 return response.data;
 } catch (error) {
 console.error('Login failed:', error);
 throw error;
 }
 },

 logout: async () => {
 try {
 await apiClient.post('/auth/logout');
 } catch (error) {
 console.error('Logout error:', error);
 }
 set({ accessToken: null, refreshToken: null, user: null });
 },

 refresh: async () => {
 const state = get();
 if (!state.refreshToken) return null;

 try {
 const response = await apiClient.post('/auth/refresh', {
 refreshToken: state.refreshToken,
 });
 set({
 accessToken: response.data.accessToken,
 refreshToken: response.data.refreshToken,
 });
 return response.data.accessToken;
 } catch (error) {
 console.error('Token refresh failed:', error);
 set({ accessToken: null, refreshToken: null, user: null });
 return null;
 }
 },
}));
```

### Step 3: Create Data Stores

```typescript
// src/store/userStore.ts
import { create } from 'zustand';
import { platformServices } from '@/services/platformServices';
import { getSyncManager } from '@/services/syncManager';

export const useUserStore = create((set) => ({
 users: [],
 loading: false,
 error: null,

 fetchUsers: async () => {
 set({ loading: true });
 try {
 const response = await platformServices.users.list();
 set({ users: response.data, error: null });
 } catch (error) {
 set({ error: error.message });
 } finally {
 set({ loading: false });
 }
 },

 addUser: async (userData) => {
 const syncManager = getSyncManager();

 // Queue operation for offline support
 await syncManager?.queueOperation('create', 'user', userData);

 // Optimistic update
 set(state => ({
 users: [...state.users, { ...userData, id: Date.now().toString() }]
 }));

 // Try to sync
 await syncManager?.syncAll();
 },

 updateUser: async (id, userData) => {
 const syncManager = getSyncManager();

 await syncManager?.queueOperation('update', 'user', userData, id);

 // Optimistic update
 set(state => ({
 users: state.users.map(u => u.id === id ? { ...u, ...userData } : u)
 }));

 await syncManager?.syncAll();
 },

 deleteUser: async (id) => {
 const syncManager = getSyncManager();

 await syncManager?.queueOperation('delete', 'user', {}, id);

 // Optimistic update
 set(state => ({
 users: state.users.filter(u => u.id !== id)
 }));

 await syncManager?.syncAll();
 },
}));

// Repeat for organizationStore, merchantStore, offerStore, cardStore
```

### Step 4: Update Screen Components

```typescript
// Example: UserListScreen.tsx
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { getSyncManager } from '@/services/syncManager';

export default function UserListScreen() {
 const users = useUserStore(state => state.users);
 const fetchUsers = useUserStore(state => state.fetchUsers);
 const addUser = useUserStore(state => state.addUser);
 const deleteUser = useUserStore(state => state.deleteUser);

 const isOnline = useNetworkStatus(); // Your custom hook
 const syncManager = getSyncManager();
 const syncStatus = syncManager?.getStatus();

 useEffect(() => {
 fetchUsers();
 }, []);

 const handleAddUser = async (userData) => {
 await addUser(userData);
 if (isOnline) {
 // User will see sync status
 } else {
 // Show offline indicator
 }
 };

 return (
 <View>
 {/* Sync Status Indicator */}
 {!isOnline && (
 <View style={{ backgroundColor: '#fef3c7', padding: 12 }}>
 <Text>Offline - Changes will sync when online</Text>
 {syncStatus?.pending > 0 && (
 <Text>{syncStatus.pending} pending changes</Text>
 )}
 </View>
 )}

 {/* User List */}
 {users.map(user => (
 <UserItem
 key={user.id}
 user={user}
 onDelete={() => deleteUser(user.id)}
 />
 ))}

 {/* Add User Button */}
 <Button title="Add User" onPress={handleAddUser} />
 </View>
 );
}
```

### Step 5: Implement Sync Status Monitoring

```typescript
// src/hooks/useSyncStatus.ts
import { useEffect, useState } from 'react';
import { getSyncManager } from '@/services/syncManager';

export function useSyncStatus() {
 const [status, setStatus] = useState({
 total: 0,
 pending: 0,
 synced: 0,
 failed: 0,
 isOnline: true,
 isSyncing: false,
 });

 useEffect(() => {
 const syncManager = getSyncManager();
 if (!syncManager) return;

 // Check sync status every second
 const interval = setInterval(() => {
 setStatus(syncManager.getStatus());
 }, 1000);

 // Initial status
 setStatus(syncManager.getStatus());

 // Start auto-sync
 syncManager.startAutoSync(30000); // Every 30 seconds

 return () => {
 clearInterval(interval);
 syncManager.stopAutoSync();
 };
 }, []);

 return status;
}
```

### Step 6: Handle Offline Queue

```typescript
// src/screens/SyncQueueScreen.tsx
import { getSyncManager } from '@/services/syncManager';
import { useEffect, useState } from 'react';

export default function SyncQueueScreen() {
 const syncManager = getSyncManager();
 const [pending, setPending] = useState([]);
 const [failed, setFailed] = useState([]);
 const status = syncManager?.getStatus();

 useEffect(() => {
 setPending(syncManager?.getPending() || []);
 setFailed(syncManager?.getFailed() || []);
 }, [status]);

 const handleRetryAll = async () => {
 await syncManager?.retryFailed();
 };

 const handleForceSync = async () => {
 await syncManager?.forceFullSync();
 };

 return (
 <View>
 <Text>Sync Status: {status?.isSyncing ? 'Syncing...' : 'Ready'}</Text>
 <Text>Pending: {status?.pending}</Text>
 <Text>Failed: {status?.failed}</Text>

 {status?.failed > 0 && (
 <Button title="Retry Failed" onPress={handleRetryAll} />
 )}

 <Button title="Force Full Sync" onPress={handleForceSync} />

 <Text>Failed Operations:</Text>
 {failed.map(item => (
 <View key={item.id}>
 <Text>{item.type} {item.entity} - {item.status}</Text>
 <Text>{item.retries}/3 retries</Text>
 </View>
 ))}
 </View>
 );
}
```

## Real-Time Updates with WebSocket (Optional)

```typescript
// src/services/websocketService.ts
import io, { Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export class WebSocketService {
 private socket: Socket | null = null;

 connect(serverUrl: string) {
 const { accessToken } = useAuthStore.getState();

 this.socket = io(serverUrl, {
 auth: { token: accessToken },
 reconnection: true,
 reconnectionDelay: 1000,
 reconnectionDelayMax: 5000,
 reconnectionAttempts: 5,
 });

 // Subscribe to events
 this.socket.on('user:created', (data) => {
 // Update user store
 });

 this.socket.on('offer:updated', (data) => {
 // Update offer store
 });

 this.socket.on('card:redeemed', (data) => {
 // Update card store
 });
 }

 emit(event: string, data: any) {
 this.socket?.emit(event, data);
 }

 disconnect() {
 this.socket?.disconnect();
 }
}
```

## Testing Offline Behavior

```typescript
// Mock offline behavior for testing
export function simulateOffline(duration = 5000) {
 window.dispatchEvent(new Event('offline'));
 setTimeout(() => {
 window.dispatchEvent(new Event('online'));
 }, duration);
}

// In tests:
test('Should queue operations when offline', async () => {
 simulateOffline(2000);

 const syncManager = getSyncManager();
 await userStore.addUser({ name: 'Test' });

 expect(syncManager?.getPending().length).toBe(1);
});

test('Should sync when back online', async () => {
 await new Promise(resolve => setTimeout(resolve, 2500));

 const syncManager = getSyncManager();
 await new Promise(resolve => setTimeout(resolve, 1000));

 expect(syncManager?.getSynced().length).toBe(1);
});
```

## Deployment Checklist - Mobile

- [ ] `apiClient.ts` configured with backend URL
- [ ] Auth store implemented and tested
- [ ] All data stores created (user, org, merchant, offer, card)
- [ ] Sync manager initialized in root component
- [ ] All screens updated to use stores
- [ ] Offline queue functionality tested
- [ ] Sync status UI shown
- [ ] Error handling implemented
- [ ] Network status monitoring working
- [ ] Built and tested on iOS & Android

