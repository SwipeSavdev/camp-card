/**
 * Comprehensive Authentication Tests
 *
 * Tests for authentication flows and validation including:
 * - Email validation
 * - Password validation
 * - Session handling
 * - Token management
 * - Role-based access
 * - Error handling
 */

describe('Email Validation', () => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  describe('Valid Emails', () => {
    const validEmails = [
      'test@example.com',
      'user@domain.org',
      'admin@campcard.org',
      'john.doe@company.co.uk',
      'user123@test.io',
      'first+last@gmail.com',
      'user_name@domain.com',
      'USER@DOMAIN.COM',
      'test@sub.domain.com',
    ];

    validEmails.forEach((email) => {
      it(`should accept "${email}"`, () => {
        expect(isValidEmail(email)).toBe(true);
      });
    });
  });

  describe('Invalid Emails', () => {
    const invalidEmails = [
      '',
      'invalid',
      'invalid@',
      '@domain.com',
      'missing@domain',
      'no spaces@domain.com',
      'test@.com',
      'test@domain.',
      '@',
      '@@',
      'test@@domain.com',
      'test@domain@com',
    ];

    invalidEmails.forEach((email) => {
      it(`should reject "${email || '(empty string)'}"`, () => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });
});

describe('Password Validation', () => {
  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Password must contain at least one letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return { valid: errors.length === 0, errors };
  };

  describe('Minimum Length', () => {
    it('should reject password shorter than 6 characters', () => {
      const result = validatePassword('abc12');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters');
    });

    it('should accept password with exactly 6 characters', () => {
      const result = validatePassword('abc123');
      expect(result.errors).not.toContain('Password must be at least 6 characters');
    });
  });

  describe('Maximum Length', () => {
    it('should reject password longer than 128 characters', () => {
      const longPassword = 'a'.repeat(129) + '1';
      const result = validatePassword(longPassword);
      expect(result.errors).toContain('Password must not exceed 128 characters');
    });

    it('should accept password with exactly 128 characters', () => {
      const maxPassword = 'a'.repeat(127) + '1';
      const result = validatePassword(maxPassword);
      expect(result.errors).not.toContain('Password must not exceed 128 characters');
    });
  });

  describe('Character Requirements', () => {
    it('should require at least one letter', () => {
      const result = validatePassword('123456');
      expect(result.errors).toContain('Password must contain at least one letter');
    });

    it('should require at least one number', () => {
      const result = validatePassword('abcdef');
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should accept password with letters and numbers', () => {
      const result = validatePassword('abc123');
      expect(result.valid).toBe(true);
    });
  });

  describe('Valid Passwords', () => {
    const validPasswords = [
      'abc123',
      'Password1',
      'securePass99',
      'MyP@ssw0rd!',
      '123abcDEF',
      'A1bcdefgh',
    ];

    validPasswords.forEach((password) => {
      it(`should accept "${password}"`, () => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
      });
    });
  });
});

describe('Session Status Handling', () => {
  type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

  interface SessionState {
    status: SessionStatus;
    showLoading: boolean;
    showContent: boolean;
    requiresRedirect: boolean;
    redirectTo: string | null;
  }

  const getSessionState = (status: SessionStatus, currentPath: string): SessionState => {
    const isLoginPage = currentPath === '/login';

    return {
      status,
      showLoading: status === 'loading',
      showContent: status === 'authenticated',
      requiresRedirect:
        (status === 'unauthenticated' && !isLoginPage) ||
        (status === 'authenticated' && isLoginPage),
      redirectTo:
        status === 'unauthenticated' && !isLoginPage
          ? '/login'
          : status === 'authenticated' && isLoginPage
          ? '/dashboard'
          : null,
    };
  };

  describe('Loading State', () => {
    it('should show loading when status is loading', () => {
      const state = getSessionState('loading', '/dashboard');
      expect(state.showLoading).toBe(true);
      expect(state.showContent).toBe(false);
    });

    it('should not redirect while loading', () => {
      const state = getSessionState('loading', '/dashboard');
      expect(state.requiresRedirect).toBe(false);
    });
  });

  describe('Authenticated State', () => {
    it('should show content when authenticated on protected route', () => {
      const state = getSessionState('authenticated', '/dashboard');
      expect(state.showContent).toBe(true);
      expect(state.showLoading).toBe(false);
    });

    it('should redirect to dashboard when authenticated on login page', () => {
      const state = getSessionState('authenticated', '/login');
      expect(state.requiresRedirect).toBe(true);
      expect(state.redirectTo).toBe('/dashboard');
    });
  });

  describe('Unauthenticated State', () => {
    it('should redirect to login when unauthenticated on protected route', () => {
      const state = getSessionState('unauthenticated', '/dashboard');
      expect(state.requiresRedirect).toBe(true);
      expect(state.redirectTo).toBe('/login');
    });

    it('should not redirect when unauthenticated on login page', () => {
      const state = getSessionState('unauthenticated', '/login');
      expect(state.requiresRedirect).toBe(false);
    });
  });
});

