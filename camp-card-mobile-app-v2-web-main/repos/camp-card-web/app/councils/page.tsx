'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import PageLayout from '../components/PageLayout';

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
 info600: '#0284c7',
 error400: '#f87171',
 error500: '#ef4444',
};

const themeSpace = {
 xs: '3px',
 sm: '8px',
 md: '16px',
 lg: '24px',
 xl: '32px',
 '2xl': '40px',
 '3xl': '48px',
};

const themeRadius = {
 sm: '4px',
 card: '12px',
 lg: '16px',
};

const themeShadow = {
 xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
 sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
 md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const Icon = ({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
 const icons: Record<string, JSX.Element> = {
 back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
 plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
 x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
 chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>,
 chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>,
 chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>,
 trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
 users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
 building: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
 search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
 filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
 };
 return icons[name] || null;
};

interface TroopLeader {
 id: string;
 name: string;
 role: string;
}

interface TroopUnit {
 id: string;
 uuid: string;
 name: string;
 leaderName: string;
 troopLeaders: TroopLeader[];
}

interface Council {
 id: string;
 name: string;
 location: string;
 troopUnits: TroopUnit[];
}

export default function CouncilsPage() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [councils, setCouncils] = useState<Council[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 const [expandedCouncils, setExpandedCouncils] = useState<Set<string>>(new Set(['1']));
 const [expandedTroops, setExpandedTroops] = useState<Set<string>>(new Set());
 const [newCouncilName, setNewCouncilName] = useState('');
 const [newCouncilLocation, setNewCouncilLocation] = useState('');
 const [newTroopName, setNewTroopName] = useState('');
 const [newTroopLeader, setNewTroopLeader] = useState('');
 const [newLeaderName, setNewLeaderName] = useState('');
 const [newLeaderRole, setNewLeaderRole] = useState('');
 const [selectedCouncilForTroop, setSelectedCouncilForTroop] = useState('');
 const [selectedTroopForLeader, setSelectedTroopForLeader] = useState('');
 const [showAddCouncil, setShowAddCouncil] = useState(false);
 const [showAddTroop, setShowAddTroop] = useState<string | null>(null);
 const [showAddLeader, setShowAddLeader] = useState<string | null>(null);
 const [addedTroopLeaders, setAddedTroopLeaders] = useState<any[]>([]);
 const [availableTroopLeaders, setAvailableTroopLeaders] = useState<any[]>([]);
 const [troopLeaderSearchTerm, setTroopLeaderSearchTerm] = useState('');
 const [selectedTroopLeader, setSelectedTroopLeader] = useState<any | null>(null);

 // Search and filter state
 const [searchTerm, setSearchTerm] = useState('');
 const [locationFilter, setLocationFilter] = useState('');
 const [troopCountFilter, setTroopCountFilter] = useState('');

 // Pagination state
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(10);

 // Get unique locations for filter dropdown
 const uniqueLocations = [...new Set(councils.map(c => c.location))].filter(Boolean).sort();

 // Filter and search councils
 const filteredCouncils = councils.filter(council => {
   const matchesSearch = searchTerm === '' ||
     council.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     council.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
     council.troopUnits.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

   const matchesLocation = locationFilter === '' || council.location === locationFilter;

   const matchesTroopCount = troopCountFilter === '' ||
     (troopCountFilter === '0' && council.troopUnits.length === 0) ||
     (troopCountFilter === '1-5' && council.troopUnits.length >= 1 && council.troopUnits.length <= 5) ||
     (troopCountFilter === '6-10' && council.troopUnits.length >= 6 && council.troopUnits.length <= 10) ||
     (troopCountFilter === '10+' && council.troopUnits.length > 10);

   return matchesSearch && matchesLocation && matchesTroopCount;
 });

 // Pagination calculations
 const totalPages = Math.ceil(filteredCouncils.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const endIndex = startIndex + itemsPerPage;
 const paginatedCouncils = filteredCouncils.slice(startIndex, endIndex);

 // Reset to page 1 when filters change
 useEffect(() => {
   setCurrentPage(1);
 }, [searchTerm, locationFilter, troopCountFilter, itemsPerPage]);

 useEffect(() => {
 // Wait for session to be authenticated before loading data
 if (status === 'authenticated' && session) {
   loadData();
 }
 }, [status, session]);

 const loadData = async () => {
 setIsLoading(true);
 try {
 const councilData = await api.getOrganizations(session);
 const troopsData = await api.getTroops(session);
 const usersData = await api.getUsers(session);

 // Filter for existing troop leaders
 const troopLeaders = (usersData.content || usersData || []).filter(
 (user: any) => user.role === 'TROOP_LEADER'
 );
 setAvailableTroopLeaders(troopLeaders);

 const councilsArray = (councilData.content || councilData || []).map((council: any) => ({
 id: council.id?.toString() || council.uuid,
 name: council.name,
 location: council.location || `${council.city || ''}, ${council.state || ''}`.replace(/^, |, $/g, ''),
 region: council.region,
 status: council.status,
 totalTroops: council.totalTroops || 0,
 totalScouts: council.totalScouts || 0,
 troopUnits: (troopsData.content || troopsData || [])
 .filter((troop: any) => {
 // Match by councilId (number) or by council name
 const councilId = council.id?.toString();
 const troopCouncilId = troop.councilId?.toString();
 return troopCouncilId === councilId || troop.council === council.name;
 })
 .map((troop: any) => {
 // Find troop leaders assigned to this troop (match by UUID)
 const troopUuid = troop.uuid || troop.id?.toString();
 const assignedLeaders = troopLeaders.filter(
 (leader: any) => leader.troopId === troopUuid || leader.troopId?.toString() === troop.id?.toString()
 ).map((leader: any) => ({
 id: `${troop.id}-${leader.id}`,
 name: leader.name || `${leader.firstName} ${leader.lastName}`,
 role: 'Senior Leader',
 email: leader.email,
 userId: leader.id,
 }));

 return {
 id: troop.id?.toString(),
 uuid: troop.uuid || troop.id?.toString(),
 name: troop.troopName || troop.name || `Troop ${troop.troopNumber}`,
 troopNumber: troop.troopNumber,
 leaderName: troop.charterOrganization || troop.scoutmasterName || 'Scout Leader',
 scouts: troop.totalScouts || 0,
 troopLeaders: assignedLeaders,
 };
 }),
 }));

 setCouncils(councilsArray);
 } catch (err) {
 console.error('Failed to load councils and troops:', err);
 } finally {
 setIsLoading(false);
 }
 };



 const toggleCouncilExpand = (councilId: string) => {
 const newExpanded = new Set(expandedCouncils);
 if (newExpanded.has(councilId)) {
 newExpanded.delete(councilId);
 } else {
 newExpanded.add(councilId);
 }
 setExpandedCouncils(newExpanded);
 };

 const toggleTroopExpand = (troopId: string) => {
 const newExpanded = new Set(expandedTroops);
 if (newExpanded.has(troopId)) {
 newExpanded.delete(troopId);
 } else {
 newExpanded.add(troopId);
 }
 setExpandedTroops(newExpanded);
 };

 const addCouncil = async () => {
 if (newCouncilName && newCouncilLocation) {
 try {
 // Parse location into city and state
 const locationParts = newCouncilLocation.split(',').map(s => s.trim());
 const city = locationParts[0] || '';
 const state = locationParts[1] || '';

 // Create council via API
 const councilData = {
 councilNumber: `C${Date.now().toString().slice(-6)}`,
 name: newCouncilName,
 city: city,
 state: state,
 region: 'CENTRAL', // Default region
 status: 'ACTIVE'
 };

 const savedCouncil = await api.createOrganization(councilData, session);

 // Add to local state
 const newCouncil: Council = {
 id: savedCouncil.id?.toString() || Date.now().toString(),
 name: savedCouncil.name || newCouncilName,
 location: savedCouncil.location || newCouncilLocation,
 troopUnits: [],
 };
 setCouncils([...councils, newCouncil]);
 setNewCouncilName('');
 setNewCouncilLocation('');
 setShowAddCouncil(false);
 } catch (error) {
 console.error('Failed to create council:', error);
 alert('Failed to create council. Please try again.');
 }
 }
 };

 const addTroopUnit = async (councilId: string) => {
 if (newTroopName && newTroopLeader) {
 try {
 // Create troop via API
 const troopData = {
 troopNumber: `T${Date.now().toString().slice(-6)}`,
 troopName: newTroopName,
 councilId: parseInt(councilId, 10) || councilId,
 charterOrganization: newTroopLeader,
 troopType: 'SCOUTS_BSA',
 status: 'ACTIVE'
 };

 const savedTroop = await api.createTroop(troopData, session);

 // Update local state
 setCouncils(
 councils.map((council) => {
 if (council.id === councilId) {
 return {
 ...council,
 troopUnits: [
 ...council.troopUnits,
 {
 id: savedTroop.id?.toString() || `${councilId}-${Date.now()}`,
 uuid: savedTroop.uuid || savedTroop.id?.toString() || `${councilId}-${Date.now()}`,
 name: savedTroop.troopName || newTroopName,
 leaderName: newTroopLeader,
 troopLeaders: [],
 },
 ],
 };
 }
 return council;
 })
 );
 } catch (error) {
 console.error('Failed to create troop:', error);
 alert('Failed to create troop. Please try again.');
 return;
 }
 setNewTroopName('');
 setNewTroopLeader('');
 setShowAddTroop(null);
 }
 };

 const addTroopLeader = async (councilId: string, troopId: string) => {
 if (!selectedTroopLeader) {
 console.warn('No troop leader selected');
 return;
 }

 try {
 // Assign the leader to the troop via API using the dedicated endpoint
 await api.assignScoutToTroop(selectedTroopLeader.id, troopId, session);

 // Create assignment with existing leader
 const newLeaderAssignment = {
 id: `${troopId}-${selectedTroopLeader.id}-${Date.now()}`,
 name: selectedTroopLeader.name || `${selectedTroopLeader.firstName} ${selectedTroopLeader.lastName}`,
 role: 'Senior Leader',
 email: selectedTroopLeader.email,
 userId: selectedTroopLeader.id,
 };

 // Add to councils state
 setCouncils(
 councils.map((council) => {
 if (council.id === councilId) {
 return {
 ...council,
 troopUnits: council.troopUnits.map((troop) => {
 if (troop.id === troopId) {
 return {
 ...troop,
 troopLeaders: [...troop.troopLeaders, newLeaderAssignment],
 };
 }
 return troop;
 }),
 };
 }
 return council;
 })
 );

 // Reset search and selection
 setTroopLeaderSearchTerm('');
 setSelectedTroopLeader(null);
 setShowAddLeader(null);
 setNewLeaderName('');
 setNewLeaderRole('');
 } catch (error) {
 console.error('Failed to assign leader to troop:', error);
 alert('Failed to assign leader to troop. Please try again.');
 }
 };

 const deleteCouncil = async (councilId: string) => {
 try {
 // Delete from backend
 await api.deleteOrganization(councilId, session);
 // Update local state
 setCouncils(councils.filter((c) => c.id !== councilId));
 } catch (error) {
 console.error('Failed to delete council:', error);
 // Still remove from local state for UX
 setCouncils(councils.filter((c) => c.id !== councilId));
 }
 };

 const deleteTroopUnit = async (councilId: string, troopId: string) => {
 try {
 // Delete from backend
 await api.deleteTroop(troopId, session);
 } catch (error) {
 console.error('Failed to delete troop:', error);
 }
 // Update local state regardless
 setCouncils(
 councils.map((council) => {
 if (council.id === councilId) {
 return {
 ...council,
 troopUnits: council.troopUnits.filter((t) => t.id !== troopId),
 };
 }
 return council;
 })
 );
 };

 const deleteTroopLeader = (councilId: string, troopId: string, leaderId: string) => {
 setCouncils(
 councils.map((council) => {
 if (council.id === councilId) {
 return {
 ...council,
 troopUnits: council.troopUnits.map((troop) => {
 if (troop.id === troopId) {
 return {
 ...troop,
 troopLeaders: troop.troopLeaders.filter((l) => l.id !== leaderId),
 };
 }
 return troop;
 }),
 };
 }
 return council;
 })
 );
 };

 // Show loading state while session is loading or data is being fetched
 if (status === 'loading' || isLoading) {
   return (
     <PageLayout title="Councils & Troops" currentPath="/councils">
       <div style={{
         display: 'flex',
         justifyContent: 'center',
         alignItems: 'center',
         minHeight: '400px',
         flexDirection: 'column',
         gap: themeSpace.md
       }}>
         <div style={{
           width: '40px',
           height: '40px',
           border: `3px solid ${themeColors.gray200}`,
           borderTopColor: themeColors.primary600,
           borderRadius: '50%',
           animation: 'spin 1s linear infinite',
         }} />
         <p style={{ color: themeColors.gray600, margin: 0 }}>Loading councils...</p>
         <style>{`
           @keyframes spin {
             to { transform: rotate(360deg); }
           }
         `}</style>
       </div>
     </PageLayout>
   );
 }

 return (
 <PageLayout title="Councils & Troops" currentPath="/councils">
 {/* Header */}
 <div style={{ padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: themeSpace.lg }}>
 <div>
 <p style={{ margin: 0, color: themeColors.gray600, fontSize: '13px' }}>Manage councils, troop units, and troop leaders</p>
 </div>
 <div style={{ fontSize: '13px', color: themeColors.gray600 }}>
 Showing {startIndex + 1}-{Math.min(endIndex, filteredCouncils.length)} of {filteredCouncils.length} councils
 </div>
 </div>

 {/* Search and Filters */}
 <div style={{ display: 'flex', gap: themeSpace.md, flexWrap: 'wrap', alignItems: 'center' }}>
 {/* Search Input */}
 <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '400px' }}>
 <div style={{ position: 'absolute', left: themeSpace.md, top: '50%', transform: 'translateY(-50%)' }}>
 <Icon name="search" size={18} color={themeColors.gray500} />
 </div>
 <input
 type="text"
 placeholder="Search councils, troops..."
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

 {/* Location Filter */}
 <select
 value={locationFilter}
 onChange={(e) => setLocationFilter(e.target.value)}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 backgroundColor: themeColors.white,
 cursor: 'pointer',
 minWidth: '150px',
 }}
 >
 <option value="">All Locations</option>
 {uniqueLocations.map(loc => (
 <option key={loc} value={loc}>{loc}</option>
 ))}
 </select>

 {/* Troop Count Filter */}
 <select
 value={troopCountFilter}
 onChange={(e) => setTroopCountFilter(e.target.value)}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 backgroundColor: themeColors.white,
 cursor: 'pointer',
 minWidth: '150px',
 }}
 >
 <option value="">All Troop Counts</option>
 <option value="0">No Troops</option>
 <option value="1-5">1-5 Troops</option>
 <option value="6-10">6-10 Troops</option>
 <option value="10+">More than 10</option>
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
 {(searchTerm || locationFilter || troopCountFilter) && (
 <button
 onClick={() => {
 setSearchTerm('');
 setLocationFilter('');
 setTroopCountFilter('');
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

 {/* Add Council Button */}
 <button
 onClick={() => setShowAddCouncil(!showAddCouncil)}
 style={{
 padding: `${themeSpace.md} ${themeSpace.lg}`,
 backgroundColor: themeColors.primary600,
 color: themeColors.white,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontWeight: '600',
 fontSize: '14px',
 display: 'flex',
 alignItems: 'center',
 gap: themeSpace.md,
 marginBottom: themeSpace.xl,
 transition: 'all 200ms ease',
 boxShadow: themeShadow.sm,
 }}
 onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.primary800)}
 onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = themeColors.primary600)}
 >
 <Icon name="plus" size={18} />
 New Council
 </button>

 {/* Add Council Form */}
 {showAddCouncil && (
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.lg, padding: themeSpace.xl, marginBottom: themeSpace.xl, boxShadow: themeShadow.md, border: `1px solid ${themeColors.primary200}` }}>
 <h3 style={{ margin: `0 0 ${themeSpace.lg} 0`, color: themeColors.text, fontSize: '16px', fontWeight: '600' }}>Create New Council</h3>
 <div style={{ display: 'grid', gap: themeSpace.lg, marginBottom: themeSpace.lg }}>
 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.sm }}>Council Name</label>
 <input
 type="text"
 placeholder="e.g., Northern District Council"
 value={newCouncilName}
 onChange={(e) => setNewCouncilName(e.target.value)}
 style={{
 width: '100%',
 padding: `${themeSpace.md} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray300}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 boxSizing: 'border-box',
 }}
 />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.sm }}>Location</label>
 <input
 type="text"
 placeholder="e.g., North Region"
 value={newCouncilLocation}
 onChange={(e) => setNewCouncilLocation(e.target.value)}
 style={{
 width: '100%',
 padding: `${themeSpace.md} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray300}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 boxSizing: 'border-box',
 }}
 />
 </div>
 </div>
 <div style={{ display: 'flex', gap: themeSpace.md }}>
 <button
 onClick={addCouncil}
 style={{
 padding: `${themeSpace.md} ${themeSpace.lg}`,
 backgroundColor: themeColors.success600,
 color: themeColors.white,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontWeight: '600',
 fontSize: '14px',
 }}
 >
 Create Council
 </button>
 <button
 onClick={() => setShowAddCouncil(false)}
 style={{
 padding: `${themeSpace.md} ${themeSpace.lg}`,
 backgroundColor: themeColors.gray200,
 color: themeColors.text,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontWeight: '600',
 fontSize: '14px',
 }}
 >
 Cancel
 </button>
 </div>
 </div>
 )}

 {/* Councils List */}
 {filteredCouncils.length === 0 ? (
 <div style={{ textAlign: 'center', padding: themeSpace.xl, backgroundColor: themeColors.white, borderRadius: themeRadius.lg, color: themeColors.gray600 }}>
 <Icon name="building" size={48} color={themeColors.gray300} />
 <p style={{ marginTop: themeSpace.lg, fontSize: '15px', fontWeight: '500' }}>
 {councils.length === 0 ? 'No councils yet. Create one to get started!' : 'No councils match your filters.'}
 </p>
 </div>
 ) : (
 <div style={{ display: 'grid', gap: themeSpace.lg }}>
 {paginatedCouncils.map((council) => (
 <div key={council.id} style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.lg, overflow: 'hidden', boxShadow: themeShadow.sm, border: `1px solid ${themeColors.gray200}` }}>
 {/* Council Header */}
 <div
 onClick={() => toggleCouncilExpand(council.id)}
 style={{
 padding: themeSpace.lg,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 cursor: 'pointer',
 backgroundColor: expandedCouncils.has(council.id) ? themeColors.primary50 : themeColors.white,
 borderBottom: expandedCouncils.has(council.id) ? `2px solid ${themeColors.primary200}` : 'none',
 transition: 'all 200ms ease',
 }}
 onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.primary50)}
 onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = expandedCouncils.has(council.id) ? themeColors.primary50 : themeColors.white)}
 >
 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.lg, flex: 1 }}>
 <div style={{ color: themeColors.primary600 }}>
 {expandedCouncils.has(council.id) ? <Icon name="chevronDown" size={22} /> : <Icon name="chevronRight" size={22} />}
 </div>
 <div style={{ flex: 1 }}>
 <h3 style={{ margin: 0, color: themeColors.text, fontWeight: '700', fontSize: '16px' }}>{council.name}</h3>
 <p style={{ margin: `${themeSpace.xs} 0 0 0`, fontSize: '13px', color: themeColors.gray600 }}>{council.location}  {council.troopUnits.length} troop unit{council.troopUnits.length !== 1 ? 's' : ''}</p>
 </div>
 </div>
 <button
 onClick={(e) => {
 e.stopPropagation();
 deleteCouncil(council.id);
 }}
 style={{
 background: 'none',
 border: 'none',
 cursor: 'pointer',
 color: themeColors.error500,
 padding: themeSpace.sm,
 }}
 >
 <Icon name="trash" size={18} />
 </button>
 </div>

 {/* Expanded Content */}
 {expandedCouncils.has(council.id) && (
 <div style={{ padding: themeSpace.lg, backgroundColor: themeColors.gray50, borderTop: `1px solid ${themeColors.gray200}` }}>
 {/* Add Troop Button */}
 <button
 onClick={() => setShowAddTroop(showAddTroop === council.id ? null : council.id)}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.lg}`,
 backgroundColor: themeColors.info600,
 color: themeColors.white,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontWeight: '600',
 fontSize: '13px',
 display: 'flex',
 alignItems: 'center',
 gap: themeSpace.sm,
 marginBottom: themeSpace.lg,
 }}
 >
 <Icon name="plus" size={16} />
 Add Troop Unit
 </button>

 {/* Add Troop Form */}
 {showAddTroop === council.id && (
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, border: `1px solid ${themeColors.info50}` }}>
 <h4 style={{ margin: `0 0 ${themeSpace.lg} 0`, fontSize: '14px', fontWeight: '600', color: themeColors.text }}>New Troop Unit</h4>
 <div style={{ display: 'grid', gap: themeSpace.md, marginBottom: themeSpace.lg }}>
 <div>
 <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.xs }}>Troop Name</label>
 <input
 type="text"
 placeholder="e.g., Troop A"
 value={newTroopName}
 onChange={(e) => setNewTroopName(e.target.value)}
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray300}`,
 borderRadius: themeRadius.sm,
 fontSize: '13px',
 boxSizing: 'border-box',
 }}
 />
 </div>
 <div>
 <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.xs }}>Unit Leader</label>
 <input
 type="text"
 placeholder="Leader name"
 value={newTroopLeader}
 onChange={(e) => setNewTroopLeader(e.target.value)}
 style={{
 width: '100%',
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${themeColors.gray300}`,
 borderRadius: themeRadius.sm,
 fontSize: '13px',
 boxSizing: 'border-box',
 }}
 />
 </div>
 </div>
 <div style={{ display: 'flex', gap: themeSpace.md }}>
 <button
 onClick={() => addTroopUnit(council.id)}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.lg}`,
 backgroundColor: themeColors.success600,
 color: themeColors.white,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontWeight: '600',
 fontSize: '13px',
 }}
 >
 Create
 </button>
 <button
 onClick={() => setShowAddTroop(null)}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.lg}`,
 backgroundColor: themeColors.gray200,
 color: themeColors.text,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontWeight: '600',
 fontSize: '13px',
 }}
 >
 Cancel
 </button>
 </div>
 </div>
 )}

 {/* Troop Units List */}
 {council.troopUnits.length === 0 ? (
 <p style={{ color: themeColors.gray500, fontSize: '13px', margin: 0, padding: themeSpace.lg, textAlign: 'center' }}>No troop units yet. Add one to get started.</p>
 ) : (
 <div style={{ display: 'grid', gap: themeSpace.lg }}>
 {council.troopUnits.map((troop) => (
 <div key={troop.id} style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, overflow: 'hidden', border: `1px solid ${themeColors.gray200}` }}>
 {/* Troop Header */}
 <div
 onClick={() => toggleTroopExpand(troop.id)}
 style={{
 padding: themeSpace.lg,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 cursor: 'pointer',
 backgroundColor: expandedTroops.has(troop.id) ? themeColors.primary50 : themeColors.white,
 borderBottom: expandedTroops.has(troop.id) ? `1px solid ${themeColors.gray200}` : 'none',
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md, flex: 1 }}>
 <div style={{ color: themeColors.info600 }}>
 {expandedTroops.has(troop.id) ? <Icon name="chevronDown" size={20} /> : <Icon name="chevronRight" size={20} />}
 </div>
 <div>
 <h4 style={{ margin: 0, color: themeColors.text, fontWeight: '600', fontSize: '15px' }}>{troop.name}</h4>
 <p style={{ margin: `${themeSpace.xs} 0 0 0`, fontSize: '12px', color: themeColors.gray600 }}>Leader: {troop.leaderName}</p>
 </div>
 </div>
 <button
 onClick={(e) => {
 e.stopPropagation();
 deleteTroopUnit(council.id, troop.id);
 }}
 style={{
 background: 'none',
 border: 'none',
 cursor: 'pointer',
 color: themeColors.error500,
 padding: themeSpace.sm,
 }}
 >
 <Icon name="trash" size={16} />
 </button>
 </div>

 {/* Troop Expanded Content */}
 {expandedTroops.has(troop.id) && (
 <div style={{ padding: themeSpace.lg, backgroundColor: themeColors.gray50, borderTop: `1px solid ${themeColors.gray200}` }}>
 {/* Add Leader Button */}
 <button
 onClick={() => setShowAddLeader(showAddLeader === troop.id ? null : troop.id)}
 style={{
 padding: `${themeSpace.xs} ${themeSpace.md}`,
 backgroundColor: themeColors.warning600,
 color: themeColors.white,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontWeight: '600',
 fontSize: '12px',
 display: 'flex',
 alignItems: 'center',
 gap: themeSpace.xs,
 marginBottom: themeSpace.md,
 }}
 >
 <Icon name="plus" size={14} />
 Add Leader
 </button>

 {/* Add Leader Form - Search for Existing Leaders */}
 {showAddLeader === troop.id && (
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.sm, padding: themeSpace.md, marginBottom: themeSpace.md, border: `1px solid ${themeColors.warning50}` }}>
 <h5 style={{ margin: `0 0 ${themeSpace.sm} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.text }}>Search for Troop Leader</h5>
 <div style={{ marginBottom: themeSpace.md }}>
 <input
 type="text"
 placeholder="Search by name or email..."
 value={troopLeaderSearchTerm}
 onChange={(e) => setTroopLeaderSearchTerm(e.target.value)}
 style={{
 width: '100%',
 padding: `${themeSpace.xs} ${themeSpace.sm}`,
 border: `1px solid ${themeColors.gray300}`,
 borderRadius: themeRadius.sm,
 fontSize: '12px',
 boxSizing: 'border-box',
 marginBottom: themeSpace.sm,
 }}
 />
 <p style={{ fontSize: '11px', color: themeColors.gray600, margin: 0 }}>
 {availableTroopLeaders.length} troop leaders available
 </p>
 </div>

 {/* Filtered Leaders List */}
 <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: themeSpace.md }}>
 {availableTroopLeaders
 .filter(
 (leader: any) =>
 leader.name?.toLowerCase().includes(troopLeaderSearchTerm.toLowerCase()) ||
 leader.firstName?.toLowerCase().includes(troopLeaderSearchTerm.toLowerCase()) ||
 leader.email?.toLowerCase().includes(troopLeaderSearchTerm.toLowerCase())
 )
 .length === 0 ? (
 <p style={{ fontSize: '11px', color: themeColors.gray600, margin: 0, padding: themeSpace.sm, textAlign: 'center' }}>
 No leaders found matching your search
 </p>
 ) : (
 <div style={{ display: 'grid', gap: themeSpace.sm }}>
 {availableTroopLeaders
 .filter(
 (leader: any) =>
 leader.name?.toLowerCase().includes(troopLeaderSearchTerm.toLowerCase()) ||
 leader.firstName?.toLowerCase().includes(troopLeaderSearchTerm.toLowerCase()) ||
 leader.email?.toLowerCase().includes(troopLeaderSearchTerm.toLowerCase())
 )
 .map((leader: any) => (
 <button
 key={leader.id}
 onClick={() => setSelectedTroopLeader(leader)}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 border: `1px solid ${selectedTroopLeader?.id === leader.id ? themeColors.primary600 : themeColors.gray300}`,
 borderRadius: themeRadius.sm,
 backgroundColor: selectedTroopLeader?.id === leader.id ? themeColors.primary50 : themeColors.white,
 cursor: 'pointer',
 fontSize: '11px',
 textAlign: 'left',
 transition: 'all 150ms ease',
 }}
 onMouseEnter={(e) => {
 if (selectedTroopLeader?.id !== leader.id) {
 e.currentTarget.style.backgroundColor = themeColors.gray50;
 e.currentTarget.style.borderColor = themeColors.primary300;
 }
 }}
 onMouseLeave={(e) => {
 if (selectedTroopLeader?.id !== leader.id) {
 e.currentTarget.style.backgroundColor = themeColors.white;
 e.currentTarget.style.borderColor = themeColors.gray300;
 }
 }}
 >
 <div style={{ fontWeight: selectedTroopLeader?.id === leader.id ? '600' : '500', color: themeColors.text }}>
 {leader.name || `${leader.firstName} ${leader.lastName}`}
 </div>
 <div style={{ fontSize: '10px', color: themeColors.gray600 }}>{leader.email}</div>
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Action Buttons */}
 <div style={{ display: 'flex', gap: themeSpace.sm }}>
 <button
 onClick={() => {
 if (selectedTroopLeader) {
 addTroopLeader(council.id, troop.uuid);
 }
 }}
 disabled={!selectedTroopLeader}
 style={{
 padding: `${themeSpace.xs} ${themeSpace.md}`,
 backgroundColor: selectedTroopLeader ? themeColors.success600 : themeColors.gray300,
 color: themeColors.white,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: selectedTroopLeader ? 'pointer' : 'not-allowed',
 fontWeight: '600',
 fontSize: '11px',
 }}
 >
 Assign
 </button>
 <button
 onClick={() => {
 setShowAddLeader(null);
 setTroopLeaderSearchTerm('');
 setSelectedTroopLeader(null);
 }}
 style={{
 padding: `${themeSpace.xs} ${themeSpace.md}`,
 backgroundColor: themeColors.gray200,
 color: themeColors.text,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontWeight: '600',
 fontSize: '11px',
 }}
 >
 Cancel
 </button>
 </div>
 </div>
 )}

 {/* Troop Leaders List */}
 {troop.troopLeaders.length === 0 ? (
 <p style={{ color: themeColors.gray500, fontSize: '12px', margin: 0 }}>No leaders added yet</p>
 ) : (
 <div style={{ display: 'grid', gap: themeSpace.md }}>
 {troop.troopLeaders.map((leader) => (
 <div
 key={leader.id}
 style={{
 backgroundColor: themeColors.white,
 borderRadius: themeRadius.sm,
 padding: themeSpace.md,
 borderLeft: `3px solid ${themeColors.warning600}`,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 }}
 >
 <div>
 <h5 style={{ margin: 0, color: themeColors.text, fontWeight: '600', fontSize: '13px' }}>{leader.name}</h5>
 <p style={{ margin: `${themeSpace.xs} 0 0 0`, fontSize: '11px', color: themeColors.gray600 }}>{leader.role}</p>
 </div>
 <button
 onClick={() => deleteTroopLeader(council.id, troop.id, leader.id)}
 style={{
 background: 'none',
 border: 'none',
 cursor: 'pointer',
 color: themeColors.error500,
 padding: themeSpace.xs,
 }}
 >
 <Icon name="trash" size={14} />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 ))}
 </div>
 )}

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
 border: `1px solid ${currentPage === 1 ? themeColors.gray200 : themeColors.primary200}`,
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
 border: `1px solid ${currentPage === 1 ? themeColors.gray200 : themeColors.primary200}`,
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
 border: `1px solid ${currentPage === totalPages ? themeColors.gray200 : themeColors.primary200}`,
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
 border: `1px solid ${currentPage === totalPages ? themeColors.gray200 : themeColors.primary200}`,
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
 </PageLayout>
 );
}

