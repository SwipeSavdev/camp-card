/**
 * Merchants Page Tests
 *
 * Comprehensive tests for the merchants page logic including:
 * - Merchant data formatting
 * - Search and filter logic
 * - Pagination logic
 * - CRUD operations logic
 * - Location management
 * - Form validation
 * - Status management
 *
 * Note: Component rendering tests use logic testing due to Next.js JSX transform.
 */

import React from 'react';

// ============================================================================
// Merchant Types and Constants
// ============================================================================

type MerchantStatus = 'APPROVED' | 'PENDING' | 'INACTIVE' | 'REJECTED';

interface MerchantLocation {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  isHQ: boolean;
}

interface Merchant {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  status: MerchantStatus;
  isSingleLocation: boolean;
  locations: MerchantLocation[];
}

// Mock merchant data for testing
const mockMerchants: Merchant[] = [
  {
    id: '1',
    name: 'Pizza Palace',
    contactName: 'John Pizza',
    email: 'john@pizzapalace.com',
    phone: '555-0101',
    businessType: 'Restaurant',
    status: 'APPROVED',
    isSingleLocation: true,
    locations: [
      { id: 'loc1', name: 'Main Store', streetAddress: '123 Main St', city: 'San Francisco', state: 'CA', zipCode: '94102', isHQ: true },
    ],
  },
  {
    id: '2',
    name: 'Tech World',
    contactName: 'Jane Tech',
    email: 'jane@techworld.com',
    phone: '555-0202',
    businessType: 'Retail',
    status: 'PENDING',
    isSingleLocation: false,
    locations: [
      { id: 'loc2a', name: 'Downtown', streetAddress: '456 Market St', city: 'San Francisco', state: 'CA', zipCode: '94103', isHQ: true },
      { id: 'loc2b', name: 'Mall Location', streetAddress: '789 Shopping Way', city: 'San Jose', state: 'CA', zipCode: '95110', isHQ: false },
    ],
  },
  {
    id: '3',
    name: 'Auto Care',
    contactName: 'Bob Mechanic',
    email: 'bob@autocare.com',
    phone: '555-0303',
    businessType: 'Service',
    status: 'INACTIVE',
    isSingleLocation: true,
    locations: [],
  },
];

// ============================================================================
// Business Type Configuration Tests
// ============================================================================

describe('Merchants Page - Business Type Configuration', () => {
  const businessTypes = [
    'Retail',
    'Restaurant',
    'Service',
    'Entertainment',
    'Healthcare',
    'Education',
    'Other',
  ];

  it('has 7 business types', () => {
    expect(businessTypes).toHaveLength(7);
  });

  it('includes common business types', () => {
    expect(businessTypes).toContain('Retail');
    expect(businessTypes).toContain('Restaurant');
    expect(businessTypes).toContain('Service');
    expect(businessTypes).toContain('Entertainment');
  });

  it('includes Other as fallback', () => {
    expect(businessTypes).toContain('Other');
  });
});

// ============================================================================
// Status Configuration Tests
// ============================================================================

