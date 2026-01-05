'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const themeColors = {
 white: '#ffffff',
 gray50: '#f9fafb',
 gray100: '#f3f4f6',
 gray200: '#e5e7eb',
 gray300: '#d1d5db',
 gray500: '#6b7280',
 gray600: '#4b5563',
 text: '#1f2937',
 primary50: '#eff6ff',
 primary100: '#dbeafe',
 primary200: '#bfdbfe',
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
 info200: '#cffafe',
 info600: '#0284c7',
 error400: '#f87171',
 error500: '#ef4444',
};

const themeSpace = { xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px' };
const themeRadius = { sm: '4px', card: '12px', lg: '16px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

const Icon = ({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
 const icons: { [key: string]: any } = {
 add: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
 edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
 delete: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
 search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
 back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
 chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
 chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>,
 x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
 };
 return icons[name] || null;
};

interface MerchantLocation {
 id: string;
 name: string;
 address: string;
 isHQ: boolean;
}

interface Merchant {
 id: string;
 name: string;
 contactName: string;
 email: string;
 phone: string;
 businessType: string;
 isSingleLocation: boolean;
 locations: MerchantLocation[];
}

export default function MerchantsPage() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [items, setItems] = useState<Merchant[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [showAddForm, setShowAddForm] = useState(false);
 const [expandedMerchants, setExpandedMerchants] = useState<Set<string>>(new Set());
 const [editingId, setEditingId] = useState<string | null>(null);

 // Form states
 const [newMerchantName, setNewMerchantName] = useState('');
 const [newContactName, setNewContactName] = useState('');
 const [newEmail, setNewEmail] = useState('');
 const [newPhone, setNewPhone] = useState('');
 const [newBusinessType, setNewBusinessType] = useState('');
 const [newBusinessAddress, setNewBusinessAddress] = useState('');
 const [newIsSingleLocation, setNewIsSingleLocation] = useState(true);
 const [newLocations, setNewLocations] = useState<MerchantLocation[]>([]);
 const [showAddLocation, setShowAddLocation] = useState(false);
 const [newLocationName, setNewLocationName] = useState('');
 const [newLocationAddress, setNewLocationAddress] = useState('');

 const businessTypes = [
 'Retail',
 'Restaurant',
 'Service',
 'Entertainment',
 'Healthcare',
 'Education',
 'Other'
 ];

 useEffect(() => {
 // Load data on mount, don't redirect if unauthenticated
 fetchData();
 }, []);

 const fetchData = async () => {
 try {
 setLoading(true);
 setError(null);
 const data = await api.getMerchants(session);
 console.log('[PAGE] Raw merchants data:', data);

 // Handle response from backend - it returns { merchants: [...], total: N }
 const merchantsArray = (data as any).merchants || (data as any).content || data || [];
 console.log('[PAGE] Merchants array:', merchantsArray);
 console.log('[PAGE] Merchants count:', merchantsArray.length);

 // Map backend fields to frontend interface
 const merchants = merchantsArray.map((item: any) => {
 // Handle locations - if it's a number (from mock data), convert to empty array
 let locations: MerchantLocation[] = [];
 if (Array.isArray(item.locations)) {
 locations = item.locations;
 }

 return {
 id: item.id,
 name: item.name || item.business_name || '',
 contactName: item.contactName || item.contact_name || '',
 email: item.email || '',
 phone: item.phone_number || item.phone || '',
 businessType: item.category || item.business_type || '',
 isSingleLocation: item.isSingleLocation !== undefined ? item.isSingleLocation : true,
 locations: locations,
 };
 });
 console.log('[PAGE] Mapped merchants:', merchants);
 setItems(merchants);
 } catch (err) {
 setError('Failed to load merchants');
 console.error('[PAGE] Error:', err);
 } finally {
 setLoading(false);
 }
 };

 const handleDelete = async (id: string) => {
 if (!confirm('Delete this merchant?')) return;
 try {
 await api.deleteMerchant(id, session);
 setItems(items.filter(i => i.id !== id));
 setError(null);
 } catch (err) {
 setError('Failed to delete');
 }
 };

 const handleEdit = async (merchant: Merchant) => {
 // Populate form with merchant data
 setNewMerchantName(merchant.name);
 setNewContactName(merchant.contactName);
 setNewEmail(merchant.email);
 setNewPhone(merchant.phone);
 setNewBusinessType(merchant.businessType);
 setNewBusinessAddress(merchant.locations?.[0]?.address || '');
 setNewLocations(merchant.locations || []);
 setEditingId(merchant.id);
 setShowAddForm(true);
 };

 const toggleMerchantExpand = (merchantId: string) => {
 const newExpanded = new Set(expandedMerchants);
 if (newExpanded.has(merchantId)) {
 newExpanded.delete(merchantId);
 } else {
 newExpanded.add(merchantId);
 }
 setExpandedMerchants(newExpanded);
 };

 const addLocation = () => {
 if (!newLocationName.trim() || !newLocationAddress.trim()) {
 setError('Location name and address are required');
 return;
 }

 const location: MerchantLocation = {
 id: Date.now().toString(),
 name: newLocationName,
 address: newLocationAddress,
 isHQ: newLocations.length === 0,
 };

 setNewLocations([...newLocations, location]);
 setNewLocationName('');
 setNewLocationAddress('');
 setShowAddLocation(false);
 };

 const deleteLocation = (locationId: string) => {
 setNewLocations(newLocations.filter(l => l.id !== locationId));
 };

 const addMerchant = async () => {
 if (!newMerchantName.trim() || !newContactName.trim() || !newEmail.trim() || !newPhone.trim() || !newBusinessType.trim() || !newBusinessAddress.trim()) {
 setError('All fields are required');
 return;
 }

 if (newLocations.length === 0 && !newIsSingleLocation) {
 setError('Please add at least one location');
 return;
 }

 try {
 const merchantData = {
 business_name: newMerchantName,
 category: newBusinessType,
 email: newEmail,
 phone_number: newPhone,
 description: newBusinessAddress,
 };

 console.log('[PAGE] Submitting merchant data:', merchantData);

 // Handle edit vs create
 if (editingId) {
 console.log('[PAGE] Updating merchant:', editingId);
 await api.updateMerchant(editingId, merchantData, session);
 } else {
 console.log('[PAGE] Creating new merchant');
 const newMerchant = await api.createMerchant(merchantData, session);
 console.log('[PAGE] Create response:', newMerchant);

 // Add the new merchant to the local state immediately
 if (newMerchant) {
 const mappedMerchant = {
 id: newMerchant.id,
 name: newMerchant.business_name || newMerchantName,
 contactName: newContactName,
 email: newMerchant.email || newEmail,
 phone: newMerchant.phone_number || newPhone,
 businessType: newMerchant.category || newBusinessType,
 isSingleLocation: newIsSingleLocation,
 locations: [],
 };
 setItems([...items, mappedMerchant]);
 console.log('[PAGE] Merchant added to local state');
 }
 }

 console.log('[PAGE] Success, form will close');
 // Don't refresh data - keep the optimistically added merchant

 // Reset form
 setNewMerchantName('');
 setNewContactName('');
 setNewEmail('');
 setNewPhone('');
 setNewBusinessType('');
 setNewBusinessAddress('');
 setNewIsSingleLocation(true);
 setNewLocations([]);
 setShowAddForm(false);
 setEditingId(null);
 setError(null);
 } catch (err) {
 setError(`Failed to ${editingId ? 'update' : 'create'} merchant: ` + (err instanceof Error ? err.message : 'Unknown error'));
 console.error('[PAGE] Error:', err);
 }
 };

 const filteredItems = (Array.isArray(items) ? items : []).filter(item =>
 item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 if (status === 'loading') return null;

 return (
 <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: themeColors.gray50 }}>
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
 <div style={{ padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
 <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeColors.primary600 }}>
 <Icon name="back" size={20} />
 </button>
 <h1 style={{ fontSize: '28px', fontWeight: '700', color: themeColors.text, margin: 0 }}>Merchants</h1>
 </div>
 <button onClick={() => setShowAddForm(true)} style={{ background: themeColors.primary600, color: themeColors.white, border: 'none', padding: `${themeSpace.sm} ${themeSpace.lg}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', gap: themeSpace.sm, alignItems: 'center' }}>
 <Icon name="add" size={18} color={themeColors.white} />
 Add Merchant
 </button>
 </div>

 <div style={{ position: 'relative' }}>
 <div style={{ position: 'absolute', left: themeSpace.md, top: '12px' }}>
 <Icon name="search" size={18} color={themeColors.gray500} />
 </div>
 <input
 type="text"
 placeholder="Search merchants..."
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

 <div style={{ flex: 1, padding: themeSpace.xl, overflowY: 'auto' }}>
 {error && <div style={{ backgroundColor: '#fee2e2', border: `1px solid ${themeColors.error500}`, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: themeColors.error500 }}>{error}</div>}

 {loading ? (
 <div style={{ textAlign: 'center', padding: themeSpace.xl }}>Loading...</div>
 ) : filteredItems.length === 0 ? (
 <div style={{ textAlign: 'center', padding: themeSpace.xl, color: themeColors.gray600 }}>No merchants found</div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg }}>
 {filteredItems.map((merchant) => (
 <div key={merchant.id} style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.sm, overflow: 'hidden' }}>
 <div
 onClick={() => toggleMerchantExpand(merchant.id)}
 style={{
 padding: themeSpace.lg,
 cursor: 'pointer',
 backgroundColor: expandedMerchants.has(merchant.id) ? themeColors.primary50 : themeColors.white,
 borderLeft: `4px solid ${themeColors.primary600}`,
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 transition: 'background-color 0.2s'
 }}
 >
 <div style={{ flex: 1 }}>
 <div style={{ fontSize: '16px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.sm }}>
 {merchant.name}
 </div>
 <div style={{ display: 'flex', gap: themeSpace.xl, fontSize: '13px', color: themeColors.gray600 }}>
 <span>{merchant.contactName}</span>
 <span>{merchant.email}</span>
 <span>{merchant.phone}</span>
 <span style={{ padding: `2px ${themeSpace.sm}`, backgroundColor: themeColors.info50, color: themeColors.info600, borderRadius: themeRadius.sm }}>
 {merchant.businessType}
 </span>
 </div>
 </div>
 <div style={{ display: 'flex', gap: themeSpace.md, alignItems: 'center' }}>
 <button onClick={(e) => { e.stopPropagation(); handleEdit(merchant); }} style={{ background: themeColors.info50, border: 'none', color: themeColors.info600, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <Icon name="edit" size={16} color={themeColors.info600} />
 </button>
 <button onClick={(e) => { e.stopPropagation(); handleDelete(merchant.id); }} style={{ background: '#fee2e2', border: 'none', color: themeColors.error500, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <Icon name="delete" size={16} color={themeColors.error500} />
 </button>
 <Icon name={expandedMerchants.has(merchant.id) ? 'chevronDown' : 'chevronRight'} size={20} color={themeColors.gray600} />
 </div>
 </div>

 {expandedMerchants.has(merchant.id) && (
 <div style={{ padding: themeSpace.lg, borderTop: `1px solid ${themeColors.gray200}`, backgroundColor: themeColors.gray50 }}>
 <h4 style={{ fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.md, margin: 0 }}>Locations ({merchant.locations?.length || 0})</h4>
 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
 {(merchant.locations || []).map((location) => (
 <div key={location.id} style={{ padding: themeSpace.md, backgroundColor: themeColors.white, borderRadius: themeRadius.sm, borderLeft: `3px solid ${themeColors.info600}` }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <div>
 <div style={{ fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.xs }}>
 {location.name}
 </div>
 <div style={{ fontSize: '13px', color: themeColors.gray600 }}>
 {location.address}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

 {showAddForm && (
 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, overflowY: 'auto', padding: `${themeSpace.xl} 0` }}>
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, width: '90%', maxWidth: '600px', boxShadow: themeShadow.md, margin: 'auto' }}>
 <h2 style={{ fontSize: '20px', fontWeight: '700', color: themeColors.text, marginBottom: themeSpace.lg, margin: 0 }}>{editingId ? 'Edit' : 'Add New'} Merchant</h2>

 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg, marginBottom: themeSpace.xl, maxHeight: '60vh', overflowY: 'auto' }}>
 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Merchant Name</label>
 <input
 type="text"
 value={newMerchantName}
 onChange={(e) => setNewMerchantName(e.target.value)}
 placeholder="Enter merchant name"
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 boxSizing: 'border-box',
 }}
 />
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Contact Name</label>
 <input
 type="text"
 value={newContactName}
 onChange={(e) => setNewContactName(e.target.value)}
 placeholder="Enter contact person name"
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 boxSizing: 'border-box',
 }}
 />
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Email</label>
 <input
 type="email"
 value={newEmail}
 onChange={(e) => setNewEmail(e.target.value)}
 placeholder="Enter email address"
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 boxSizing: 'border-box',
 }}
 />
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Phone</label>
 <input
 type="tel"
 value={newPhone}
 onChange={(e) => setNewPhone(e.target.value)}
 placeholder="Enter phone number"
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 boxSizing: 'border-box',
 }}
 />
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Business Type</label>
 <select
 value={newBusinessType}
 onChange={(e) => setNewBusinessType(e.target.value)}
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 boxSizing: 'border-box',
 backgroundColor: themeColors.white,
 cursor: 'pointer',
 }}
 >
 <option value="">Select business type</option>
 {businessTypes.map((type) => (
 <option key={type} value={type}>
 {type}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>HQ Address</label>
 <input
 type="text"
 value={newBusinessAddress}
 onChange={(e) => setNewBusinessAddress(e.target.value)}
 placeholder="Enter business address"
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 boxSizing: 'border-box',
 }}
 />
 </div>

 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
 <input
 type="checkbox"
 id="singleLocation"
 checked={newIsSingleLocation}
 onChange={(e) => setNewIsSingleLocation(e.target.checked)}
 style={{ cursor: 'pointer', width: '18px', height: '18px' }}
 />
 <label htmlFor="singleLocation" style={{ fontSize: '14px', fontWeight: '500', color: themeColors.text, cursor: 'pointer' }}>
 Single Location Only
 </label>
 </div>

 {!newIsSingleLocation && (
 <div style={{ padding: themeSpace.lg, backgroundColor: themeColors.info50, borderRadius: themeRadius.sm, borderLeft: `3px solid ${themeColors.info600}` }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.md }}>
 <h4 style={{ fontSize: '14px', fontWeight: '600', color: themeColors.text, margin: 0 }}>Additional Locations</h4>
 <button
 onClick={() => setShowAddLocation(!showAddLocation)}
 style={{
 background: themeColors.info600,
 color: themeColors.white,
 border: 'none',
 padding: `${themeSpace.xs} ${themeSpace.md}`,
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontSize: '12px',
 fontWeight: '500',
 display: 'flex',
 gap: themeSpace.xs,
 alignItems: 'center',
 }}
 >
 <Icon name="add" size={14} color={themeColors.white} />
 Add Location
 </button>
 </div>

 {showAddLocation && (
 <div style={{ marginBottom: themeSpace.md, padding: themeSpace.md, backgroundColor: themeColors.white, borderRadius: themeRadius.sm }}>
 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
 <div>
 <label style={{ fontSize: '12px', fontWeight: '600', color: themeColors.gray600, display: 'block', marginBottom: themeSpace.xs }}>Location Name</label>
 <input
 type="text"
 value={newLocationName}
 onChange={(e) => setNewLocationName(e.target.value)}
 placeholder="e.g., Downtown Branch"
 style={{
 width: '100%',
 padding: `${themeSpace.xs} ${themeSpace.sm}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '13px',
 boxSizing: 'border-box',
 }}
 />
 </div>
 <div>
 <label style={{ fontSize: '12px', fontWeight: '600', color: themeColors.gray600, display: 'block', marginBottom: themeSpace.xs }}>Location Address</label>
 <input
 type="text"
 value={newLocationAddress}
 onChange={(e) => setNewLocationAddress(e.target.value)}
 placeholder="Enter location address"
 style={{
 width: '100%',
 padding: `${themeSpace.xs} ${themeSpace.sm}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '13px',
 boxSizing: 'border-box',
 }}
 />
 </div>
 <div style={{ display: 'flex', gap: themeSpace.sm }}>
 <button
 onClick={addLocation}
 style={{
 flex: 1,
 padding: `${themeSpace.xs} ${themeSpace.sm}`,
 background: themeColors.success600,
 color: themeColors.white,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontSize: '12px',
 fontWeight: '500',
 }}
 >
 Add
 </button>
 <button
 onClick={() => {
 setShowAddLocation(false);
 setNewLocationName('');
 setNewLocationAddress('');
 }}
 style={{
 flex: 1,
 padding: `${themeSpace.xs} ${themeSpace.sm}`,
 background: themeColors.gray100,
 color: themeColors.gray600,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontSize: '12px',
 fontWeight: '500',
 }}
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 )}

 {newLocations.length > 0 && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.sm }}>
 {newLocations.map((location) => (
 <div key={location.id} style={{ padding: themeSpace.sm, backgroundColor: themeColors.white, borderRadius: themeRadius.sm, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <div>
 <div style={{ fontSize: '12px', fontWeight: '600', color: themeColors.text }}>
 {location.name}
 </div>
 <div style={{ fontSize: '11px', color: themeColors.gray600 }}>
 {location.address}
 </div>
 </div>
 <button
 onClick={() => deleteLocation(location.id)}
 style={{
 background: 'none',
 border: 'none',
 color: themeColors.error500,
 cursor: 'pointer',
 padding: 0,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 }}
 >
 <Icon name="x" size={14} color={themeColors.error500} />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>

 <div style={{ display: 'flex', gap: themeSpace.md, justifyContent: 'flex-end' }}>
 <button
 onClick={() => {
 setShowAddForm(false);
 setNewMerchantName('');
 setNewContactName('');
 setNewEmail('');
 setNewPhone('');
 setNewBusinessType('');
 setNewBusinessAddress('');
 setNewIsSingleLocation(true);
 setNewLocations([]);
 setShowAddLocation(false);
 setNewLocationName('');
 setNewLocationAddress('');
 setEditingId(null);
 setError(null);
 }}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.lg}`,
 border: `1px solid ${themeColors.gray200}`,
 backgroundColor: themeColors.white,
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontSize: '14px',
 fontWeight: '500',
 color: themeColors.gray600,
 }}
 >
 Cancel
 </button>
 <button
 onClick={addMerchant}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.lg}`,
 background: themeColors.primary600,
 color: themeColors.white,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontSize: '14px',
 fontWeight: '500',
 }}
 >
 {editingId ? 'Save Changes' : 'Create Merchant'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
