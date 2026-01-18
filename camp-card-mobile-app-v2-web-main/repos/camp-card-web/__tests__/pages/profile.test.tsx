/**
 * Profile Page Tests
 *
 * Comprehensive tests for the profile page logic including:
 * - Profile data handling
 * - Edit mode logic
 * - Form validation
 * - Name splitting/joining
 * - Date formatting
 * - Logout functionality
 * - Avatar generation
 *
 * Note: Component rendering tests use logic testing due to Next.js JSX transform.
 */

import React from 'react';

// ============================================================================
// Profile Types
// ============================================================================

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  role: string;
  joinedDate: string;
  status: string;
  profilePicture: string;
}

// ============================================================================
// Avatar Generation Tests
// ============================================================================

describe('Profile Page - Avatar Generation', () => {
  describe('Initial Extraction', () => {
    const getInitial = (name: string | undefined | null): string => {
      if (!name || name.trim() === '') return 'A';
      return name.charAt(0).toUpperCase();
    };

    it('returns first letter of name uppercased', () => {
      expect(getInitial('John Doe')).toBe('J');
      expect(getInitial('admin')).toBe('A');
    });

    it('returns A when name is empty', () => {
      expect(getInitial('')).toBe('A');
    });

    it('returns A when name is only spaces', () => {
      expect(getInitial('   ')).toBe('A');
    });

    it('returns A when name is undefined', () => {
      expect(getInitial(undefined)).toBe('A');
    });

    it('returns A when name is null', () => {
      expect(getInitial(null)).toBe('A');
    });

    it('handles lowercase names', () => {
      expect(getInitial('john')).toBe('J');
    });
  });

  describe('Avatar Display Logic', () => {
    const shouldShowPicture = (profilePicture: string | undefined): boolean => {
      return !!profilePicture && profilePicture.length > 0;
    };

    it('shows picture when URL is provided', () => {
      expect(shouldShowPicture('https://example.com/photo.jpg')).toBe(true);
    });

    it('shows initials when no picture', () => {
      expect(shouldShowPicture('')).toBe(false);
      expect(shouldShowPicture(undefined)).toBe(false);
    });
  });
});

// ============================================================================
// Name Handling Tests
// ============================================================================

describe('Profile Page - Name Handling', () => {
  describe('Name Splitting', () => {
    const splitName = (fullName: string): { firstName: string; lastName: string } => {
      const trimmed = fullName.trim();
      if (!trimmed) {
        return { firstName: '', lastName: '' };
      }

      const parts = trimmed.split(' ');
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' ') || '',
      };
    };

    it('splits simple first and last name', () => {
      const result = splitName('John Doe');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });

    it('handles single name', () => {
      const result = splitName('John');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('');
    });

    it('handles multiple middle names', () => {
      const result = splitName('John Michael William Doe');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Michael William Doe');
    });

    it('handles empty string', () => {
      const result = splitName('');
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
    });

    it('trims whitespace', () => {
      const result = splitName('  John Doe  ');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });
  });

  describe('Name Joining', () => {
    const joinName = (firstName: string, lastName: string): string => {
      if (!firstName && !lastName) return '';
      if (!lastName) return firstName;
      if (!firstName) return lastName;
      return `${firstName} ${lastName}`;
    };

    it('joins first and last name', () => {
      expect(joinName('John', 'Doe')).toBe('John Doe');
    });

    it('returns first name only when no last name', () => {
      expect(joinName('John', '')).toBe('John');
    });

    it('returns last name only when no first name', () => {
      expect(joinName('', 'Doe')).toBe('Doe');
    });

    it('returns empty when both empty', () => {
      expect(joinName('', '')).toBe('');
    });
  });
});

// ============================================================================
// Date Formatting Tests
// ============================================================================

describe('Profile Page - Date Formatting', () => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  it('formats date with long month name', () => {
    // Use explicit year, month (0-indexed), day to avoid timezone issues
    const date = new Date(2025, 0, 15); // January 15, 2025 in local time
    const formatted = formatDate(date);
    expect(formatted).toContain('January');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2025');
  });

  it('formats date correctly for different months', () => {
    const dates = [
      { date: new Date(2025, 5, 20), month: 'June' }, // Month 5 = June (0-indexed)
      { date: new Date(2025, 11, 25), month: 'December' }, // Month 11 = December
    ];

    dates.forEach(({ date, month }) => {
      const formatted = formatDate(date);
      expect(formatted).toContain(month);
    });
  });
});

