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

const Icon = ({ name, size = 18, color = 'currentColor', ...props }: { name: string; size?: number; color?: string; [key: string]: any }) => {
 const icons: { [key: string]: JSX.Element } = {
 add: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
 edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
 delete: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
 search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
 back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
 chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>,
 chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>,
 };
 return <span {...props}>{icons[name] || null}</span>;
};

type UserRole = 'super_admin' | 'system_admin' | 'admin' | 'council' | 'troop_leader' | 'scout' | 'customer';

interface User {
 id: string;
 name: string;
 email: string;
 status: 'active' | 'inactive';
 role: UserRole;
}

export default function UsersPage() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [items, setItems] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [showAddForm, setShowAddForm] = useState(false);
 const [newUserName, setNewUserName] = useState('');
 const [newUserEmail, setNewUserEmail] = useState('');
 const [newUserStatus, setNewUserStatus] = useState<'active' | 'inactive'>('active');
 const [newUserRole, setNewUserRole] = useState<UserRole>('scout');
 const [troopLeaderSearchTerm, setTroopLeaderSearchTerm] = useState('');
 const [showAddTroopLeaderForm, setShowAddTroopLeaderForm] = useState(false);
 const [newTroopLeaderName, setNewTroopLeaderName] = useState('');
 const [newTroopLeaderEmail, setNewTroopLeaderEmail] = useState('');

 // Edit user state
 const [showEditForm, setShowEditForm] = useState(false);
 const [editingUser, setEditingUser] = useState<User | null>(null);
 const [editUserName, setEditUserName] = useState('');
 const [editUserEmail, setEditUserEmail] = useState('');
 const [editUserStatus, setEditUserStatus] = useState<'active' | 'inactive'>('active');
 const [editUserRole, setEditUserRole] = useState<UserRole>('scout');

 // Filter state
 const [roleFilter, setRoleFilter] = useState('');
 const [statusFilter, setStatusFilter] = useState('');

 // Pagination state
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(10);

 const roleOptions = [
 { value: 'super_admin', label: 'Super Admin' },
 { value: 'system_admin', label: 'System Admin' },
 { value: 'admin', label: 'Admin' },
 { value: 'council', label: 'Council' },
 { value: 'troop_leader', label: 'Troop Leader' },
 { value: 'scout', label: 'Scout' },
 { value: 'customer', label: 'Customer' },
 ];

 useEffect(() => {
 // Load data on mount, don't redirect if unauthenticated
 fetchData();
 }, []);

 const fetchData = async () => {
 try {
 setLoading(true);
 setError(null);
 const data = await api.getUsers(session);
 const rawUsers = data.content || data || [];
 // Map API response to frontend User interface
 const mappedUsers = rawUsers.map((u: any) => ({
 id: u.id,
 name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
 email: u.email,
 status: u.status || (u.isActive === false ? 'inactive' : 'active'),
 role: u.role ? u.role.toLowerCase() : 'scout',
 }));
 setItems(mappedUsers);
 } catch (err) {
 setError('Failed to load users');
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 const handleDelete = async (id: string) => {
 if (!confirm('Delete this user?')) return;
 try {
 await api.deleteUser(id, session);
 setItems(items.filter(i => i.id !== id));
 } catch (err) {
 setError('Failed to delete');
 }
 };

 const handleEdit = (user: User) => {
 console.log('[PAGE] Editing user:', user);
 setEditingUser(user);
 setEditUserName(user.name || '');
 setEditUserEmail(user.email || '');
 setEditUserStatus(user.status || 'active');
 setEditUserRole(user.role || 'scout');
 setShowEditForm(true);
 };

 const saveEditUser = async () => {
 if (!editingUser) return;
 if (!editUserName.trim() || !editUserEmail.trim()) {
 setError('Name and email are required');
 return;
 }

 try {
 const nameParts = editUserName.trim().split(' ');
 const firstName = nameParts[0];
 const lastName = nameParts.slice(1).join(' ') || '';

 const updateData = {
 firstName,
 lastName,
 isActive: editUserStatus === 'active',
 role: editUserRole.toUpperCase(),
 };

 console.log('[PAGE] Updating user:', editingUser.id, updateData);
 const updatedUser = await api.updateUser(editingUser.id, updateData, session);
 console.log('[PAGE] User updated successfully:', updatedUser);

 // Update local state
 setItems(items.map(item =>
 item.id === editingUser.id
 ? {
 ...item,
 name: editUserName,
 email: editUserEmail,
 status: editUserStatus,
 role: editUserRole,
 }
 : item
 ));

 // Reset form
 setShowEditForm(false);
 setEditingUser(null);
 setEditUserName('');
 setEditUserEmail('');
 setEditUserStatus('active');
 setEditUserRole('scout');
 setError(null);
 } catch (err) {
 setError('Failed to update user: ' + (err instanceof Error ? err.message : 'Unknown error'));
 console.error('[PAGE] Error updating user:', err);
 }
 };

 const addUser = async () => {
 if (!newUserName.trim() || !newUserEmail.trim()) {
 setError('Name and email are required');
 return;
 }

 try {
 // Split name into firstName and lastName
 const nameParts = newUserName.trim().split(' ');
 const firstName = nameParts[0];
 const lastName = nameParts.slice(1).join(' ') || '';

 const userData = {
 firstName: firstName,
 lastName: lastName,
 email: newUserEmail,
 isActive: newUserStatus === 'active',
 role: newUserRole,
 };

 console.log('[PAGE] Submitting user data:', userData);
 const newUser = await api.createUser(userData, session);
 console.log('[PAGE] User created successfully:', newUser);

 // Add to local state immediately
 if (newUser) {
 const user = {
 id: newUser.id || String(Math.floor(Math.random() * 10000)),
 name: `${newUser.firstName || firstName} ${newUser.lastName || lastName}`.trim(),
 email: newUser.email || newUserEmail,
 role: newUser.role || newUserRole,
 status: (newUser.isActive ? 'active' : 'inactive') as 'active' | 'inactive',
 };
 setItems([...items, user]);
 }

 // Don't refresh data - keep the optimistically added user

 // Reset form
 setNewUserName('');
 setNewUserEmail('');
 setNewUserStatus('active');
 setNewUserRole('scout');
 setShowAddForm(false);
 setError(null);
 } catch (err) {
 setError('Failed to create user: ' + (err instanceof Error ? err.message : 'Unknown error'));
 console.error('[PAGE] Error:', err);
 }
 };

 const filteredItems = (Array.isArray(items) ? items : []).filter(item => {
 const matchesSearch = searchTerm === '' ||
 item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.email?.toLowerCase().includes(searchTerm.toLowerCase());

 const matchesRole = roleFilter === '' || item.role === roleFilter;
 const matchesStatus = statusFilter === '' || item.status === statusFilter;

 return matchesSearch && matchesRole && matchesStatus;
 });

 // Pagination calculations
 const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const endIndex = startIndex + itemsPerPage;
 const paginatedItems = filteredItems.slice(startIndex, endIndex);

 // Reset to page 1 when filters change
 useEffect(() => {
 setCurrentPage(1);
 }, [searchTerm, roleFilter, statusFilter, itemsPerPage]);

 const troopLeaders = (Array.isArray(items) ? items : []).filter(item => item.role === 'troop_leader');

 const filteredTroopLeaders = troopLeaders.filter(leader =>
 leader.name?.toLowerCase().includes(troopLeaderSearchTerm.toLowerCase()) ||
 leader.email?.toLowerCase().includes(troopLeaderSearchTerm.toLowerCase())
 );

 const addNewTroopLeader = async () => {
 if (!newTroopLeaderName.trim() || !newTroopLeaderEmail.trim()) {
 setError('Name and email are required for troop leader');
 return;
 }

 try {
 const nameParts = newTroopLeaderName.trim().split(' ');
 const firstName = nameParts[0];
 const lastName = nameParts.slice(1).join(' ') || '';

 const userData = {
 firstName: firstName,
 lastName: lastName,
 email: newTroopLeaderEmail,
 isActive: true,
 role: 'TROOP_LEADER',
 };

 console.log('[PAGE] Creating new troop leader:', userData);
 const newTroopLeader = await api.createUser(userData, session);
 console.log('[PAGE] Troop leader created successfully:', newTroopLeader);

 // Add to local state immediately
 if (newTroopLeader) {
 const leader = {
 id: newTroopLeader.id || String(Math.floor(Math.random() * 10000)),
 name: `${newTroopLeader.firstName || firstName} ${newTroopLeader.lastName || lastName}`.trim(),
 email: newTroopLeader.email || newTroopLeaderEmail,
 role: 'troop_leader' as UserRole,
 status: 'active' as 'active' | 'inactive',
 };
 setItems([...items, leader]);
 }

 // Don't refresh data - keep the optimistically added troop leader

 // Reset form
 setNewTroopLeaderName('');
 setNewTroopLeaderEmail('');
 setShowAddTroopLeaderForm(false);
 setError(null);
 } catch (err) {
 setError('Failed to create troop leader: ' + (err instanceof Error ? err.message : 'Unknown error'));
 console.error('[PAGE] Error:', err);
 }
 };

 if (status === 'loading') return null;
 if (!session) return null;

 return (
 <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: themeColors.gray50 }}>
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
 <div style={{ padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
 <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeColors.primary600 }}>
 <Icon name="back" size={20} />
 </button>
 <h1 style={{ fontSize: '28px', fontWeight: '700', color: themeColors.text, margin: 0 }}>Users</h1>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
 <span style={{ fontSize: '13px', color: themeColors.gray600 }}>
 Showing {filteredItems.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length}
 </span>
 <button onClick={() => setShowAddForm(true)} style={{ background: themeColors.primary600, color: themeColors.white, border: 'none', padding: `${themeSpace.sm} ${themeSpace.lg}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', gap: themeSpace.sm, alignItems: 'center' }}>
 <Icon name="add" size={18} color={themeColors.white} />
 Add User
 </button>
 </div>
 </div>

 {/* Search and Filters */}
 <div style={{ display: 'flex', gap: themeSpace.md, flexWrap: 'wrap', alignItems: 'center' }}>
 <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '300px' }}>
 <Icon name="search" size={18} color={themeColors.gray500} style={{ position: 'absolute', left: themeSpace.md, top: '12px' }} />
 <input
 type="text"
 placeholder="Search users..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md} ${themeSpace.sm} ${themeSpace.xl}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 boxSizing: 'border-box',
 }}
 />
 </div>

 {/* Role Filter */}
 <select
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value)}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 backgroundColor: themeColors.white,
 cursor: 'pointer',
 minWidth: '140px',
 }}
 >
 <option value="">All Roles</option>
 {roleOptions.map(role => (
 <option key={role.value} value={role.value}>{role.label}</option>
 ))}
 </select>

 {/* Status Filter */}
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 backgroundColor: themeColors.white,
 cursor: 'pointer',
 minWidth: '120px',
 }}
 >
 <option value="">All Status</option>
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 </select>

 {/* Items Per Page */}
 <select
 value={itemsPerPage}
 onChange={(e) => setItemsPerPage(Number(e.target.value))}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 backgroundColor: themeColors.white,
 cursor: 'pointer',
 }}
 >
 <option value={10}>10 per page</option>
 <option value={25}>25 per page</option>
 <option value={50}>50 per page</option>
 <option value={100}>100 per page</option>
 </select>

 {/* Clear Filters */}
 {(searchTerm || roleFilter || statusFilter) && (
 <button
 onClick={() => {
 setSearchTerm('');
 setRoleFilter('');
 setStatusFilter('');
 }}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 backgroundColor: themeColors.gray100,
 color: themeColors.gray600,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontSize: '13px',
 fontWeight: '500',
 }}
 >
 Clear Filters
 </button>
 )}
 </div>
 </div>

 <div style={{ flex: 1, padding: themeSpace.xl, overflowY: 'auto' }}>
 {error && <div style={{ backgroundColor: '#fee2e2', border: `1px solid ${themeColors.error500}`, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: themeColors.error500 }}>{error}</div>}

 {loading ? (
 <div style={{ textAlign: 'center', padding: themeSpace.xl }}>Loading...</div>
 ) : filteredItems.length === 0 ? (
 <div style={{ textAlign: 'center', padding: themeSpace.xl, color: themeColors.gray600 }}>
 {items.length === 0 ? 'No users found' : 'No users match your filters'}
 </div>
 ) : (
 <>
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, overflow: 'hidden', boxShadow: themeShadow.sm }}>
 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
 <thead>
 <tr style={{ backgroundColor: themeColors.gray50, borderBottom: `1px solid ${themeColors.gray200}` }}>
 <th style={{ textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600 }}>Name</th>
 <th style={{ textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600 }}>Email</th>
 <th style={{ textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600 }}>Role</th>
 <th style={{ textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600 }}>Status</th>
 <th style={{ textAlign: 'center', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600 }}>Actions</th>
 </tr>
 </thead>
 <tbody>
 {paginatedItems.map((item) => (
 <tr key={item.id} style={{ borderBottom: `1px solid ${themeColors.gray200}` }}>
 <td style={{ padding: themeSpace.lg, fontSize: '14px', color: themeColors.text, fontWeight: '500' }}>{item.name}</td>
 <td style={{ padding: themeSpace.lg, fontSize: '14px', color: themeColors.text }}>{item.email}</td>
 <td style={{ padding: themeSpace.lg }}>
 <span style={{ padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: themeColors.primary50, color: themeColors.primary600, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '500' }}>
 {roleOptions.find(r => r.value === item.role)?.label || item.role}
 </span>
 </td>
 <td style={{ padding: themeSpace.lg }}>
 <span style={{ padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: item.status === 'active' ? themeColors.success50 : themeColors.gray100, color: item.status === 'active' ? themeColors.success600 : themeColors.gray600, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '500' }}>
 {item.status || 'active'}
 </span>
 </td>
 <td style={{ padding: themeSpace.lg, textAlign: 'center' }}>
 <div style={{ display: 'flex', gap: themeSpace.sm, justifyContent: 'center' }}>
 <button onClick={() => handleEdit(item)} style={{ background: themeColors.info50, border: 'none', color: themeColors.info600, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

 {/* Pagination Controls */}
 {totalPages > 1 && (
 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: themeSpace.sm, marginTop: themeSpace.xl, padding: themeSpace.lg, backgroundColor: themeColors.white, borderRadius: themeRadius.card, boxShadow: themeShadow.xs }}>
 <button
 onClick={() => setCurrentPage(1)}
 disabled={currentPage === 1}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 backgroundColor: currentPage === 1 ? themeColors.gray100 : themeColors.white,
 color: currentPage === 1 ? themeColors.gray500 : themeColors.primary600,
 border: `1px solid ${currentPage === 1 ? themeColors.gray200 : themeColors.primary100}`,
 borderRadius: themeRadius.sm,
 cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
 fontSize: '13px',
 fontWeight: '500',
 }}
 >
 First
 </button>
 <button
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 backgroundColor: currentPage === 1 ? themeColors.gray100 : themeColors.white,
 color: currentPage === 1 ? themeColors.gray500 : themeColors.primary600,
 border: `1px solid ${currentPage === 1 ? themeColors.gray200 : themeColors.primary100}`,
 borderRadius: themeRadius.sm,
 cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
 fontSize: '13px',
 fontWeight: '500',
 display: 'flex',
 alignItems: 'center',
 gap: themeSpace.xs,
 }}
 >
 <Icon name="chevronLeft" size={16} /> Prev
 </button>

 <div style={{ display: 'flex', gap: themeSpace.xs }}>
 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
 let pageNum;
 if (totalPages <= 5) {
 pageNum = i + 1;
 } else if (currentPage <= 3) {
 pageNum = i + 1;
 } else if (currentPage >= totalPages - 2) {
 pageNum = totalPages - 4 + i;
 } else {
 pageNum = currentPage - 2 + i;
 }
 return (
 <button
 key={pageNum}
 onClick={() => setCurrentPage(pageNum)}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 backgroundColor: currentPage === pageNum ? themeColors.primary600 : themeColors.white,
 color: currentPage === pageNum ? themeColors.white : themeColors.text,
 border: `1px solid ${currentPage === pageNum ? themeColors.primary600 : themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontSize: '13px',
 fontWeight: currentPage === pageNum ? '600' : '500',
 minWidth: '36px',
 }}
 >
 {pageNum}
 </button>
 );
 })}
 </div>

 <button
 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
 disabled={currentPage === totalPages}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 backgroundColor: currentPage === totalPages ? themeColors.gray100 : themeColors.white,
 color: currentPage === totalPages ? themeColors.gray500 : themeColors.primary600,
 border: `1px solid ${currentPage === totalPages ? themeColors.gray200 : themeColors.primary100}`,
 borderRadius: themeRadius.sm,
 cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
 fontSize: '13px',
 fontWeight: '500',
 display: 'flex',
 alignItems: 'center',
 gap: themeSpace.xs,
 }}
 >
 Next <Icon name="chevronRight" size={16} />
 </button>
 <button
 onClick={() => setCurrentPage(totalPages)}
 disabled={currentPage === totalPages}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 backgroundColor: currentPage === totalPages ? themeColors.gray100 : themeColors.white,
 color: currentPage === totalPages ? themeColors.gray500 : themeColors.primary600,
 border: `1px solid ${currentPage === totalPages ? themeColors.gray200 : themeColors.primary100}`,
 borderRadius: themeRadius.sm,
 cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
 fontSize: '13px',
 fontWeight: '500',
 }}
 >
 Last
 </button>
 </div>
 )}
 </>
 )}
 </div>

 {showAddForm && (
 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, width: '90%', maxWidth: '500px', boxShadow: themeShadow.md }}>
 <h2 style={{ fontSize: '20px', fontWeight: '700', color: themeColors.text, marginBottom: themeSpace.lg, margin: 0 }}>Add New User</h2>

 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg, marginBottom: themeSpace.xl }}>
 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Name</label>
 <input
 type="text"
 value={newUserName}
 onChange={(e) => setNewUserName(e.target.value)}
 placeholder="Enter user name"
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
 value={newUserEmail}
 onChange={(e) => setNewUserEmail(e.target.value)}
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
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Status</label>
 <select
 value={newUserStatus}
 onChange={(e) => setNewUserStatus(e.target.value as 'active' | 'inactive')}
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
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 </select>
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Role</label>
 <select
 value={newUserRole}
 onChange={(e) => setNewUserRole(e.target.value as UserRole)}
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
 {roleOptions.map((role) => (
 <option key={role.value} value={role.value}>
 {role.label}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div style={{ display: 'flex', gap: themeSpace.md, justifyContent: 'flex-end' }}>
 <button
 onClick={() => {
 setShowAddForm(false);
 setNewUserName('');
 setNewUserEmail('');
 setNewUserStatus('active');
 setNewUserRole('scout');
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
 onClick={addUser}
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
 Create User
 </button>
 </div>
 </div>
 </div>
 )}

 {showEditForm && editingUser && (
 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, width: '90%', maxWidth: '500px', boxShadow: themeShadow.md }}>
 <h2 style={{ fontSize: '20px', fontWeight: '700', color: themeColors.text, marginBottom: themeSpace.lg, margin: 0 }}>Edit User</h2>

 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg, marginBottom: themeSpace.xl }}>
 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Name</label>
 <input
 type="text"
 value={editUserName}
 onChange={(e) => setEditUserName(e.target.value)}
 placeholder="Enter user name"
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
 value={editUserEmail}
 onChange={(e) => setEditUserEmail(e.target.value)}
 placeholder="Enter email address"
 disabled
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 boxSizing: 'border-box',
 backgroundColor: themeColors.gray100,
 cursor: 'not-allowed',
 }}
 />
 <span style={{ fontSize: '11px', color: themeColors.gray500 }}>Email cannot be changed</span>
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Status</label>
 <select
 value={editUserStatus}
 onChange={(e) => setEditUserStatus(e.target.value as 'active' | 'inactive')}
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
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 </select>
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm }}>Role</label>
 <select
 value={editUserRole}
 onChange={(e) => setEditUserRole(e.target.value as UserRole)}
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
 {roleOptions.map((role) => (
 <option key={role.value} value={role.value}>
 {role.label}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div style={{ display: 'flex', gap: themeSpace.md, justifyContent: 'flex-end' }}>
 <button
 onClick={() => {
 setShowEditForm(false);
 setEditingUser(null);
 setEditUserName('');
 setEditUserEmail('');
 setEditUserStatus('active');
 setEditUserRole('scout');
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
 onClick={saveEditUser}
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
 Save Changes
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
