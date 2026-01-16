'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
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
  warning200: '#fed7aa',
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
    chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
       </svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>,
  };
  return icons[name] || null;
}

interface OfferItem {
  id: string;
  name: string;
  description: string;
  merchantId: string;
  merchantName: string;
  discountType: string;
  discountAmount: string;
  minimumSpend?: string;
  useType: 'one-time' | 'reusable';
  image?: string;
  barcode?: string;
}

interface Offer {
  id: string;
  merchantId: string;
  merchantName: string;
  items: OfferItem[];
}

export default function OffersPage() {
  const { data: session, status } = useSession();
  const _router = useRouter();
  const [merchants, setMerchants] = useState<any[]>([]);
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedOffers, setExpandedOffers] = useState<Set<string>>(new Set());

  // Filter state
  const [merchantFilter, setMerchantFilter] = useState('');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('');
  const [usageTypeFilter, setUsageTypeFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form states
  const [newMerchantId, setNewMerchantId] = useState('');
  const [newLocationId, setNewLocationId] = useState('');
  const [merchantLocations, setMerchantLocations] = useState<any[]>([]);
  const [newOfferName, setNewOfferName] = useState('');
  const [newOfferDescription, setNewOfferDescription] = useState('');
  const [newDiscountType, setNewDiscountType] = useState('');
  const [newDiscountAmount, setNewDiscountAmount] = useState('');
  const [newMinSpend, setNewMinSpend] = useState('');
  const [_newMinSpendType, setNewMinSpendType] = useState<'$' | '%'>('$');
  const [newUseType, setNewUseType] = useState<'one-time' | 'reusable'>('reusable');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newImageName, setNewImageName] = useState('');
  const [multipleOffers, setMultipleOffers] = useState(false);
  const [tempOffers, setTempOffers] = useState<OfferItem[]>([]);
  const [showAddMultiple, setShowAddMultiple] = useState(false);

  // Merchant search dropdown state
  const [merchantSearchTerm, setMerchantSearchTerm] = useState('');
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);

  // Edit state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [editOfferName, setEditOfferName] = useState('');
  const [editOfferDescription, setEditOfferDescription] = useState('');
  const [editDiscountType, setEditDiscountType] = useState('');
  const [editDiscountAmount, setEditDiscountAmount] = useState('');
  const [editMinSpend, setEditMinSpend] = useState('');
  const [editUseType, setEditUseType] = useState<'one-time' | 'reusable'>('reusable');

  const discountTypes = ['$', '%', 'BOGO', 'Free Item', 'Points', 'Buy One Get', '$ off when $ spent', '% off when $ spent'];
  const usageTypes = ['one-time', 'reusable'];

  // Map frontend discount types to backend enum values
  const mapDiscountType = (frontendType: string): string => {
    const mapping: Record<string, string> = {
      $: 'FIXED_AMOUNT',
      '%': 'PERCENTAGE',
      BOGO: 'BUY_ONE_GET_ONE',
      'Free Item': 'FREE_ITEM',
      Points: 'SPECIAL_PRICE',
      'Buy One Get': 'BUY_ONE_GET_ONE',
      '$ off when $ spent': 'FIXED_AMOUNT',
      '% off when $ spent': 'PERCENTAGE',
    };
    return mapping[frontendType] || 'FIXED_AMOUNT';
  };

  useEffect(() => {
    // Load data on mount, don't redirect if unauthenticated
    fetchMerchants();
    fetchData();
  }, []);

  const fetchMerchants = async () => {
    try {
      const data = await api.getMerchants(session);
      setMerchants(data.content || data || []);
    } catch (err) {
      console.error('Failed to load merchants', err);
    }
  };

  const handleMerchantChange = (merchantId: string) => {
    setNewMerchantId(merchantId);
    setNewLocationId(''); // Reset location when merchant changes

    if (merchantId) {
      // Find the selected merchant and get its locations
      const selectedMerchant = merchants.find((m: any) => String(m.id) === String(merchantId));
      if (selectedMerchant && selectedMerchant.locations) {
        setMerchantLocations(selectedMerchant.locations);
      } else {
        setMerchantLocations([]);
      }
    } else {
      setMerchantLocations([]);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getOffers(session);
      console.log('Raw offers data:', response);
      // Handle both old structure (with items property) and new flat structure
      // API returns { data: [...], pagination: {...} }
      let offersData = (response as any)?.data || (response as any)?.content || response || [];
      // Ensure offersData is always an array
      if (!Array.isArray(offersData)) {
        offersData = [];
      }
      console.log('Offers array:', offersData);
      console.log('Offers count:', offersData.length);
      // If offers are flat objects, transform them to the expected structure
      if (offersData.length > 0 && !offersData[0].items) {
        console.log('Transforming flat offers to grouped structure...');
        // Group offers by merchant - use Map to preserve insertion order and ensure unique keys
        const grouped = new Map<string, Offer>();
        offersData.forEach((offer: any) => {
          // Handle both API format (merchant object) and legacy format
          const merchantObj = offer.merchant || {};

          // Extract merchantId - prioritize the merchant object's id, then fallback to offer.merchantId
          let rawMerchantId: string | number;
          if (typeof merchantObj === 'object' && merchantObj.id !== undefined) {
            rawMerchantId = merchantObj.id;
          } else if (offer.merchantId !== undefined) {
            rawMerchantId = offer.merchantId;
          } else {
            rawMerchantId = 'unknown';
          }

          // Always convert to string for consistent grouping key
          const merchantId = String(rawMerchantId);

          // Extract merchant name - check offer.merchantName first, then merchant object fields
          let merchantName = 'Unknown';
          if (offer.merchantName) {
            merchantName = offer.merchantName;
          } else if (typeof merchantObj === 'object' && Object.keys(merchantObj).length > 0) {
            merchantName = merchantObj.business_name || merchantObj.businessName || merchantObj.name || 'Unknown';
          }

          if (!grouped.has(merchantId)) {
            grouped.set(merchantId, {
              id: merchantId,
              merchantId,
              merchantName,
              items: [],
            });
          }

          const group = grouped.get(merchantId)!;
          group.items.push({
            id: String(offer.id),
            name: offer.title || offer.name,
            description: offer.description,
            merchantId,
            merchantName: group.merchantName, // Use the group's merchantName for consistency
            discountType: offer.discountType || offer.discount,
            discountAmount: String(offer.discountValue || offer.value || ''),
            useType: (offer.usage_type === 'LIMITED' ? 'one-time' : 'reusable') as 'one-time' | 'reusable',
            image: offer.imageUrl || offer.image,
            barcode: offer.imageUrl || offer.barcode,
          });
        });
        offersData = Array.from(grouped.values());
        console.log('Grouped offers:', offersData);
      }
      console.log('Final offers state:', offersData);
      setItems(offersData);
    } catch (err) {
      console.error('Error loading offers:', err);
      setError('Failed to load offers');
      setItems([]); // Ensure items is set to empty array on error
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingleOffer = async (offerId: string, merchantId: string) => {
    if (!confirm('Delete this offer?')) return;
    try {
      // Call API to delete the offer
      await api.deleteOffer(offerId, session);

      // Update local state - remove the offer from the merchant group
      const updatedItems = items.map((group) => {
        if (String(group.merchantId) === String(merchantId)) {
          const updatedOffers = group.items.filter((item) => String(item.id) !== String(offerId));
          // If no offers left in group, return null to filter it out
          if (updatedOffers.length === 0) {
            return null;
          }
          return { ...group, items: updatedOffers };
        }
        return group;
      }).filter((group): group is Offer => group !== null);

      setItems(updatedItems);
    } catch (err) {
      console.error('Failed to delete offer:', err);
      setError('Failed to delete offer');
    }
  };

  const handleDeleteMerchantOffers = async (merchantId: string) => {
    const merchantGroup = items.find((g) => String(g.merchantId) === String(merchantId));
    if (!merchantGroup) return;

    const offerCount = merchantGroup.items.length;
    if (!confirm(`Delete all ${offerCount} offer${offerCount !== 1 ? 's' : ''} for ${merchantGroup.merchantName}?`)) return;

    try {
      // Delete all offers in the merchant group via API
      for (const offer of merchantGroup.items) {
        await api.deleteOffer(String(offer.id), session);
      }

      // Update local state - remove the entire merchant group
      setItems(items.filter((i) => String(i.merchantId) !== String(merchantId)));
    } catch (err) {
      console.error('Failed to delete offers:', err);
      setError('Failed to delete offers');
    }
  };

  const toggleOfferExpand = (merchantId: string) => {
    const newExpanded = new Set(expandedOffers);
    if (newExpanded.has(merchantId)) {
      newExpanded.delete(merchantId);
    } else {
      newExpanded.add(merchantId);
    }
    setExpandedOffers(newExpanded);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
        setNewImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSingleOffer = async () => {
    if (!newMerchantId || !newOfferName.trim() || !newDiscountType || !newDiscountAmount.trim()) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const newOfferItem: OfferItem = {
        id: Date.now().toString(),
        name: newOfferName,
        description: newOfferDescription,
        merchantId: newMerchantId,
        merchantName: merchants.find((m) => m.id === newMerchantId)?.name || '',
        discountType: newDiscountType,
        discountAmount: newDiscountAmount,
        minimumSpend: newMinSpend || undefined,
        useType: newUseType,
        image: newImage || undefined,
        barcode: newImage || undefined,
      };

      if (!multipleOffers) {
        // Set default dates: start now, expire in 1 year
        const now = new Date();
        const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

        const offerData: any = {
          merchantId: newMerchantId,
          title: newOfferName,
          description: newOfferDescription,
          discountType: mapDiscountType(newDiscountType),
          discountValue: parseFloat(newDiscountAmount) || 0,
          validFrom: now.toISOString(),
          validUntil: oneYearFromNow.toISOString(),
        };

        // Add location if selected
        if (newLocationId) {
          offerData.merchantLocationId = newLocationId;
          offerData.locationSpecific = true;
        }

        // Add minimum spend threshold for "X off when Y spent" discount types
        if ((newDiscountType === '$ off when $ spent' || newDiscountType === '% off when $ spent') && newMinSpend) {
          offerData.minPurchaseAmount = parseFloat(newMinSpend) || 0;
        }

        console.log('[PAGE] Creating offer:', offerData);
        const createdOffer = await api.createOffer(offerData, session);
        console.log('[PAGE] Offer created successfully:', createdOffer);

        // Add to local state immediately
        if (createdOffer) {
          // Use merchantName from API response, fallback to looking up in merchants list
          const merchantName = createdOffer.merchantName
            || merchants.find((m) => String(m.id) === String(newMerchantId))?.businessName
            || merchants.find((m) => String(m.id) === String(newMerchantId))?.name
            || '';
          // Normalize merchantId to string for consistent comparison
          const groupKey = String(createdOffer.merchantId || newMerchantId);

          // Build the new offer item from API response
          const newOfferItemFromApi: OfferItem = {
            id: String(createdOffer.id || Date.now()),
            name: createdOffer.title || newOfferName,
            description: createdOffer.description || newOfferDescription,
            merchantId: groupKey,
            merchantName,
            discountType: createdOffer.discountType || newDiscountType,
            discountAmount: String(createdOffer.discountValue || newDiscountAmount),
            useType: 'reusable',
            image: createdOffer.imageUrl,
            barcode: createdOffer.imageUrl,
          };

          // Check if merchant group exists (compare as strings)
          const existingGroupIndex = items.findIndex((g) => String(g.merchantId) === groupKey);

          if (existingGroupIndex >= 0) {
            // Add to existing merchant group
            const updatedItems = [...items];
            updatedItems[existingGroupIndex] = {
              ...updatedItems[existingGroupIndex],
              items: [...updatedItems[existingGroupIndex].items, newOfferItemFromApi],
            };
            setItems(updatedItems);
          } else {
            // Create new merchant group
            const newGroup: Offer = {
              id: groupKey,
              merchantId: groupKey,
              merchantName,
              items: [newOfferItemFromApi],
            };
            setItems([...items, newGroup]);
          }
        }

        // Don't refresh data - keep the optimistically added item
        resetForm();
        setShowAddForm(false);
      } else {
        setTempOffers([...tempOffers, newOfferItem]);
        setNewOfferName('');
        setNewOfferDescription('');
        setNewDiscountType('');
        setNewDiscountAmount('');
        setNewMinSpend('');
        setNewUseType('reusable');
        setNewImage(null);
        setNewImageName('');
        setShowAddMultiple(false);
      }
    } catch (err) {
      setError(`Failed to create offer: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[PAGE] Error:', err);
    }
  };

  const deleteFromTemp = (offerId: string) => {
    setTempOffers(tempOffers.filter((o) => o.id !== offerId));
  };

  const finalizMultipleOffers = async () => {
    if (tempOffers.length === 0) {
      setError('Please add at least one offer');
      return;
    }

    try {
      const createdOffers: any[] = [];
      // Set default dates: start now, expire in 1 year
      const now = new Date();
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      // Submit each offer to the API
      for (const offer of tempOffers) {
        const offerData: any = {
          merchantId: newMerchantId,
          title: offer.name,
          description: offer.description,
          discountType: mapDiscountType(offer.discountType),
          discountValue: parseFloat(offer.discountAmount) || 0,
          validFrom: now.toISOString(),
          validUntil: oneYearFromNow.toISOString(),
        };
        // Add minimum spend threshold for "X off when Y spent" discount types
        if ((offer.discountType === '$ off when $ spent' || offer.discountType === '% off when $ spent') && offer.minimumSpend) {
          offerData.minPurchaseAmount = parseFloat(offer.minimumSpend) || 0;
        }
        console.log('[PAGE] Creating offer:', offerData);
        const createdOffer = await api.createOffer(offerData, session);
        createdOffers.push(createdOffer);
      }

      console.log('[PAGE] All offers created successfully:', createdOffers);

      // Add all offers to local state immediately
      if (createdOffers.length > 0) {
        // Use merchantName from first API response, fallback to looking up in merchants list
        const firstOffer = createdOffers[0];
        const merchantName = firstOffer?.merchantName
          || merchants.find((m) => String(m.id) === String(newMerchantId))?.businessName
          || merchants.find((m) => String(m.id) === String(newMerchantId))?.name
          || '';
        // Normalize merchantId to string for consistent comparison
        const groupKey = String(firstOffer?.merchantId || newMerchantId);

        const mappedOffers: OfferItem[] = createdOffers.map((offer) => ({
          id: String(offer.id || Date.now()),
          name: offer.title || offer.name,
          description: offer.description,
          merchantId: groupKey,
          merchantName,
          discountType: offer.discountType,
          discountAmount: String(offer.discountValue),
          useType: 'reusable' as const,
          image: offer.imageUrl,
          barcode: offer.imageUrl,
        }));

        // Check if merchant group exists (compare as strings)
        const existingGroupIndex = items.findIndex((g) => String(g.merchantId) === groupKey);

        if (existingGroupIndex >= 0) {
          // Add to existing merchant group
          const updatedItems = [...items];
          updatedItems[existingGroupIndex] = {
            ...updatedItems[existingGroupIndex],
            items: [...updatedItems[existingGroupIndex].items, ...mappedOffers],
          };
          setItems(updatedItems);
        } else {
          // Create new merchant group
          const newGroup: Offer = {
            id: groupKey,
            merchantId: groupKey,
            merchantName,
            items: mappedOffers,
          };
          setItems([...items, newGroup]);
        }
      }

      // Don't refresh data - keep the optimistically added items
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      setError(`Failed to create offers: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[PAGE] Error:', err);
    }
  };

  const resetForm = () => {
    setNewMerchantId('');
    setNewLocationId('');
    setMerchantLocations([]);
    setNewOfferName('');
    setNewOfferDescription('');
    setNewDiscountType('');
    setNewDiscountAmount('');
    setNewMinSpend('');
    setNewMinSpendType('$');
    setNewUseType('reusable');
    setNewImage(null);
    setNewImageName('');
    setMultipleOffers(false);
    setTempOffers([]);
    setShowAddMultiple(false);
    setMerchantSearchTerm('');
    setShowMerchantDropdown(false);
    setError(null);
  };

  // Filter merchants based on search term
  const filteredMerchants = useMemo(() => {
    if (!merchantSearchTerm.trim()) return merchants;
    const search = merchantSearchTerm.toLowerCase();
    return merchants.filter((merchant: any) => {
      const name = (merchant.businessName || merchant.name || '').toLowerCase();
      return name.includes(search);
    });
  }, [merchants, merchantSearchTerm]);

  // Get selected merchant name for display
  const selectedMerchantName = useMemo(() => {
    if (!newMerchantId) return '';
    const merchant = merchants.find((m: any) => String(m.id) === String(newMerchantId));
    return merchant?.businessName || merchant?.name || '';
  }, [merchants, newMerchantId]);

  const openEditForm = (offer: OfferItem) => {
    setEditingOffer(offer);
    setEditOfferName(offer.name || '');
    setEditOfferDescription(offer.description || '');
    setEditDiscountType(offer.discountType || '');
    setEditDiscountAmount(offer.discountAmount || '');
    setEditMinSpend(offer.minimumSpend || '');
    setEditUseType(offer.useType || 'reusable');
    setShowEditForm(true);
    setError(null);
  };

  const handleEditOffer = async () => {
    if (!editingOffer) return;

    if (!editOfferName.trim() || !editDiscountType || !editDiscountAmount.trim()) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const now = new Date();
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      const offerData: any = {
        title: editOfferName,
        description: editOfferDescription,
        discountType: mapDiscountType(editDiscountType),
        discountValue: parseFloat(editDiscountAmount) || 0,
        validFrom: now.toISOString(),
        validUntil: oneYearFromNow.toISOString(),
      };

      // Add minimum spend threshold for "X off when Y spent" discount types
      if ((editDiscountType === '$ off when $ spent' || editDiscountType === '% off when $ spent') && editMinSpend) {
        offerData.minPurchaseAmount = parseFloat(editMinSpend) || 0;
      }

      console.log('[PAGE] Updating offer:', editingOffer.id, offerData);
      await api.updateOffer(editingOffer.id, offerData, session);
      console.log('[PAGE] Offer updated successfully');

      // Update local state
      setItems(items.map((group) => ({
        ...group,
        items: group.items.map((item) => (item.id === editingOffer.id
          ? {
            ...item,
            name: editOfferName,
            description: editOfferDescription,
            discountType: editDiscountType,
            discountAmount: editDiscountAmount,
            minimumSpend: editMinSpend || undefined,
            useType: editUseType,
          }
          : item)),
      })));

      setShowEditForm(false);
      setEditingOffer(null);
      setError(null);
    } catch (err) {
      setError(`Failed to update offer: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[PAGE] Error:', err);
    }
  };

  const filteredItems = (Array.isArray(items) ? items : []).filter((item) => {
    const matchesSearch = searchTerm === ''
 || item.merchantName?.toLowerCase().includes(searchTerm.toLowerCase())
 || item.items?.some((offer: OfferItem) => offer.name?.toLowerCase().includes(searchTerm.toLowerCase())
 || offer.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMerchant = merchantFilter === '' || item.merchantId === merchantFilter;
    const matchesDiscountType = discountTypeFilter === ''
 || item.items?.some((offer: OfferItem) => offer.discountType === discountTypeFilter);
    const matchesUsageType = usageTypeFilter === ''
 || item.items?.some((offer: OfferItem) => offer.useType === usageTypeFilter);
    return matchesSearch && matchesMerchant && matchesDiscountType && matchesUsageType;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, merchantFilter, discountTypeFilter, usageTypeFilter]);

  // Get unique merchants for filter dropdown
  const uniqueMerchants = useMemo(() => {
    const merchantMap = new Map<string, string>();
    items.forEach((item) => {
      if (item.merchantId && item.merchantName) {
        merchantMap.set(item.merchantId, item.merchantName);
      }
    });
    return Array.from(merchantMap.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  const clearFilters = () => {
    setSearchTerm('');
    setMerchantFilter('');
    setDiscountTypeFilter('');
    setUsageTypeFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== '' || merchantFilter !== '' || discountTypeFilter !== '' || usageTypeFilter !== '';

  if (status === 'loading') return null;

  return (
    <PageLayout title="Offers" currentPath="/offers">
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg,
        }}
        >
          <span style={{ fontSize: '14px', color: themeColors.gray500 }}>
            Showing
            {' '}
            {startIndex + 1}
            -
            {Math.min(endIndex, filteredItems.length)}
            {' '}
            of
            {filteredItems.length}
            {' '}
            merchants
          </span>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: themeColors.primary600, color: themeColors.white, border: 'none', padding: `${themeSpace.sm} ${themeSpace.lg}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', gap: themeSpace.sm, alignItems: 'center',
            }}
          >
            <Icon name="add" size={18} color={themeColors.white} />
            Add Offer
          </button>
        </div>

        <div style={{
          display: 'flex', gap: themeSpace.md, flexWrap: 'wrap', alignItems: 'center',
        }}
        >
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <div style={{ position: 'absolute', left: themeSpace.md, top: '12px' }}>
              <Icon name="search" size={18} color={themeColors.gray500} />
            </div>
            <input
              type="text"
              placeholder="Search offers..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.sm }}>
            <Icon name="filter" size={16} color={themeColors.gray500} />
          </div>

          <select
            value={merchantFilter}
            onChange={(e) => setMerchantFilter(e.target.value)}
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
            <option value="">All Merchants</option>
            {uniqueMerchants.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>{merchant.name}</option>
            ))}
          </select>

          <select
            value={discountTypeFilter}
            onChange={(e) => setDiscountTypeFilter(e.target.value)}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`,
              border: `1px solid ${themeColors.gray200}`,
              borderRadius: themeRadius.sm,
              fontSize: '14px',
              backgroundColor: themeColors.white,
              cursor: 'pointer',
              minWidth: '130px',
            }}
          >
            <option value="">All Types</option>
            {discountTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={usageTypeFilter}
            onChange={(e) => setUsageTypeFilter(e.target.value)}
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
            <option value="">All Usage</option>
            <option value="one-time">One-Time</option>
            <option value="reusable">Reusable</option>
          </select>

          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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

          {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`,
              border: `1px solid ${themeColors.error400}`,
              borderRadius: themeRadius.sm,
              fontSize: '14px',
              backgroundColor: themeColors.white,
              color: themeColors.error500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: themeSpace.xs,
            }}
          >
            <Icon name="x" size={14} color={themeColors.error500} />
            Clear
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
      ) : paginatedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: themeSpace.xl, color: themeColors.gray600 }}>No offers found</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg }}>
            {paginatedItems.map((offer) => (
              <div
                key={offer.id}
                style={{
                  backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.sm, overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => toggleOfferExpand(offer.merchantId)}
                  style={{
                   padding: themeSpace.lg,
                   cursor: 'pointer',
                   backgroundColor: expandedOffers.has(offer.merchantId) ? themeColors.warning50 : themeColors.white,
                   borderLeft: `4px solid ${themeColors.warning600}`,
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
                   {offer.merchantName}
                 </div>
                   <div style={{ fontSize: '13px', color: themeColors.gray600 }}>
                   {offer.items.length}
                   {' '}
                   offer
{offer.items.length !== 1 ? 's' : ''}
                 </div>
                 </div>
                  <div style={{ display: 'flex', gap: themeSpace.md, alignItems: 'center' }}>
                   <button
                   onClick={(e) => { e.stopPropagation(); handleDeleteMerchantOffers(offer.merchantId); }}
                   style={{
  background: '#fee2e2', border: 'none', color: themeColors.error500, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}}
                 >
                   <Icon name="delete" size={16} color={themeColors.error500} />
                 </button>
                   <Icon name={expandedOffers.has(offer.merchantId) ? 'chevronDown' : 'chevronRight'} size={20} color={themeColors.gray600} />
                 </div>
                </div>

                {expandedOffers.has(offer.merchantId) && (
                <div style={{ padding: themeSpace.lg, borderTop: `1px solid ${themeColors.gray200}`, backgroundColor: themeColors.gray50 }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
                 {(offer.items || []).map((item) => (
                 <div
                   key={item.id}
                   style={{
                   padding: themeSpace.lg, backgroundColor: themeColors.white, borderRadius: themeRadius.sm, borderLeft: `3px solid ${themeColors.warning600}`,
                 }}
                 >
                   <div style={{
                   display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: themeSpace.md,
                 }}
                 >
                   <div style={{ flex: 1 }}>
                   <div style={{
                   fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.xs,
                 }}
                 >
                   {item.name}
                 </div>
                   <div style={{ fontSize: '13px', color: themeColors.gray600, marginBottom: themeSpace.sm }}>
                   {item.description}
                 </div>
                   <div style={{ display: 'flex', gap: themeSpace.md, flexWrap: 'wrap' }}>
                   <span style={{
                   padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: themeColors.info50, color: themeColors.info600, borderRadius: themeRadius.sm, fontSize: '11px', fontWeight: '600',
                 }}
                 >
                   {item.discountAmount}
                   {' '}
                   {item.discountType}
                 </span>
                   <span style={{
                   padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: themeColors.success50, color: themeColors.success600, borderRadius: themeRadius.sm, fontSize: '11px', fontWeight: '600',
                 }}
                 >
                   {item.useType === 'one-time' ? 'One-Time' : 'Reusable'}
                 </span>
                 </div>
                 </div>
                   <div style={{ display: 'flex', gap: themeSpace.sm, alignItems: 'flex-start' }}>
                     <button
                       onClick={() => openEditForm(item)}
                       style={{
                         background: themeColors.info50,
                         border: 'none',
                         color: themeColors.info600,
                         width: '28px',
                         height: '28px',
                         borderRadius: themeRadius.sm,
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                       }}
                       title="Edit offer"
                     >
                       <Icon name="edit" size={14} color={themeColors.info600} />
                     </button>
                     <button
                       onClick={() => handleDeleteSingleOffer(item.id, offer.merchantId)}
                       style={{
                         background: '#fee2e2',
                         border: 'none',
                         color: themeColors.error500,
                         width: '28px',
                         height: '28px',
                         borderRadius: themeRadius.sm,
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                       }}
                       title="Delete offer"
                     >
                       <Icon name="delete" size={14} color={themeColors.error500} />
                     </button>
                   </div>
                   {item.image && (
                 <div style={{ marginLeft: themeSpace.lg, textAlign: 'center' }}>
                 <img
                 src={item.image}
                 alt="Offer barcode"
                 style={{
                 maxWidth: '100px', maxHeight: '100px', borderRadius: themeRadius.sm, border: `1px solid ${themeColors.gray200}`,
               }}
               />
               </div>
                 )}
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
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: themeSpace.sm, marginTop: themeSpace.xl, padding: themeSpace.lg, backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`,
          }}
          >
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`,
                border: `1px solid ${themeColors.gray200}`,
                borderRadius: themeRadius.sm,
                backgroundColor: currentPage === 1 ? themeColors.gray100 : themeColors.white,
                color: currentPage === 1 ? themeColors.gray500 : themeColors.text,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`,
                border: `1px solid ${themeColors.gray200}`,
                borderRadius: themeRadius.sm,
                backgroundColor: currentPage === 1 ? themeColors.gray100 : themeColors.white,
                color: currentPage === 1 ? themeColors.gray500 : themeColors.text,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: themeSpace.xs,
              }}
            >
              <Icon name="chevronLeft" size={16} />
              Prev
            </button>

            {(() => {
              const pages = [];
              let startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(totalPages, startPage + 4);
              if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
              }
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                   key={i}
                   onClick={() => setCurrentPage(i)}
                   style={{
                   padding: `${themeSpace.sm} ${themeSpace.md}`,
                   border: `1px solid ${currentPage === i ? themeColors.primary600 : themeColors.gray200}`,
                   borderRadius: themeRadius.sm,
                   backgroundColor: currentPage === i ? themeColors.primary100 : themeColors.white,
                   color: currentPage === i ? themeColors.primary600 : themeColors.text,
                   cursor: 'pointer',
                   fontSize: '14px',
                   fontWeight: currentPage === i ? '600' : '400',
                   minWidth: '40px',
                 }}
                 >
                   {i}
                 </button>,
                );
              }
              return pages;
            })()}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`,
                border: `1px solid ${themeColors.gray200}`,
                borderRadius: themeRadius.sm,
                backgroundColor: currentPage === totalPages ? themeColors.gray100 : themeColors.white,
                color: currentPage === totalPages ? themeColors.gray500 : themeColors.text,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: themeSpace.xs,
              }}
            >
              Next
              <Icon name="chevronRight" size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`,
                border: `1px solid ${themeColors.gray200}`,
                borderRadius: themeRadius.sm,
                backgroundColor: currentPage === totalPages ? themeColors.gray100 : themeColors.white,
                color: currentPage === totalPages ? themeColors.gray500 : themeColors.text,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
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
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: `${themeSpace.xl} 0`,
      }}
      >
        <div style={{
          backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, width: '90%', maxWidth: '650px', boxShadow: themeShadow.md, margin: 'auto',
        }}
        >
          <h2 style={{
            fontSize: '20px', fontWeight: '700', color: themeColors.text, marginBottom: themeSpace.lg, margin: 0,
          }}
          >
            Add New Offer
          </h2>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: themeSpace.lg, marginBottom: themeSpace.xl, maxHeight: '70vh', overflowY: 'auto',
          }}
          >
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                Associated Merchant
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => !tempOffers.length && setShowMerchantDropdown(!showMerchantDropdown)}
                  style={{
                    width: '100%',
                    padding: `${themeSpace.sm} ${themeSpace.md}`,
                    border: `1px solid ${showMerchantDropdown ? themeColors.primary600 : themeColors.gray200}`,
                    borderRadius: themeRadius.sm,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: tempOffers.length > 0 ? themeColors.gray100 : themeColors.white,
                    cursor: tempOffers.length > 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: newMerchantId ? themeColors.text : themeColors.gray500 }}>
                    {selectedMerchantName || 'Select a merchant'}
                  </span>
                  <Icon name="chevronDown" size={16} color={themeColors.gray500} />
                </div>

                {showMerchantDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: themeColors.white,
                      border: `1px solid ${themeColors.gray200}`,
                      borderRadius: themeRadius.sm,
                      boxShadow: themeShadow.md,
                      zIndex: 1000,
                      maxHeight: '250px',
                      overflowY: 'auto',
                    }}
                  >
                    <div style={{ padding: themeSpace.sm, borderBottom: `1px solid ${themeColors.gray200}` }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: themeSpace.sm, top: '50%', transform: 'translateY(-50%)' }}>
                          <Icon name="search" size={16} color={themeColors.gray500} />
                        </div>
                        <input
                          type="text"
                          placeholder="Search merchants..."
                          value={merchantSearchTerm}
                          onChange={(e) => setMerchantSearchTerm(e.target.value)}
                          autoFocus
                          style={{
                            width: '100%',
                            padding: `${themeSpace.sm} ${themeSpace.sm} ${themeSpace.sm} ${themeSpace.xl}`,
                            border: `1px solid ${themeColors.gray200}`,
                            borderRadius: themeRadius.sm,
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                    {filteredMerchants.length === 0 ? (
                      <div style={{ padding: themeSpace.md, textAlign: 'center', color: themeColors.gray500, fontSize: '14px' }}>
                        No merchants found
                      </div>
                    ) : (
                      filteredMerchants.map((merchant: any) => (
                        <div
                          key={merchant.id}
                          onClick={() => {
                            handleMerchantChange(String(merchant.id));
                            setShowMerchantDropdown(false);
                            setMerchantSearchTerm('');
                          }}
                          style={{
                            padding: `${themeSpace.sm} ${themeSpace.md}`,
                            cursor: 'pointer',
                            backgroundColor: String(merchant.id) === String(newMerchantId) ? themeColors.primary50 : 'transparent',
                            borderLeft: String(merchant.id) === String(newMerchantId) ? `3px solid ${themeColors.primary600}` : '3px solid transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (String(merchant.id) !== String(newMerchantId)) {
                              e.currentTarget.style.backgroundColor = themeColors.gray50;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (String(merchant.id) !== String(newMerchantId)) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <div style={{ fontSize: '14px', color: themeColors.text }}>
                            {merchant.businessName || merchant.name}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {newMerchantId && (
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                Location (Optional)
              </label>
              <select
                value={newLocationId}
                onChange={(e) => setNewLocationId(e.target.value)}
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
                <option value="">All Locations</option>
                {merchantLocations.map((location: any) => (
                  <option key={location.id || location.uuid} value={location.id || location.uuid}>
                    {location.locationName || location.name} - {location.city}, {location.state}
                  </option>
                ))}
              </select>
              {merchantLocations.length === 0 && (
                <p style={{ fontSize: '12px', color: themeColors.gray500, marginTop: themeSpace.xs }}>
                  No locations found for this merchant
                </p>
              )}
            </div>
            )}

            {multipleOffers && tempOffers.length > 0 && (
            <div style={{
              padding: themeSpace.lg, backgroundColor: themeColors.warning50, borderRadius: themeRadius.sm, borderLeft: `3px solid ${themeColors.warning600}`,
            }}
            >
              <h4 style={{
                fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.md, margin: 0,
              }}
              >
           Offers to Add (
                {tempOffers.length}
                )
         </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.sm }}>
                {tempOffers.map((o) => (
                 <div
                 key={o.id}
                 style={{
                 padding: themeSpace.sm, backgroundColor: themeColors.white, borderRadius: themeRadius.sm, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
               }}
               >
                 <div style={{ flex: 1 }}>
                 <div style={{ fontSize: '12px', fontWeight: '600', color: themeColors.text }}>
                   {o.name}
                 </div>
                 <div style={{ fontSize: '11px', color: themeColors.gray600 }}>
                   {o.discountAmount}
                   {' '}
                   {o.discountType}
                   {' '}
                   {o.useType === 'one-time' ? 'One-Time' : 'Reusable'}
                 </div>
               </div>
                 <button
                 onClick={() => deleteFromTemp(o.id)}
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
            </div>
            )}

            {!multipleOffers || showAddMultiple ? (
              <>
                <div>
                  <label style={{
                   display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                 }}
                 >
Offer Name
                 </label>
                  <input
                   type="text"
                   value={newOfferName}
                   onChange={(e) => setNewOfferName(e.target.value)}
                   placeholder="e.g., 20% Off Winter Clothes"
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
Offer Description
                 </label>
                  <textarea
                   value={newOfferDescription}
                   onChange={(e) => setNewOfferDescription(e.target.value)}
                   placeholder="Describe the offer details..."
                   style={{
                   width: '100%',
                   padding: `${themeSpace.sm} ${themeSpace.md}`,
                   border: `1px solid ${themeColors.gray200}`,
                   borderRadius: themeRadius.sm,
                   fontSize: '14px',
                   boxSizing: 'border-box',
                   minHeight: '80px',
                   fontFamily: 'inherit',
                 }}
                 />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: themeSpace.lg }}>
                  <div>
                   <label style={{
                   display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                 }}
                 >
Discount Type
                 </label>
                   <select
                   value={newDiscountType}
                   onChange={(e) => setNewDiscountType(e.target.value)}
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
                   <option value="">Select type</option>
                   {discountTypes.map((type) => (
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
Discount Amount
                 </label>
                   <input
                   type="text"
                   value={newDiscountAmount}
                   onChange={(e) => setNewDiscountAmount(e.target.value)}
                   placeholder="e.g., 20, 100, etc"
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
                </div>

                {(newDiscountType === '$ off when $ spent' || newDiscountType === '% off when $ spent') && (
                <div>
                  <label style={{
                    display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                  }}
                  >
                    Minimum Spend Amount ($)
                  </label>
                  <input
                    type="number"
                    value={newMinSpend}
                    onChange={(e) => setNewMinSpend(e.target.value)}
                    placeholder="e.g., 50, 100, etc"
                    style={{
                      width: '100%',
                      padding: `${themeSpace.sm} ${themeSpace.md}`,
                      border: `1px solid ${themeColors.gray200}`,
                      borderRadius: themeRadius.sm,
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <p style={{ fontSize: '12px', color: themeColors.gray500, marginTop: themeSpace.xs }}>
                    Customer must spend at least this amount to receive the discount
                  </p>
                </div>
                )}

                <div>
                  <label style={{
                   display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                 }}
                 >
Usage Type
                 </label>
                  <div style={{ display: 'flex', gap: themeSpace.lg }}>
                   {usageTypes.map((type) => (
                   <label
                   key={type}
style={{
                   display: 'flex', alignItems: 'center', gap: themeSpace.sm, cursor: 'pointer',
                 }}
                 >
                   <input
                     type="radio"
                     name="useType"
                     value={type}
                     checked={newUseType === type}
                     onChange={(e) => setNewUseType(e.target.value as 'one-time' | 'reusable')}
                     style={{ cursor: 'pointer' }}
                   />
                   <span style={{ fontSize: '14px', fontWeight: '500', color: themeColors.text }}>
                     {type === 'one-time' ? 'One-Time Use' : 'Reusable'}
                   </span>
                 </label>
                 ))}
                 </div>
                </div>

                <div>
                  <label style={{
                   display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                 }}
                 >
Upload Image / Barcode
                 </label>
                  <div style={{
                   border: `2px dashed ${themeColors.gray200}`, borderRadius: themeRadius.sm, padding: themeSpace.lg, textAlign: 'center', cursor: 'pointer', backgroundColor: themeColors.gray50, transition: 'border-color 0.2s',
                 }}
                 >
                   <input
                   type="file"
                   accept="image/*"
                   onChange={handleImageUpload}
                   style={{ display: 'none' }}
                   id="imageUpload"
                 />
                   <label htmlFor="imageUpload" style={{ display: 'block', cursor: 'pointer' }}>
                   <Icon name="upload" size={32} color={themeColors.primary600} />
                   <div style={{
                   fontSize: '14px', fontWeight: '500', color: themeColors.text, marginTop: themeSpace.sm,
                 }}
                 >
                   {newImageName || 'Click to upload image or barcode'}
                 </div>
                   <div style={{ fontSize: '12px', color: themeColors.gray600, marginTop: themeSpace.xs }}>
                   PNG, JPG, GIF up to 10MB
                 </div>
                 </label>
                 </div>
                  {newImage && (
                 <div style={{ marginTop: themeSpace.md, textAlign: 'center' }}>
                 <img
                 src={newImage}
                 alt="Preview"
                 style={{
                   maxWidth: '150px', maxHeight: '150px', borderRadius: themeRadius.sm, border: `1px solid ${themeColors.gray200}`,
                 }}
               />
                 <button
                 onClick={() => { setNewImage(null); setNewImageName(''); }}
                 style={{
                   marginTop: themeSpace.sm,
                   background: 'none',
                   border: `1px solid ${themeColors.error500}`,
                   color: themeColors.error500,
                   padding: `${themeSpace.xs} ${themeSpace.sm}`,
                   borderRadius: themeRadius.sm,
                   cursor: 'pointer',
                   fontSize: '12px',
                   fontWeight: '500',
                 }}
               >
                 Remove Image
               </button>
               </div>
                 )}
                </div>
              </>
            ) : null}

            {!multipleOffers || showAddMultiple ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: themeSpace.md, padding: themeSpace.lg, backgroundColor: themeColors.info50, borderRadius: themeRadius.sm, borderLeft: `3px solid ${themeColors.info600}`,
              }}
              >
                <input
                  type="checkbox"
                  id="multipleOffers"
                  checked={multipleOffers}
                  onChange={(e) => {
                   setMultipleOffers(e.target.checked);
                   if (!e.target.checked) {
                     setTempOffers([]);
                     setShowAddMultiple(false);
                   }
                 }}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
                <label
                  htmlFor="multipleOffers"
                  style={{
                   fontSize: '14px', fontWeight: '500', color: themeColors.text, cursor: 'pointer', flex: 1,
                 }}
                >
             Add Multiple Offers for This Merchant
                </label>
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', gap: themeSpace.md, justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
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

            {multipleOffers && tempOffers.length > 0 ? (
              <>
                <button
                  onClick={() => {
                   if (!showAddMultiple) {
                     setShowAddMultiple(true);
                   } else {
                     addSingleOffer();
                   }
                 }}
                  style={{
                   padding: `${themeSpace.sm} ${themeSpace.lg}`,
                   background: themeColors.warning600,
                   color: themeColors.white,
                   border: 'none',
                   borderRadius: themeRadius.sm,
                   cursor: 'pointer',
                   fontSize: '14px',
                   fontWeight: '500',
                 }}
                >
                  {showAddMultiple ? 'Add Offer' : 'Add Another Offer'}
                </button>
                <button
                  onClick={finalizMultipleOffers}
                  style={{
                   padding: `${themeSpace.sm} ${themeSpace.lg}`,
                   background: themeColors.success600,
                   color: themeColors.white,
                   border: 'none',
                   borderRadius: themeRadius.sm,
                   cursor: 'pointer',
                   fontSize: '14px',
                   fontWeight: '500',
                 }}
                >
             Save All Offers
                </button>
              </>
            ) : (
              <button
                onClick={addSingleOffer}
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
           Create Offer
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Edit Offer Modal */}
      {showEditForm && editingOffer && (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: `${themeSpace.xl} 0`,
      }}
      >
        <div style={{
          backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, width: '90%', maxWidth: '550px', boxShadow: themeShadow.md, margin: 'auto',
        }}
        >
          <h2 style={{
            fontSize: '20px', fontWeight: '700', color: themeColors.text, marginBottom: themeSpace.lg, margin: 0,
          }}
          >
            Edit Offer
          </h2>

          {error && (
          <div style={{
            backgroundColor: '#fee2e2', border: `1px solid ${themeColors.error500}`, borderRadius: themeRadius.sm, padding: themeSpace.md, marginBottom: themeSpace.lg, color: themeColors.error500, fontSize: '14px',
          }}
          >
            {error}
          </div>
          )}

          <div style={{
            display: 'flex', flexDirection: 'column', gap: themeSpace.lg, marginBottom: themeSpace.xl,
          }}
          >
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                Offer Name
              </label>
              <input
                type="text"
                value={editOfferName}
                onChange={(e) => setEditOfferName(e.target.value)}
                placeholder="e.g., 20% Off Winter Clothes"
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
                Offer Description
              </label>
              <textarea
                value={editOfferDescription}
                onChange={(e) => setEditOfferDescription(e.target.value)}
                placeholder="Describe the offer details..."
                style={{
                  width: '100%',
                  padding: `${themeSpace.sm} ${themeSpace.md}`,
                  border: `1px solid ${themeColors.gray200}`,
                  borderRadius: themeRadius.sm,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  minHeight: '80px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: themeSpace.lg }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                }}
                >
                  Discount Type
                </label>
                <select
                  value={editDiscountType}
                  onChange={(e) => setEditDiscountType(e.target.value)}
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
                  <option value="">Select type</option>
                  {discountTypes.map((type) => (
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
                  Discount Amount
                </label>
                <input
                  type="text"
                  value={editDiscountAmount}
                  onChange={(e) => setEditDiscountAmount(e.target.value)}
                  placeholder="e.g., 20, 100, etc"
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
            </div>

            {(editDiscountType === '$ off when $ spent' || editDiscountType === '% off when $ spent') && (
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                Minimum Spend Amount ($)
              </label>
              <input
                type="number"
                value={editMinSpend}
                onChange={(e) => setEditMinSpend(e.target.value)}
                placeholder="e.g., 50, 100, etc"
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
            )}

            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
              }}
              >
                Usage Type
              </label>
              <div style={{ display: 'flex', gap: themeSpace.lg }}>
                {usageTypes.map((type) => (
                  <label
                    key={type}
                    style={{
                      display: 'flex', alignItems: 'center', gap: themeSpace.sm, cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="editUseType"
                      value={type}
                      checked={editUseType === type}
                      onChange={(e) => setEditUseType(e.target.value as 'one-time' | 'reusable')}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: themeColors.text }}>
                      {type === 'one-time' ? 'One-Time Use' : 'Reusable'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: themeSpace.md, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setShowEditForm(false);
                setEditingOffer(null);
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
              type="button"
              onClick={handleEditOffer}
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
    </PageLayout>
  );
}