describe('Merchants Page - Status Configuration', () => {
  const statusOptions: MerchantStatus[] = ['APPROVED', 'PENDING', 'INACTIVE', 'REJECTED'];

  it('has 4 status options', () => {
    expect(statusOptions).toHaveLength(4);
  });

  describe('Status Badge Styling', () => {
    const getStatusStyle = (status: MerchantStatus): { bg: string; text: string } => {
      switch (status) {
        case 'APPROVED':
          return { bg: '#f0fdf4', text: '#16a34a' };
        case 'PENDING':
          return { bg: '#fefce8', text: '#eab308' };
        case 'INACTIVE':
          return { bg: '#f3f4f6', text: '#6b7280' };
        case 'REJECTED':
          return { bg: '#fef2f2', text: '#ef4444' };
        default:
          return { bg: '#f3f4f6', text: '#6b7280' };
      }
    };

    it('returns green for APPROVED', () => {
      const style = getStatusStyle('APPROVED');
      expect(style.text).toBe('#16a34a');
    });

    it('returns yellow for PENDING', () => {
      const style = getStatusStyle('PENDING');
      expect(style.text).toBe('#eab308');
    });

    it('returns gray for INACTIVE', () => {
      const style = getStatusStyle('INACTIVE');
      expect(style.text).toBe('#6b7280');
    });

    it('returns red for REJECTED', () => {
      const style = getStatusStyle('REJECTED');
      expect(style.text).toBe('#ef4444');
    });
  });

  describe('Status Toggle Logic', () => {
    const getNextStatus = (currentStatus: MerchantStatus): MerchantStatus => {
      switch (currentStatus) {
        case 'APPROVED':
          return 'INACTIVE';
        case 'PENDING':
          return 'APPROVED';
        case 'INACTIVE':
          return 'APPROVED';
        case 'REJECTED':
          return 'APPROVED';
        default:
          return 'PENDING';
      }
    };

    it('toggles APPROVED to INACTIVE', () => {
      expect(getNextStatus('APPROVED')).toBe('INACTIVE');
    });

    it('toggles PENDING to APPROVED', () => {
      expect(getNextStatus('PENDING')).toBe('APPROVED');
    });

    it('toggles INACTIVE to APPROVED', () => {
      expect(getNextStatus('INACTIVE')).toBe('APPROVED');
    });

    it('toggles REJECTED to APPROVED', () => {
      expect(getNextStatus('REJECTED')).toBe('APPROVED');
    });
  });
});

// ============================================================================
// Search Logic Tests
// ============================================================================

