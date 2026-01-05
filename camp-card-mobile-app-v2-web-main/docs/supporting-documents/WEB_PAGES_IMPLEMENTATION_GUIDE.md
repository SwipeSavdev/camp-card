# Web Portal Page Implementation Guide

## Quick Start for All Remaining Pages

Use this template to create all management pages consistently.

```tsx
// Template for any management page
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

// Use these exact theme values (copied to each page for consistency)
const themeColors = {
 white: '#ffffff',
 gray50: '#f9fafb',
 gray100: '#f3f4f6',
 gray200: '#e5e7eb',
 gray500: '#6b7280',
 gray600: '#4b5563',
 text: '#1f2937',
 primary50: '#eff6ff',
 primary100: '#dbeafe',
 primary300: '#93c5fd',
 primary600: '#2563eb',
 primary800: '#1e40af',
 primary900: '#1e3a8a',
 success50: '#f0fdf4',
 success200: '#bbf7d0',
 success600: '#16a34a',
 warning50: '#fefce8',
 warning600: '#eab308',
 info50: '#f0f9ff',
 info600: '#0284c7',
 error400: '#f87171',
 error500: '#ef4444',
};

const themeSpace = { xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px' };
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

// Icon component - same in all pages
const Icon = ({ name, size = 18, color = 'currentColor' }) => {
 const icons = {
 add: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
 edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
 delete: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
 search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
 back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
 };
 return icons[name] || null;
};

export default function PageName() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [items, setItems] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState('');

 useEffect(() => {
 if (status === 'unauthenticated') router.push('/login');
 }, [status, router]);

 useEffect(() => {
 if (session) fetchData();
 }, [session]);

 const fetchData = async () => {
 try {
 setLoading(true);
 setError(null);
 const data = await api.getItems(session); // Change to correct API method
 setItems(data.content || data || []);
 } catch (err) {
 setError('Failed to load items');
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 const handleDelete = async (id: string) => {
 if (!confirm('Delete this item?')) return;
 try {
 await api.deleteItem(id, session); // Change method
 setItems(items.filter(i => i.id !== id));
 } catch (err) {
 setError('Failed to delete');
 }
 };

 const filteredItems = items.filter(item =>
 item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.email?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 if (status === 'loading') return null;
 if (!session) return null;

 return (
 <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: themeColors.gray50 }}>
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
 {/* Top Bar */}
 <div style={{ padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
 <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeColors.primary600 }}>
 <Icon name="back" size={20} />
 </button>
 <h1 style={{ fontSize: '28px', fontWeight: '700', color: themeColors.text, margin: 0 }}>Page Title</h1>
 </div>
 <button style={{ background: themeColors.primary600, color: themeColors.white, border: 'none', padding: `${themeSpace.sm} ${themeSpace.lg}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', gap: themeSpace.sm, alignItems: 'center' }}>
 <Icon name="add" size={18} color={themeColors.white} />
 Add Item
 </button>
 </div>

 {/* Search */}
 <div style={{ position: 'relative' }}>
 <Icon name="search" size={18} color={themeColors.gray500} style={{ position: 'absolute', left: themeSpace.md, top: '12px' }} />
 <input
 type="text"
 placeholder="Search..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md} ${themeSpace.sm} ${themeSpace.xl}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 }}
 />
 </div>
 </div>

 {/* Content */}
 <div style={{ flex: 1, padding: themeSpace.xl, overflowY: 'auto' }}>
 {error && <div style={{ backgroundColor: '#fee2e2', border: `1px solid ${themeColors.error500}`, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: themeColors.error500 }}>{error}</div>}

 {loading ? (
 <div style={{ textAlign: 'center', padding: themeSpace.xl }}>Loading...</div>
 ) : filteredItems.length === 0 ? (
 <div style={{ textAlign: 'center', padding: themeSpace.xl, color: themeColors.gray600 }}>No items found</div>
 ) : (
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, overflow: 'hidden', boxShadow: themeShadow.sm }}>
 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
 <thead>
 <tr style={{ backgroundColor: themeColors.gray50, borderBottom: `1px solid ${themeColors.gray200}` }}>
 <th style={{ textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600 }}>Name</th>
 <th style={{ textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600 }}>Email</th>
 <th style={{ textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600 }}>Status</th>
 <th style={{ textAlign: 'center', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600 }}>Actions</th>
 </tr>
 </thead>
 <tbody>
 {filteredItems.map((item) => (
 <tr key={item.id} style={{ borderBottom: `1px solid ${themeColors.gray200}` }}>
 <td style={{ padding: themeSpace.lg, fontSize: '14px', color: themeColors.text, fontWeight: '500' }}>{item.name}</td>
 <td style={{ padding: themeSpace.lg, fontSize: '14px', color: themeColors.text }}>{item.email}</td>
 <td style={{ padding: themeSpace.lg }}>
 <span style={{ padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: item.status === 'active' ? themeColors.success50 : themeColors.gray100, color: item.status === 'active' ? themeColors.success600 : themeColors.gray600, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '500' }}>
 {item.status || 'active'}
 </span>
 </td>
 <td style={{ padding: themeSpace.lg, textAlign: 'center' }}>
 <div style={{ display: 'flex', gap: themeSpace.sm, justifyContent: 'center' }}>
 <button style={{ background: themeColors.info50, border: 'none', color: themeColors.info600, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <Icon name="edit" size={16} color={themeColors.info600} />
 </button>
 <button onClick={() => handleDelete(item.id)} style={{ background: '#fee2e2', border: 'none', color: themeColors.error500, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <Icon name="delete" size={16} color={themeColors.error500} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
```

## Implementation Checklist

### Step 1: Create Page Files
- [ ] `/app/users/page.tsx` - User management
- [ ] `/app/organizations/page.tsx` - Organization management
- [ ] `/app/merchants/page.tsx` - Merchant management
- [ ] `/app/offers/page.tsx` - Offer management
- [ ] `/app/camp-cards/page.tsx` - Card management
- [ ] `/app/analytics/page.tsx` - Analytics dashboard
- [ ] `/app/settings/page.tsx` - System settings

### Step 2: For Each Page
1. Copy template above
2. Replace all `Item` with entity name (User, Organization, etc.)
3. Replace `getItems` with correct API method (e.g., `getUsers`)
4. Replace table columns with relevant entity fields
5. Add create/edit form logic
6. Test with backend API

### Step 3: Test Integration
```bash
# In camp-card-web directory
npm run dev

# Navigate to:
# http://localhost:3000/users
# http://localhost:3000/organizations
# etc.
```

### Step 4: Mobile Integration
```typescript
// In mobile app, use platformServices
import { usersService, organizationsService, etc } from '@/services/platformServices';

// Usage:
const users = await usersService.list();
const newUser = await usersService.create({...});
const updated = await usersService.update(id, {...});
```

## API Integration Points

Each page uses the same pattern:
```typescript
// List
const data = await api.getEntityType(session);
setItems(data.content || data || []);

// Create
await api.createEntityType(formData, session);

// Update
await api.updateEntityType(id, formData, session);

// Delete
await api.deleteEntityType(id, session);
```

## Mobile App Integration Example

```typescript
// In mobile screen component
import { platformServices } from '@/services/platformServices';
import { getSyncManager } from '@/services/syncManager';

export default function UserScreen() {
 const [users, setUsers] = useState([]);
 const syncManager = getSyncManager();

 useEffect(() => {
 // Fetch initial data
 platformServices.users.list().then(res => {
 setUsers(res.data);
 });
 }, []);

 const handleAddUser = async (userData) => {
 // Queue operation for offline support
 await syncManager?.queueOperation('create', 'user', userData);

 // Try to sync immediately if online
 await syncManager?.syncAll();
 };
}
```