describe('Token Management', () => {
  interface TokenInfo {
    accessToken: string;
    expiresAt: number;
    refreshToken?: string;
  }

  const isTokenExpired = (tokenInfo: TokenInfo): boolean => {
    const buffer = 5 * 60 * 1000; // 5 minute buffer
    return Date.now() >= tokenInfo.expiresAt - buffer;
  };

  const shouldRefreshToken = (tokenInfo: TokenInfo | null): boolean => {
    if (!tokenInfo) return false;
    if (!tokenInfo.refreshToken) return false;
    return isTokenExpired(tokenInfo);
  };

  describe('Token Expiration', () => {
    it('should detect expired token', () => {
      const expiredToken: TokenInfo = {
        accessToken: 'token',
        expiresAt: Date.now() - 1000,
      };
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it('should detect valid token', () => {
      const validToken: TokenInfo = {
        accessToken: 'token',
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour from now
      };
      expect(isTokenExpired(validToken)).toBe(false);
    });

    it('should detect token expiring within buffer period', () => {
      const expiringToken: TokenInfo = {
        accessToken: 'token',
        expiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes from now (within 5 min buffer)
      };
      expect(isTokenExpired(expiringToken)).toBe(true);
    });
  });

  describe('Token Refresh', () => {
    it('should not refresh null token', () => {
      expect(shouldRefreshToken(null)).toBe(false);
    });

    it('should not refresh token without refresh token', () => {
      const tokenWithoutRefresh: TokenInfo = {
        accessToken: 'token',
        expiresAt: Date.now() - 1000,
      };
      expect(shouldRefreshToken(tokenWithoutRefresh)).toBe(false);
    });

    it('should refresh expired token with refresh token', () => {
      const tokenWithRefresh: TokenInfo = {
        accessToken: 'token',
        expiresAt: Date.now() - 1000,
        refreshToken: 'refresh',
      };
      expect(shouldRefreshToken(tokenWithRefresh)).toBe(true);
    });

    it('should not refresh valid token', () => {
      const validToken: TokenInfo = {
        accessToken: 'token',
        expiresAt: Date.now() + 60 * 60 * 1000,
        refreshToken: 'refresh',
      };
      expect(shouldRefreshToken(validToken)).toBe(false);
    });
  });
});

describe('Role-Based Access Control', () => {
  type UserRole = 'NATIONAL_ADMIN' | 'COUNCIL_ADMIN' | 'UNIT_LEADER' | 'PARENT' | 'SCOUT';

  interface RoutePermission {
    path: string;
    allowedRoles: UserRole[];
  }

  const routePermissions: RoutePermission[] = [
    { path: '/dashboard', allowedRoles: ['NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER'] },
    { path: '/users', allowedRoles: ['NATIONAL_ADMIN', 'COUNCIL_ADMIN'] },
    { path: '/councils', allowedRoles: ['NATIONAL_ADMIN'] },
    { path: '/merchants', allowedRoles: ['NATIONAL_ADMIN', 'COUNCIL_ADMIN'] },
    { path: '/offers', allowedRoles: ['NATIONAL_ADMIN', 'COUNCIL_ADMIN'] },
    { path: '/scouts', allowedRoles: ['NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER'] },
    { path: '/ai-marketing', allowedRoles: ['NATIONAL_ADMIN', 'COUNCIL_ADMIN'] },
  ];

  const canAccessRoute = (role: UserRole, path: string): boolean => {
    const permission = routePermissions.find((p) => p.path === path);
    if (!permission) return false;
    return permission.allowedRoles.includes(role);
  };

  const getAllAccessibleRoutes = (role: UserRole): string[] => {
    return routePermissions
      .filter((p) => p.allowedRoles.includes(role))
      .map((p) => p.path);
  };

  describe('NATIONAL_ADMIN Access', () => {
    it('should access all routes', () => {
      const routes = getAllAccessibleRoutes('NATIONAL_ADMIN');
      expect(routes).toContain('/dashboard');
      expect(routes).toContain('/users');
      expect(routes).toContain('/councils');
      expect(routes).toContain('/merchants');
    });
  });

  describe('COUNCIL_ADMIN Access', () => {
    it('should access dashboard, users, merchants, offers', () => {
      expect(canAccessRoute('COUNCIL_ADMIN', '/dashboard')).toBe(true);
      expect(canAccessRoute('COUNCIL_ADMIN', '/users')).toBe(true);
      expect(canAccessRoute('COUNCIL_ADMIN', '/merchants')).toBe(true);
    });

    it('should not access councils', () => {
      expect(canAccessRoute('COUNCIL_ADMIN', '/councils')).toBe(false);
    });
  });

  describe('UNIT_LEADER Access', () => {
    it('should access dashboard and scouts', () => {
      expect(canAccessRoute('UNIT_LEADER', '/dashboard')).toBe(true);
      expect(canAccessRoute('UNIT_LEADER', '/scouts')).toBe(true);
    });

    it('should not access users or councils', () => {
      expect(canAccessRoute('UNIT_LEADER', '/users')).toBe(false);
      expect(canAccessRoute('UNIT_LEADER', '/councils')).toBe(false);
    });
  });

  describe('PARENT and SCOUT Access', () => {
    it('PARENT should not access any admin routes', () => {
      const parentRoutes = getAllAccessibleRoutes('PARENT');
      expect(parentRoutes).toHaveLength(0);
    });

    it('SCOUT should not access any admin routes', () => {
      const scoutRoutes = getAllAccessibleRoutes('SCOUT');
      expect(scoutRoutes).toHaveLength(0);
    });
  });
});

describe('Authentication Error Handling', () => {
  type AuthErrorType =
    | 'INVALID_CREDENTIALS'
    | 'ACCOUNT_LOCKED'
    | 'EMAIL_NOT_VERIFIED'
    | 'ACCESS_DENIED'
    | 'SESSION_EXPIRED'
    | 'NETWORK_ERROR'
    | 'UNKNOWN';

  interface AuthError {
    type: AuthErrorType;
    message: string;
    recoverable: boolean;
    action?: string;
  }

  const parseAuthError = (errorCode: string | null): AuthError => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return {
          type: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          recoverable: true,
          action: 'Please check your credentials and try again',
        };
      case 'AccountLocked':
        return {
          type: 'ACCOUNT_LOCKED',
          message: 'Your account has been locked',
          recoverable: false,
          action: 'Please contact support',
        };
      case 'EmailNotVerified':
        return {
          type: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email address',
          recoverable: true,
          action: 'Check your inbox for verification email',
        };
      case 'AccessDenied':
        return {
          type: 'ACCESS_DENIED',
          message: 'You do not have access to this resource',
          recoverable: false,
          action: 'Contact your administrator for access',
        };
      case 'SessionExpired':
        return {
          type: 'SESSION_EXPIRED',
          message: 'Your session has expired',
          recoverable: true,
          action: 'Please sign in again',
        };
      case null:
      case undefined:
        return {
          type: 'UNKNOWN',
          message: '',
          recoverable: false,
        };
      default:
        if (errorCode.includes('network') || errorCode.includes('fetch')) {
          return {
            type: 'NETWORK_ERROR',
            message: 'Network error. Please check your connection.',
            recoverable: true,
            action: 'Try again when connected',
          };
        }
        return {
          type: 'UNKNOWN',
          message: 'An unexpected error occurred',
          recoverable: true,
          action: 'Please try again',
        };
    }
  };

  describe('Error Parsing', () => {
    it('should parse invalid credentials error', () => {
      const error = parseAuthError('CredentialsSignin');
      expect(error.type).toBe('INVALID_CREDENTIALS');
      expect(error.recoverable).toBe(true);
    });

    it('should parse account locked error', () => {
      const error = parseAuthError('AccountLocked');
      expect(error.type).toBe('ACCOUNT_LOCKED');
      expect(error.recoverable).toBe(false);
    });

    it('should parse access denied error', () => {
      const error = parseAuthError('AccessDenied');
      expect(error.type).toBe('ACCESS_DENIED');
      expect(error.action).toBe('Contact your administrator for access');
    });

    it('should parse network errors', () => {
      const error = parseAuthError('network error: failed to fetch');
      expect(error.type).toBe('NETWORK_ERROR');
    });

    it('should handle null error code', () => {
      const error = parseAuthError(null);
      expect(error.type).toBe('UNKNOWN');
      expect(error.message).toBe('');
    });

    it('should handle unknown error codes', () => {
      const error = parseAuthError('SomeUnknownError');
      expect(error.type).toBe('UNKNOWN');
      expect(error.recoverable).toBe(true);
    });
  });
});