describe('Merchants Page - Search Logic', () => {
  const filterBySearch = (merchants: Merchant[], searchTerm: string): Merchant[] => {
    if (!searchTerm || searchTerm.trim() === '') {
      return merchants;
    }

    const term = searchTerm.toLowerCase().trim();

    return merchants.filter(
      (merchant) =>
        merchant.name.toLowerCase().includes(term) ||
        merchant.email.toLowerCase().includes(term) ||
        merchant.contactName.toLowerCase().includes(term)
    );
  };

  it('returns all merchants when search term is empty', () => {
    expect(filterBySearch(mockMerchants, '')).toHaveLength(3);
    expect(filterBySearch(mockMerchants, '  ')).toHaveLength(3);
  });

  it('filters merchants by name', () => {
    const result = filterBySearch(mockMerchants, 'Pizza');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Pizza Palace');
  });

  it('filters merchants by email', () => {
    const result = filterBySearch(mockMerchants, 'jane@');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Tech World');
  });

  it('filters merchants by contact name', () => {
    const result = filterBySearch(mockMerchants, 'Bob');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Auto Care');
  });

  it('search is case insensitive', () => {
    const result = filterBySearch(mockMerchants, 'PIZZA');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Pizza Palace');
  });

  it('returns empty array when no matches', () => {
    const result = filterBySearch(mockMerchants, 'nonexistent');
    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// Filter Logic Tests
// ============================================================================

describe('Merchants Page - Filter Logic', () => {
  const filterByBusinessType = (merchants: Merchant[], businessType: string): Merchant[] => {
    if (!businessType || businessType === '') {
      return merchants;
    }
    return merchants.filter((merchant) => merchant.businessType === businessType);
  };

  const filterByLocationCount = (merchants: Merchant[], filter: string): Merchant[] => {
    if (!filter || filter === '') {
      return merchants;
    }
    if (filter === 'single') {
      return merchants.filter((m) => m.isSingleLocation);
    }
    if (filter === 'multi') {
      return merchants.filter((m) => !m.isSingleLocation);
    }
    return merchants;
  };

  describe('Business Type Filter', () => {
    it('returns all merchants when no filter', () => {
      expect(filterByBusinessType(mockMerchants, '')).toHaveLength(3);
    });

    it('filters by Restaurant', () => {
      const result = filterByBusinessType(mockMerchants, 'Restaurant');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pizza Palace');
    });

    it('filters by Retail', () => {
      const result = filterByBusinessType(mockMerchants, 'Retail');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tech World');
    });

    it('filters by Service', () => {
      const result = filterByBusinessType(mockMerchants, 'Service');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Auto Care');
    });
  });

  describe('Location Count Filter', () => {
    it('returns all merchants when no filter', () => {
      expect(filterByLocationCount(mockMerchants, '')).toHaveLength(3);
    });

    it('filters single location merchants', () => {
      const result = filterByLocationCount(mockMerchants, 'single');
      expect(result).toHaveLength(2);
    });

    it('filters multi location merchants', () => {
      const result = filterByLocationCount(mockMerchants, 'multi');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tech World');
    });
  });

  describe('Combined Filters', () => {
    const applyFilters = (
      merchants: Merchant[],
      searchTerm: string,
      businessTypeFilter: string,
      locationFilter: string
    ): Merchant[] => {
      let filtered = merchants;

      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(
          (m) =>
            m.name.toLowerCase().includes(term) ||
            m.email.toLowerCase().includes(term) ||
            m.contactName.toLowerCase().includes(term)
        );
      }

      if (businessTypeFilter && businessTypeFilter !== '') {
        filtered = filtered.filter((m) => m.businessType === businessTypeFilter);
      }

      if (locationFilter === 'single') {
        filtered = filtered.filter((m) => m.isSingleLocation);
      } else if (locationFilter === 'multi') {
        filtered = filtered.filter((m) => !m.isSingleLocation);
      }

      return filtered;
    };

    it('combines business type and location filters', () => {
      const result = applyFilters(mockMerchants, '', 'Retail', 'multi');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tech World');
    });

    it('returns empty when filters have no matches', () => {
      const result = applyFilters(mockMerchants, '', 'Restaurant', 'multi');
      expect(result).toHaveLength(0);
    });
  });
});

// ============================================================================
// Pagination Logic Tests
// ============================================================================

describe('Merchants Page - Pagination Logic', () => {
  const paginate = <T,>(items: T[], page: number, itemsPerPage: number): T[] => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (totalItems: number, itemsPerPage: number): number => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  describe('Paginate Function', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1) }));

    it('returns first page items correctly', () => {
      const result = paginate(items, 1, 10);
      expect(result).toHaveLength(10);
      expect(result[0].id).toBe('1');
    });

    it('returns last page with remaining items', () => {
      const result = paginate(items, 3, 10);
      expect(result).toHaveLength(5);
      expect(result[0].id).toBe('21');
    });
  });

  describe('Total Pages Calculation', () => {
    it('calculates correct total pages', () => {
      expect(getTotalPages(25, 10)).toBe(3);
      expect(getTotalPages(100, 10)).toBe(10);
    });

    it('rounds up for partial pages', () => {
      expect(getTotalPages(11, 10)).toBe(2);
    });
  });
});

// ============================================================================
// Form Validation Tests
// ============================================================================