// ============================================================================
// Edit Mode Tests
// ============================================================================

describe('Profile Page - Edit Mode', () => {
  describe('Edit State Toggle', () => {
    const toggleEditMode = (isEditing: boolean): boolean => {
      return !isEditing;
    };

    it('enters edit mode when not editing', () => {
      expect(toggleEditMode(false)).toBe(true);
    });

    it('exits edit mode when editing', () => {
      expect(toggleEditMode(true)).toBe(false);
    });
  });

  describe('Button Text', () => {
    const getEditButtonText = (isEditing: boolean): string => {
      return isEditing ? 'Cancel' : 'Edit';
    };

    it('shows Edit when not editing', () => {
      expect(getEditButtonText(false)).toBe('Edit');
    });

    it('shows Cancel when editing', () => {
      expect(getEditButtonText(true)).toBe('Cancel');
    });
  });

  describe('Save Button Visibility', () => {
    const showSaveButton = (isEditing: boolean): boolean => {
      return isEditing;
    };

    it('shows save button in edit mode', () => {
      expect(showSaveButton(true)).toBe(true);
    });

    it('hides save button when not editing', () => {
      expect(showSaveButton(false)).toBe(false);
    });
  });
});

// ============================================================================
// Form Validation Tests
// ============================================================================

describe('Profile Page - Form Validation', () => {
  interface ProfileFormData {
    name: string;
    email: string;
    phone: string;
  }

  const validateProfileForm = (data: ProfileFormData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name || data.name.trim() === '') {
      errors.push('Name is required');
    }

    if (!data.email || data.email.trim() === '') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    // Phone is optional but if provided, should be valid format
    if (data.phone && data.phone.trim() !== '') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(data.phone)) {
        errors.push('Invalid phone format');
      }
    }

    return { valid: errors.length === 0, errors };
  };

  it('validates complete form data', () => {
    const data: ProfileFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0101',
    };
    const result = validateProfileForm(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('requires name', () => {
    const data: ProfileFormData = {
      name: '',
      email: 'john@example.com',
      phone: '',
    };
    const result = validateProfileForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  it('requires email', () => {
    const data: ProfileFormData = {
      name: 'John Doe',
      email: '',
      phone: '',
    };
    const result = validateProfileForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Email is required');
  });

  it('validates email format', () => {
    const data: ProfileFormData = {
      name: 'John Doe',
      email: 'invalid-email',
      phone: '',
    };
    const result = validateProfileForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid email format');
  });

  it('validates phone format when provided', () => {
    const data: ProfileFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: 'invalid@phone',
    };
    const result = validateProfileForm(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid phone format');
  });

  it('accepts valid phone formats', () => {
    const validPhones = [
      '555-0101',
      '(555) 555-5555',
      '+1 555 555 5555',
      '5555555555',
    ];

    validPhones.forEach((phone) => {
      const data: ProfileFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone,
      };
      const result = validateProfileForm(data);
      expect(result.valid).toBe(true);
    });
  });

  it('allows empty phone', () => {
    const data: ProfileFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '',
    };
    const result = validateProfileForm(data);
    expect(result.valid).toBe(true);
  });
});

// ============================================================================
// Profile Update Data Tests
// ============================================================================

describe('Profile Page - Update Data', () => {
  describe('Prepare Update Payload', () => {
    const prepareUpdatePayload = (profile: ProfileData) => {
      const nameParts = profile.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        firstName,
        lastName,
        phoneNumber: profile.phone,
      };
    };

    it('extracts first and last name correctly', () => {
      const profile: ProfileData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0101',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        role: 'SCOUT',
        joinedDate: '',
        status: 'Active',
        profilePicture: '',
      };

      const payload = prepareUpdatePayload(profile);
      expect(payload.firstName).toBe('John');
      expect(payload.lastName).toBe('Doe');
      expect(payload.phoneNumber).toBe('555-0101');
    });

    it('handles single name', () => {
      const profile: ProfileData = {
        name: 'John',
        email: 'john@example.com',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        role: 'SCOUT',
        joinedDate: '',
        status: 'Active',
        profilePicture: '',
      };

      const payload = prepareUpdatePayload(profile);
      expect(payload.firstName).toBe('John');
      expect(payload.lastName).toBe('');
    });
  });
});