describe('Login Form State Management', () => {
  interface LoginFormState {
    email: string;
    password: string;
    isSubmitting: boolean;
    error: string | null;
    touched: { email: boolean; password: boolean };
  }

  const initialState: LoginFormState = {
    email: '',
    password: '',
    isSubmitting: false,
    error: null,
    touched: { email: false, password: false },
  };

  type LoginAction =
    | { type: 'SET_EMAIL'; payload: string }
    | { type: 'SET_PASSWORD'; payload: string }
    | { type: 'TOUCH_FIELD'; payload: 'email' | 'password' }
    | { type: 'SUBMIT_START' }
    | { type: 'SUBMIT_SUCCESS' }
    | { type: 'SUBMIT_ERROR'; payload: string }
    | { type: 'RESET' };

  const loginReducer = (state: LoginFormState, action: LoginAction): LoginFormState => {
    switch (action.type) {
      case 'SET_EMAIL':
        return { ...state, email: action.payload, error: null };
      case 'SET_PASSWORD':
        return { ...state, password: action.payload, error: null };
      case 'TOUCH_FIELD':
        return { ...state, touched: { ...state.touched, [action.payload]: true } };
      case 'SUBMIT_START':
        return { ...state, isSubmitting: true, error: null };
      case 'SUBMIT_SUCCESS':
        return { ...state, isSubmitting: false };
      case 'SUBMIT_ERROR':
        return { ...state, isSubmitting: false, error: action.payload };
      case 'RESET':
        return initialState;
      default:
        return state;
    }
  };

  describe('Form State Transitions', () => {
    it('should update email', () => {
      const state = loginReducer(initialState, { type: 'SET_EMAIL', payload: 'test@test.com' });
      expect(state.email).toBe('test@test.com');
      expect(state.error).toBeNull();
    });

    it('should update password', () => {
      const state = loginReducer(initialState, { type: 'SET_PASSWORD', payload: 'password123' });
      expect(state.password).toBe('password123');
    });

    it('should track touched fields', () => {
      let state = loginReducer(initialState, { type: 'TOUCH_FIELD', payload: 'email' });
      expect(state.touched.email).toBe(true);
      expect(state.touched.password).toBe(false);

      state = loginReducer(state, { type: 'TOUCH_FIELD', payload: 'password' });
      expect(state.touched.password).toBe(true);
    });

    it('should handle submit start', () => {
      const state = loginReducer(initialState, { type: 'SUBMIT_START' });
      expect(state.isSubmitting).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle submit success', () => {
      const submittingState = { ...initialState, isSubmitting: true };
      const state = loginReducer(submittingState, { type: 'SUBMIT_SUCCESS' });
      expect(state.isSubmitting).toBe(false);
    });

    it('should handle submit error', () => {
      const submittingState = { ...initialState, isSubmitting: true };
      const state = loginReducer(submittingState, {
        type: 'SUBMIT_ERROR',
        payload: 'Invalid credentials',
      });
      expect(state.isSubmitting).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('should reset form state', () => {
      const filledState: LoginFormState = {
        email: 'test@test.com',
        password: 'password',
        isSubmitting: false,
        error: 'Some error',
        touched: { email: true, password: true },
      };
      const state = loginReducer(filledState, { type: 'RESET' });
      expect(state).toEqual(initialState);
    });

    it('should clear error when typing', () => {
      const stateWithError = { ...initialState, error: 'Previous error' };
      const state = loginReducer(stateWithError, { type: 'SET_EMAIL', payload: 'new@email.com' });
      expect(state.error).toBeNull();
    });
  });
});