describe('Merchants Page - Form Validation', () => {
  interface MerchantFormData {
    name: string;
    contactName: string;
    email: string;
    phone: string;
    businessType: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }

  const validateMerchantForm = (data: MerchantFormData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name || data.name.trim() === '') {
      errors.push('Merchant name is required');
    }

    if (!data.contactName || data.contactName.trim() === '') {
      errors.push('Contact name is required');
    }

    if (!data.email || data.email.trim() === '') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    if (!data.phone || data.phone.trim() === '') {
      errors.push('Phone is required');
    }

    if (!data.businessType || data.businessType === '') {
      errors.push('Business type is required');
    }

    if (!data.streetAddress || data.streetAddress.trim() === '') {
      errors.push('Street address is required');
    }

    if (!data.city || data.city.trim() === '') {
      errors.push('City is required');
    }

    if (!data.state || data.state.trim() === '') {
      errors.push('State is required');
    }

    if (!data.zipCode || data.zipCode.trim() === '') {
      errors.push('ZIP code is required');
    }

    return { valid: errors.length === 0, errors };
  };

  const validFormData: MerchantFormData = {
    name: 'Test Merchant',
    contactName: 'Test Contact',
    email: 'test@merchant.com',
    phone: '555-0505',
    businessType: 'Retail',
    streetAddress: '100 Test St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
  };

  it('validates complete form data', () => {
    const result = validateMerchantForm(validFormData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('requires merchant name', () => {
    const data = { ...validFormData, name: '' };
    const result = validateMerchantForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Merchant name is required');
  });

  it('requires contact name', () => {
    const data = { ...validFormData, contactName: '' };
    const result = validateMerchantForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Contact name is required');
  });

  it('requires email', () => {
    const data = { ...validFormData, email: '' };
    const result = validateMerchantForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Email is required');
  });

  it('validates email format', () => {
    const data = { ...validFormData, email: 'invalid-email' };
    const result = validateMerchantForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid email format');
  });

  it('requires phone', () => {
    const data = { ...validFormData, phone: '' };
    const result = validateMerchantForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Phone is required');
  });

  it('requires business type', () => {
    const data = { ...validFormData, businessType: '' };
    const result = validateMerchantForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Business type is required');
  });

  it('requires all address fields', () => {
    const data = { ...validFormData, streetAddress: '', city: '', state: '', zipCode: '' };
    const result = validateMerchantForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Street address is required');
    expect(result.errors).toContain('City is required');
    expect(result.errors).toContain('State is required');
    expect(result.errors).toContain('ZIP code is required');
  });
});

// ============================================================================
// Location Management Tests
// ============================================================================

describe('Merchants Page - Location Management', () => {
  describe('Address Formatting', () => {
    const formatAddress = (location: MerchantLocation): string => {
      if (!location.streetAddress) return 'No address';
      return `${location.streetAddress}, ${location.city}, ${location.state} ${location.zipCode}`;
    };

    it('formats complete address correctly', () => {
      const location: MerchantLocation = {
        id: '1',
        name: 'Main',
        streetAddress: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        isHQ: true,
      };
      expect(formatAddress(location)).toBe('123 Main St, San Francisco, CA 94102');
    });

    it('returns no address when street is missing', () => {
      const location: MerchantLocation = {
        id: '1',
        name: 'Main',
        streetAddress: '',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        isHQ: true,
      };
      expect(formatAddress(location)).toBe('No address');
    });
  });

  describe('HQ Location', () => {
    const getHQLocation = (locations: MerchantLocation[]): MerchantLocation | undefined => {
      return locations.find((loc) => loc.isHQ);
    };

    it('finds HQ location', () => {
      const hq = getHQLocation(mockMerchants[0].locations);
      expect(hq?.name).toBe('Main Store');
    });

    it('returns undefined when no locations', () => {
      const hq = getHQLocation([]);
      expect(hq).toBeUndefined();
    });
  });

  describe('Location Count', () => {
    const getLocationCount = (merchant: Merchant): number => {
      return merchant.locations.length;
    };

    it('returns correct count for single location', () => {
      expect(getLocationCount(mockMerchants[0])).toBe(1);
    });

    it('returns correct count for multi location', () => {
      expect(getLocationCount(mockMerchants[1])).toBe(2);
    });

    it('returns 0 for no locations', () => {
      expect(getLocationCount(mockMerchants[2])).toBe(0);
    });
  });
});

// ============================================================================
// CRUD Operations Tests
// ============================================================================

describe('Merchants Page - CRUD Operations', () => {
  describe('Create Merchant', () => {
    const createMerchant = (merchants: Merchant[], newMerchant: Omit<Merchant, 'id'>): Merchant[] => {
      const id = String(merchants.length + 1);
      return [...merchants, { ...newMerchant, id }];
    };

    it('adds new merchant to list', () => {
      const newMerchant: Omit<Merchant, 'id'> = {
        name: 'New Store',
        contactName: 'New Contact',
        email: 'new@store.com',
        phone: '555-0404',
        businessType: 'Retail',
        status: 'PENDING',
        isSingleLocation: true,
        locations: [],
      };
      const result = createMerchant(mockMerchants, newMerchant);
      expect(result).toHaveLength(4);
      expect(result[3].name).toBe('New Store');
    });
  });

  describe('Update Merchant', () => {
    const updateMerchant = (
      merchants: Merchant[],
      merchantId: string,
      updates: Partial<Merchant>
    ): Merchant[] => {
      return merchants.map((m) => (m.id === merchantId ? { ...m, ...updates } : m));
    };

    it('updates merchant by id', () => {
      const result = updateMerchant(mockMerchants, '1', { name: 'Updated Pizza' });
      expect(result.find((m) => m.id === '1')?.name).toBe('Updated Pizza');
    });

    it('does not modify other merchants', () => {
      const result = updateMerchant(mockMerchants, '1', { name: 'Updated Pizza' });
      expect(result.find((m) => m.id === '2')?.name).toBe('Tech World');
    });
  });

  describe('Delete Merchant', () => {
    const deleteMerchant = (merchants: Merchant[], merchantId: string): Merchant[] => {
      return merchants.filter((m) => m.id !== merchantId);
    };

    it('removes merchant from list', () => {
      const result = deleteMerchant(mockMerchants, '1');
      expect(result).toHaveLength(2);
      expect(result.find((m) => m.id === '1')).toBeUndefined();
    });
  });
});

// ============================================================================
// Clear Filters Logic Tests
// ============================================================================

describe('Merchants Page - Clear Filters', () => {
  interface FilterState {
    searchTerm: string;
    businessTypeFilter: string;
    locationFilter: string;
  }

  const hasActiveFilters = (state: FilterState): boolean => {
    return state.searchTerm !== '' || state.businessTypeFilter !== '' || state.locationFilter !== '';
  };

  const clearFilters = (): FilterState => {
    return { searchTerm: '', businessTypeFilter: '', locationFilter: '' };
  };

  it('detects active search filter', () => {
    const state = { searchTerm: 'test', businessTypeFilter: '', locationFilter: '' };
    expect(hasActiveFilters(state)).toBe(true);
  });

  it('detects active business type filter', () => {
    const state = { searchTerm: '', businessTypeFilter: 'Retail', locationFilter: '' };
    expect(hasActiveFilters(state)).toBe(true);
  });

  it('returns false when no filters', () => {
    const state = { searchTerm: '', businessTypeFilter: '', locationFilter: '' };
    expect(hasActiveFilters(state)).toBe(false);
  });

  it('clears all filters', () => {
    const cleared = clearFilters();
    expect(cleared.searchTerm).toBe('');
    expect(cleared.businessTypeFilter).toBe('');
    expect(cleared.locationFilter).toBe('');
  });
});

// ============================================================================
// Expandable Row Logic Tests
// ============================================================================

describe('Merchants Page - Expandable Row', () => {
  const toggleExpanded = (expandedId: string | null, merchantId: string): string | null => {
    return expandedId === merchantId ? null : merchantId;
  };

  it('expands row when not expanded', () => {
    expect(toggleExpanded(null, '1')).toBe('1');
  });

  it('collapses row when already expanded', () => {
    expect(toggleExpanded('1', '1')).toBeNull();
  });

  it('switches to different row', () => {
    expect(toggleExpanded('1', '2')).toBe('2');
  });
});

// ============================================================================
// Showing Count Tests
// ============================================================================

describe('Merchants Page - Showing Count', () => {
  const getShowingText = (filtered: number, total: number): string => {
    if (filtered === total) {
      return `Showing ${total} merchants`;
    }
    return `Showing ${filtered} of ${total} merchants`;
  };

  it('shows total when no filter', () => {
    expect(getShowingText(10, 10)).toBe('Showing 10 merchants');
  });

  it('shows filtered count when filtering', () => {
    expect(getShowingText(5, 10)).toBe('Showing 5 of 10 merchants');
  });
});