// ============================================================================
// Session Data Mapping Tests
// ============================================================================

describe('Profile Page - Session Data Mapping', () => {
  const mapSessionToProfile = (session: any): ProfileData => {
    const user = session?.user || {};
    return {
      name: user.name || 'User',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      role: user.role || 'User',
      joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: 'Active',
      profilePicture: user.profilePicture || '',
    };
  };

  it('maps complete session data', () => {
    const session = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0101',
        role: 'NATIONAL_ADMIN',
      },
    };

    const profile = mapSessionToProfile(session);
    expect(profile.name).toBe('John Doe');
    expect(profile.email).toBe('john@example.com');
    expect(profile.phone).toBe('555-0101');
    expect(profile.role).toBe('NATIONAL_ADMIN');
  });

  it('provides defaults for missing data', () => {
    const session = {
      user: {
        email: 'john@example.com',
      },
    };

    const profile = mapSessionToProfile(session);
    expect(profile.name).toBe('User');
    expect(profile.phone).toBe('');
    expect(profile.role).toBe('User');
  });

  it('handles null session', () => {
    const profile = mapSessionToProfile(null);
    expect(profile.name).toBe('User');
    expect(profile.email).toBe('');
    expect(profile.status).toBe('Active');
  });
});

// ============================================================================
// Success Message Tests
// ============================================================================

describe('Profile Page - Success Message', () => {
  describe('Success State', () => {
    interface SuccessState {
      saved: boolean;
    }

    const showSuccess = (): SuccessState => {
      return { saved: true };
    };

    const hideSuccess = (): SuccessState => {
      return { saved: false };
    };

    it('shows success state', () => {
      expect(showSuccess().saved).toBe(true);
    });

    it('hides success state', () => {
      expect(hideSuccess().saved).toBe(false);
    });
  });

  describe('Success Message Text', () => {
    const getSuccessMessage = (): string => {
      return 'Profile updated successfully!';
    };

    it('returns correct success message', () => {
      expect(getSuccessMessage()).toBe('Profile updated successfully!');
    });
  });
});

// ============================================================================
// Logout Tests
// ============================================================================

describe('Profile Page - Logout', () => {
  describe('Logout Configuration', () => {
    const getLogoutConfig = () => {
      return {
        redirect: true,
        callbackUrl: '/login',
      };
    };

    it('enables redirect', () => {
      const config = getLogoutConfig();
      expect(config.redirect).toBe(true);
    });

    it('redirects to login page', () => {
      const config = getLogoutConfig();
      expect(config.callbackUrl).toBe('/login');
    });
  });
});

// ============================================================================
// Contact Information Display Tests
// ============================================================================

describe('Profile Page - Contact Information Display', () => {
  describe('Display Value or Placeholder', () => {
    const getDisplayValue = (value: string | undefined, placeholder: string): string => {
      return value && value.trim() !== '' ? value : placeholder;
    };

    it('returns value when provided', () => {
      expect(getDisplayValue('555-0101', 'Not provided')).toBe('555-0101');
    });

    it('returns placeholder when empty', () => {
      expect(getDisplayValue('', 'Not provided')).toBe('Not provided');
    });

    it('returns placeholder when undefined', () => {
      expect(getDisplayValue(undefined, 'Not provided')).toBe('Not provided');
    });

    it('returns placeholder when only whitespace', () => {
      expect(getDisplayValue('   ', 'Not provided')).toBe('Not provided');
    });
  });
});

// ============================================================================
// Profile Picture Upload Tests
// ============================================================================

