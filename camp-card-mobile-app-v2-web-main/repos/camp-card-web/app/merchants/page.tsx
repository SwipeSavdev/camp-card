'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  info200: '#cffafe',
  info600: '#0284c7',
  error400: '#f87171',
  error500: '#ef4444',
};

const themeSpace = {
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px',
};
const themeRadius = { sm: '4px', card: '12px', lg: '16px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

function Icon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const icons: { [key: string]: any } = {
    add: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
         </svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>,
    delete: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
            </svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
            </svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>,
    chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
       </svg>,
  };
  return icons[name] || null;
}

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
  const _router = useRouter();
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

  // Filter state
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [locationCountFilter, setLocationCountFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const businessTypes = [
    'Retail',
    'Restaurant',
    'Service',
    'Entertainment',
    'Healthcare',
    'Education',
    'Other',
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
          locations,
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
      console.log('[PAGE] Deleting merchant:', id);
      await api.deleteMerchant(id, session);
      console.log('[PAGE] Merchant deleted successfully');
      setItems(items.filter((i) => i.id !== id));
      setError(null);
    } catch (err: any) {
      console.error('[PAGE] Delete error:', err);
      const errorMsg = err?.status === 403
        ? 'Permission denied. Only National Admins can delete merchants.'
        : err?.status === 404
        ? 'Merchant not found.'
        : `Failed to delete merchant: ${err?.message || 'Unknown error'}`;
      setError(errorMsg);
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
    setNewLocations(newLocations.filter((l) => l.id !== locationId));
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
      // Parse the address into components for the location
      // Expected format: "123 Main St, City, ST 12345" or just use as street address
      const parseAddress = (address: string) => {
        const parts = address.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const streetAddress = parts[0];
          const city = parts[1];
          const stateZip = parts[2].split(' ');
          const state = stateZip[0] || '';
          const zipCode = stateZip[1] || '';
          return { streetAddress, city, state, zipCode };
        }
        // If not parseable, use defaults
        return {
          streetAddress: address,
          city: 'Unknown',
          state: 'XX',
          zipCode: '00000'
        };
      };

      // Build primary location from the first location or the business address
      const primaryLocationData = newLocations.length > 0
        ? {
            locationName: newLocations[0].name,
            ...parseAddress(newLocations[0].address),
            primaryLocation: true,
            phone: newPhone,
          }
        : newIsSingleLocation
        ? {
            locationName: newMerchantName + ' - Main',
            ...parseAddress(newBusinessAddress),
            primaryLocation: true,
            phone: newPhone,
          }
        : null;

      const merchantData = {
        businessName: newMerchantName,
        category: newBusinessType,
        contactName: newContactName,
        contactEmail: newEmail,
        contactPhone: newPhone,
        description: newBusinessAddress,
        primaryLocation: primaryLocationData,
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

        // Add additional locations if any (beyond the primary)
        if (newMerchant && newLocations.length > 1) {
          for (let i = 1; i < newLocations.length; i++) {
            const loc = newLocations[i];
            const locData = {
              locationName: loc.name,
              ...parseAddress(loc.address),
              primaryLocation: false,
              phone: newPhone,
            };
            try {
              await api.createMerchantLocation(newMerchant.id, locData, session);
              console.log(`[PAGE] Created additional location: ${loc.name}`);
            } catch (locErr) {
              console.error(`[PAGE] Failed to create location ${loc.name}:`, locErr);
            }
          }
        }

        // Add the new merchant to the local state immediately
        if (newMerchant) {
          const mappedMerchant = {
            id: newMerchant.id,
            name: newMerchant.businessName || newMerchantName,
            contactName: newMerchant.contactName || newContactName,
            email: newMerchant.contactEmail || newEmail,
            phone: newMerchant.contactPhone || newPhone,
            businessType: newMerchant.category || newBusinessType,
            isSingleLocation: newIsSingleLocation,
            locations: newMerchant.locations || [],
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
      setError(`Failed to ${editingId ? 'update' : 'create'} merchant: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[PAGE] Error:', err);
    }
  };

  const filteredItems = (Array.isArray(items) ? items : []).filter((item) => {
    const matchesSearch = searchTerm === ''
 || item.name?.toLowerCase().includes(searchTerm.toLowerCase())
 || item.email?.toLowerCase().includes(searchTerm.toLowerCase())
 || item.contactName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBusinessType = businessTypeFilter === '' || item.businessType === businessTypeFilter;

    const matchesLocationCount = locationCountFilter === ''
 || (locationCountFilter === 'single' && item.isSingleLocation)
 || (locationCountFilter === 'multi' && !item.isSingleLocation)
 || (locationCountFilter === '0' && (!item.locations || item.locations.length === 0))
 || (locationCountFilter === '1-5' && item.locations && item.locations.length >= 1 && item.locations.length <= 5)
 || (locationCountFilter === '5+' && item.locations && item.locations.length > 5);

    return matchesSearch && matchesBusinessType && matchesLocationCount;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, businessTypeFilter, locationCountFilter, itemsPerPage]);

  if (status === 'loading') return null;

  return (
    <PageLayout title="Merchants" currentPath="/merchants">
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg,
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
            <span style={{ fontSize: '13px', color: themeColors.gray600 }}>
              Showing
              {' '}
              {filteredItems.length > 0 ? startIndex + 1 : 0}
              -
              {Math.min(endIndex, filteredItems.length)}
              {' '}
              of
              {filteredItems.length}
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: themeColors.primary600, color: themeColors.white, border: 'none', padding: `${themeSpace.sm} ${themeSpace.lg}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', gap: themeSpace.sm, alignItems: 'center',
            }}
          >
            <Icon name="add" size={18} color={themeColors.white} />
            Add Merchant
          </button>
        </div>

        {/* Search and Filters */}
        <div style={{
          display: 'flex', gap: themeSpace.md, flexWrap: 'wrap', alignItems: 'center',
        }}
        >
          <div style={{
            position: 'relative', flex: '1', minWidth: '200px', maxWidth: '300px',
          }}
          >
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
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Business Type Filter */}
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
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
            <option value="">All Types</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Location Count Filter */}
          <select
            value={locationCountFilter}
            onChange={(e) => setLocationCountFilter(e.target.value)}
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
            <option value="single">Single Location</option>
            <option value="multi">Multi-Location</option>
            <option value="0">No Locations</option>
            <option value="1-5">1-5 Locations</option>
            <option value="5+">More than 5</option>
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
          {(searchTerm || businessTypeFilter || locationCountFilter) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setBusinessTypeFilter('');
              setLocationCountFilter('');
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

      {error && (
      <div style={{
        backgroundColor: '#fee2e2', border: `1px solid ${themeColors.error500}`, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: themeColors.error500,
      }}
      >
        {error}
      </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: themeSpace.xl }}>Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: themeSpace.xl, color: themeColors.gray600 }}>
          {items.length === 0 ? 'No merchants found' : 'No merchants match your filters'}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg }}>
            {paginatedItems.map((merchant) => (
              <div
                key={merchant.id}
                style={{
                  backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.sm, overflow: 'hidden',
                }}
              >
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
                   transition: 'background-color 0.2s',
                 }}
                >
                  <div style={{ flex: 1 }}>
                   <div style={{
                   fontSize: '16px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.sm,
                 }}
                 >
                   {merchant.name}
                 </div>
                   <div style={{
                   display: 'flex', gap: themeSpace.xl, fontSize: '13px', color: themeColors.gray600,
                 }}
                 >
                   <span>{merchant.contactName}</span>
                   <span>{merchant.email}</span>
                   <span>{merchant.phone}</span>
                   <span style={{
                   padding: `2px ${themeSpace.sm}`, backgroundColor: themeColors.info50, color: themeColors.info600, borderRadius: themeRadius.sm,
                 }}
                 >
                   {merchant.businessType}
                 </span>
                 </div>
                 </div>
                  <div style={{ display: 'flex', gap: themeSpace.md, alignItems: 'center' }}>
                   <button
                   onClick={(e) => { e.stopPropagation(); handleEdit(merchant); }}
                   style={{
  background: themeColors.info50, border: 'none', color: themeColors.info600, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}}
                 >
                   <Icon name="edit" size={16} color={themeColors.info600} />
                 </button>
                   <button
                   onClick={(e) => { e.stopPropagation(); handleDelete(merchant.id); }}
                   style={{
  background: '#fee2e2', border: 'none', color: themeColors.error500, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}}
                 >
                   <Icon name="delete" size={16} color={themeColors.error500} />
                 </button>
                   <Icon name={expandedMerchants.has(merchant.id) ? 'chevronDown' : 'chevronRight'} size={20} color={themeColors.gray600} />
                 </div>
                </div>

                {expandedMerchants.has(merchant.id) && (
                <div style={{ padding: themeSpace.lg, borderTop: `1px solid ${themeColors.gray200}`, backgroundColor: themeColors.gray50 }}>
                 <h4 style={{
                 fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.md, margin: 0,
               }}
               >
               Locations (
                 {merchant.locations?.length || 0}
                 )
             </h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
                 {(merchant.locations || []).map((location) => (
                 <div
                   key={location.id}
                   style={{
                   padding: themeSpace.md, backgroundColor: themeColors.white, borderRadius: themeRadius.sm, borderLeft: `3px solid ${themeColors.info600}`,
                 }}
                 >
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                   <div style={{
                   fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.xs,
                 }}
                 >
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: themeSpace.sm, marginTop: themeSpace.xl, padding: themeSpace.lg, backgroundColor: themeColors.white, borderRadius: themeRadius.card, boxShadow: themeShadow.xs,
          }}
          >
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              <Icon name="chevronLeft" size={16} />
              {' '}
              Prev
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
              Next
              {' '}
              <Icon name="chevronRight" size={16} />
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
        </>
      )}

      {showAddForm && (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, overflowY: 'auto', padding: `${themeSpace.xl} 0`,
      }}
      >
        <div style={{
          backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, width: '90%', maxWidth: '600px', boxShadow: themeShadow.md, margin: 'auto',
        }}
        >
          <h2 style={{
            fontSize: '20px', fontWeight: '700', color: themeColors.text, marginBottom: themeSpace.lg, margin: 0,
          }}
          >
            {editingId ? 'Edit' : 'Add New'}
            {' '}
            Merchant
          </h2>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: themeSpace.lg, marginBottom: themeSpace.xl, maxHeight: '60vh', overflowY: 'auto',
          }}
          >
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                Merchant Name
              </label>
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
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                Contact Name
              </label>
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
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                Email
              </label>
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
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                Phone
              </label>
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
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                Business Type
              </label>
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
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                HQ Address
              </label>
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
              <label
                htmlFor="singleLocation"
                style={{
                  fontSize: '14px', fontWeight: '500', color: themeColors.text, cursor: 'pointer',
                }}
              >
                Single Location Only
              </label>
            </div>

            {!newIsSingleLocation && (
            <div style={{
              padding: themeSpace.lg, backgroundColor: themeColors.info50, borderRadius: themeRadius.sm, borderLeft: `3px solid ${themeColors.info600}`,
            }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.md,
              }}
              >
                <h4 style={{
                 fontSize: '14px', fontWeight: '600', color: themeColors.text, margin: 0,
               }}
               >
             Additional Locations
               </h4>
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
              <div style={{
               marginBottom: themeSpace.md, padding: themeSpace.md, backgroundColor: themeColors.white, borderRadius: themeRadius.sm,
             }}
             >
               <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
               <div>
               <label style={{
                 fontSize: '12px', fontWeight: '600', color: themeColors.gray600, display: 'block', marginBottom: themeSpace.xs,
               }}
               >
           Location Name
               </label>
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
               <label style={{
                 fontSize: '12px', fontWeight: '600', color: themeColors.gray600, display: 'block', marginBottom: themeSpace.xs,
               }}
               >
           Location Address
               </label>
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
               <div
               key={location.id}
               style={{
                 padding: themeSpace.sm, backgroundColor: themeColors.white, borderRadius: themeRadius.sm, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
               }}
             >
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
    </PageLayout>
  );
}
