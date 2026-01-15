/**
 * Utility Functions Unit Tests
 * Tests for helper functions and utilities used across the app
 */

describe('Discount Text Formatting', () => {
  const getDiscountText = (discountType: string, discountValue: number): string => {
    switch (discountType) {
      case 'PERCENTAGE':
        return `${discountValue}% OFF`;
      case 'FIXED_AMOUNT':
        return `$${discountValue} OFF`;
      case 'BUY_ONE_GET_ONE':
        return 'BOGO';
      case 'FREE_ITEM':
        return 'FREE ITEM';
      case 'SPECIAL_PRICE':
        return `$${discountValue}`;
      default:
        return 'DISCOUNT';
    }
  };

  it('should format percentage discount', () => {
    expect(getDiscountText('PERCENTAGE', 20)).toBe('20% OFF');
    expect(getDiscountText('PERCENTAGE', 50)).toBe('50% OFF');
    expect(getDiscountText('PERCENTAGE', 100)).toBe('100% OFF');
  });

  it('should format fixed amount discount', () => {
    expect(getDiscountText('FIXED_AMOUNT', 5)).toBe('$5 OFF');
    expect(getDiscountText('FIXED_AMOUNT', 10)).toBe('$10 OFF');
    expect(getDiscountText('FIXED_AMOUNT', 25)).toBe('$25 OFF');
  });

  it('should format BOGO discount', () => {
    expect(getDiscountText('BUY_ONE_GET_ONE', 0)).toBe('BOGO');
  });

  it('should format free item discount', () => {
    expect(getDiscountText('FREE_ITEM', 0)).toBe('FREE ITEM');
  });

  it('should format special price', () => {
    expect(getDiscountText('SPECIAL_PRICE', 9.99)).toBe('$9.99');
    expect(getDiscountText('SPECIAL_PRICE', 15)).toBe('$15');
  });

  it('should return default for unknown type', () => {
    expect(getDiscountText('UNKNOWN', 10)).toBe('DISCOUNT');
  });
});

describe('Days Remaining Calculation', () => {
  const getDaysRemaining = (validUntil: string): string => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Ends today';
    if (diff === 1) return '1 day left';
    return `${diff} days left`;
  };

  it('should show expired for past dates', () => {
    const pastDate = new Date(Date.now() - 86400000 * 2).toISOString(); // 2 days ago
    expect(getDaysRemaining(pastDate)).toBe('Expired');
  });

  it('should show days remaining for future dates', () => {
    const futureDate = new Date(Date.now() + 86400000 * 7); // 7 days from now
    const result = getDaysRemaining(futureDate.toISOString());
    expect(result).toMatch(/\d+ days? left|Ends today/);
  });

  it('should return string result for any date', () => {
    const date = new Date(Date.now() + 86400000 * 3);
    const result = getDaysRemaining(date.toISOString());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('Distance Formatting', () => {
  const formatDistanceDisplay = (miles: number): string => {
    if (miles < 0.1) {
      return 'Nearby';
    }
    if (miles < 1) {
      return `${(miles * 5280).toFixed(0)} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  };

  it('should show Nearby for very close distances', () => {
    expect(formatDistanceDisplay(0.05)).toBe('Nearby');
    expect(formatDistanceDisplay(0.01)).toBe('Nearby');
    expect(formatDistanceDisplay(0)).toBe('Nearby');
  });

  it('should show feet for distances under 1 mile', () => {
    expect(formatDistanceDisplay(0.5)).toMatch(/\d+ ft/);
    expect(formatDistanceDisplay(0.25)).toMatch(/\d+ ft/);
    expect(formatDistanceDisplay(0.1)).toMatch(/\d+ ft/);
  });

  it('should show miles for distances 1 mile or more', () => {
    expect(formatDistanceDisplay(1.0)).toBe('1.0 mi');
    expect(formatDistanceDisplay(5.5)).toBe('5.5 mi');
    expect(formatDistanceDisplay(25.3)).toBe('25.3 mi');
  });

  it('should format to one decimal place', () => {
    expect(formatDistanceDisplay(3.14159)).toBe('3.1 mi');
    expect(formatDistanceDisplay(10.99)).toBe('11.0 mi');
  });
});

describe('Email Validation', () => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  it('should validate correct email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('Phone Number Formatting', () => {
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  it('should format 10-digit phone numbers', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
  });

  it('should format 11-digit phone numbers starting with 1', () => {
    expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567');
  });

  it('should return original for non-standard formats', () => {
    expect(formatPhoneNumber('123')).toBe('123');
    expect(formatPhoneNumber('12345')).toBe('12345');
  });
});

describe('Currency Formatting', () => {
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  it('should format whole numbers with two decimals', () => {
    expect(formatCurrency(10)).toBe('$10.00');
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('should format decimal numbers correctly', () => {
    expect(formatCurrency(9.99)).toBe('$9.99');
    expect(formatCurrency(25.5)).toBe('$25.50');
  });

  it('should round to two decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
    expect(formatCurrency(10.994)).toBe('$10.99');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('Date Formatting', () => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  it('should format ISO date strings and return string', () => {
    const result = formatDate('2024-12-25T12:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // Check for month abbreviation format
    expect(result).toMatch(/[A-Z][a-z]{2}/);
    expect(result).toContain('2024');
  });
});

describe('Truncate Text', () => {
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  };

  it('should not truncate short text', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('should truncate long text with ellipsis', () => {
    expect(truncateText('This is a very long text', 15)).toBe('This is a ve...');
  });

  it('should handle edge cases', () => {
    expect(truncateText('', 10)).toBe('');
    expect(truncateText('Hi', 2)).toBe('Hi');
  });
});

describe('Slug Generation', () => {
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  it('should convert to lowercase', () => {
    expect(generateSlug('HELLO WORLD')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(generateSlug('Hello! World?')).toBe('hello-world');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(generateSlug('  Hello World  ')).toBe('hello-world');
  });
});

describe('Category Formatting', () => {
  const formatCategory = (category: string): string => {
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  it('should format RESTAURANTS', () => {
    expect(formatCategory('RESTAURANTS')).toBe('Restaurants');
  });

  it('should format multi-word categories', () => {
    expect(formatCategory('HEALTH_WELLNESS')).toBe('Health Wellness');
  });

  it('should handle already formatted text', () => {
    expect(formatCategory('Retail')).toBe('Retail');
  });
});