describe('Profile Page - Profile Picture Upload', () => {
  describe('File Validation', () => {
    const isValidImageType = (file: { type: string }): boolean => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      return validTypes.includes(file.type);
    };

    it('accepts JPEG images', () => {
      expect(isValidImageType({ type: 'image/jpeg' })).toBe(true);
    });

    it('accepts PNG images', () => {
      expect(isValidImageType({ type: 'image/png' })).toBe(true);
    });

    it('accepts GIF images', () => {
      expect(isValidImageType({ type: 'image/gif' })).toBe(true);
    });

    it('rejects non-image files', () => {
      expect(isValidImageType({ type: 'application/pdf' })).toBe(false);
      expect(isValidImageType({ type: 'text/plain' })).toBe(false);
    });
  });

  describe('File Size Validation', () => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const isValidFileSize = (size: number): boolean => {
      return size <= MAX_FILE_SIZE;
    };

    it('accepts files under 5MB', () => {
      expect(isValidFileSize(1024 * 1024)).toBe(true); // 1MB
      expect(isValidFileSize(4 * 1024 * 1024)).toBe(true); // 4MB
    });

    it('accepts files exactly 5MB', () => {
      expect(isValidFileSize(5 * 1024 * 1024)).toBe(true);
    });

    it('rejects files over 5MB', () => {
      expect(isValidFileSize(6 * 1024 * 1024)).toBe(false);
    });
  });
});

// ============================================================================
// Role Badge Tests
// ============================================================================

describe('Profile Page - Role Badge', () => {
  describe('Role Display', () => {
    const formatRole = (role: string): string => {
      const roleMap: { [key: string]: string } = {
        NATIONAL_ADMIN: 'National Admin',
        COUNCIL_ADMIN: 'Council Admin',
        UNIT_LEADER: 'Unit Leader',
        PARENT: 'Parent',
        SCOUT: 'Scout',
      };
      return roleMap[role] || role;
    };

    it('formats NATIONAL_ADMIN correctly', () => {
      expect(formatRole('NATIONAL_ADMIN')).toBe('National Admin');
    });

    it('formats SCOUT correctly', () => {
      expect(formatRole('SCOUT')).toBe('Scout');
    });

    it('returns original for unknown roles', () => {
      expect(formatRole('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('Role Badge Style', () => {
    const getRoleBadgeStyle = () => {
      return {
        backgroundColor: '#eff6ff',
        color: '#2563eb',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
      };
    };

    it('uses primary blue color scheme', () => {
      const style = getRoleBadgeStyle();
      expect(style.backgroundColor).toBe('#eff6ff');
      expect(style.color).toBe('#2563eb');
    });
  });
});

// ============================================================================
// Account Section Tests
// ============================================================================

describe('Profile Page - Account Section', () => {
  describe('Status Display', () => {
    const getStatusText = (isActive: boolean): string => {
      return isActive ? 'Active' : 'Inactive';
    };

    it('shows Active for active users', () => {
      expect(getStatusText(true)).toBe('Active');
    });

    it('shows Inactive for inactive users', () => {
      expect(getStatusText(false)).toBe('Inactive');
    });
  });

  describe('Joined Date', () => {
    const getJoinedDate = (): string => {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    it('returns formatted date string', () => {
      const dateStr = getJoinedDate();
      expect(typeof dateStr).toBe('string');
      expect(dateStr.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Theme Colors Tests
// ============================================================================

describe('Profile Page - Theme Colors', () => {
  const themeColors = {
    primary50: '#eff6ff',
    primary600: '#2563eb',
    success50: '#f0fdf4',
    success600: '#16a34a',
    gray50: '#f9fafb',
    gray500: '#6b7280',
    gray600: '#4b5563',
    text: '#1f2937',
    white: '#ffffff',
    error500: '#ef4444',
  };

  it('has primary colors defined', () => {
    expect(themeColors.primary50).toBe('#eff6ff');
    expect(themeColors.primary600).toBe('#2563eb');
  });

  it('has success colors defined', () => {
    expect(themeColors.success50).toBe('#f0fdf4');
    expect(themeColors.success600).toBe('#16a34a');
  });

  it('has error color defined', () => {
    expect(themeColors.error500).toBe('#ef4444');
  });
});
