import { apiClient } from '../services/apiClient';

/**
 * Test database connection by attempting to reach the backend
 */
export async function testDatabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Try to hit a health check endpoint
    const response = await apiClient.get('/api/v1/health');
    
    return {
      success: true,
      message: 'Successfully connected to backend',
      details: response.data,
    };
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return {
        success: false,
        message: 'Cannot connect to backend server. Make sure the backend is running on http://localhost:8080',
        details: {
          error: error.message,
          code: error.code,
        },
      };
    }

    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Backend server is running but health endpoint not found',
        details: {
          status: error.response.status,
          url: error.config?.url,
        },
      };
    }

    return {
      success: false,
      message: `Error connecting to backend: ${error.message}`,
      details: {
        status: error.response?.status,
        message: error.message,
      },
    };
  }
}

/**
 * Test user registration (creates a test user in the database)
 */
export async function testUserRegistration(testData?: {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}): Promise<{
  success: boolean;
  message: string;
  userId?: string;
  details?: any;
}> {
  const timestamp = Date.now();
  const defaultData = {
    email: testData?.email || `test.user.${timestamp}@example.com`,
    firstName: testData?.firstName || 'Test',
    lastName: testData?.lastName || 'User',
    password: testData?.password || 'Test1234!',
    role: 'SCOUT',
  };

  try {
    const response = await apiClient.post('/api/v1/auth/signup', defaultData);

    return {
      success: true,
      message: 'Test user created successfully',
      userId: response.data.user?.id,
      details: {
        email: defaultData.email,
        userId: response.data.user?.id,
        accessToken: response.data.accessToken ? 'Generated' : 'Missing',
      },
    };
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return {
        success: false,
        message: 'Cannot connect to backend server',
        details: {
          error: error.message,
          code: error.code,
        },
      };
    }

    if (error.response?.status === 400) {
      return {
        success: false,
        message: 'Validation error - check if email is already in use',
        details: {
          status: error.response.status,
          message: error.response.data?.message,
          errors: error.response.data?.errors,
        },
      };
    }

    return {
      success: false,
      message: `Registration failed: ${error.message}`,
      details: {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      },
    };
  }
}

/**
 * Test login (verifies authentication works)
 */
export async function testUserLogin(credentials: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  message: string;
  userId?: string;
  details?: any;
}> {
  try {
    const response = await apiClient.post('/api/v1/auth/mobile/login', credentials);

    return {
      success: true,
      message: 'Login successful',
      userId: response.data.user?.id,
      details: {
        email: credentials.email,
        userId: response.data.user?.id,
        accessToken: response.data.accessToken ? 'Generated' : 'Missing',
        refreshToken: response.data.refreshToken ? 'Generated' : 'Missing',
      },
    };
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return {
        success: false,
        message: 'Cannot connect to backend server',
        details: {
          error: error.message,
          code: error.code,
        },
      };
    }

    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Invalid credentials',
        details: {
          status: error.response.status,
          message: error.response.data?.message,
        },
      };
    }

    return {
      success: false,
      message: `Login failed: ${error.message}`,
      details: {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      },
    };
  }
}

/**
 * Run all connection tests
 */
export async function runAllTests() {
  console.log('🧪 Starting database connection tests...\n');

  // Test 1: Backend connectivity
  console.log('Test 1: Backend Health Check');
  const healthCheck = await testDatabaseConnection();
  console.log(healthCheck.success ? '✅ PASS' : '❌ FAIL', healthCheck.message);
  if (healthCheck.details) {
    console.log('Details:', JSON.stringify(healthCheck.details, null, 2));
  }
  console.log('');

  if (!healthCheck.success) {
    console.log('⚠️  Backend is not reachable. Skipping remaining tests.');
    return {
      totalTests: 3,
      passed: 0,
      failed: 3,
      results: [healthCheck],
    };
  }

  // Test 2: User registration
  console.log('Test 2: User Registration');
  const registration = await testUserRegistration();
  console.log(registration.success ? '✅ PASS' : '❌ FAIL', registration.message);
  if (registration.details) {
    console.log('Details:', JSON.stringify(registration.details, null, 2));
  }
  console.log('');

  // Test 3: User login
  if (registration.success) {
    console.log('Test 3: User Login');
    const login = await testUserLogin({
      email: registration.details?.email,
      password: 'Test1234!',
    });
    console.log(login.success ? '✅ PASS' : '❌ FAIL', login.message);
    if (login.details) {
      console.log('Details:', JSON.stringify(login.details, null, 2));
    }
    console.log('');

    const passed = [healthCheck, registration, login].filter(r => r.success).length;
    console.log(`\n📊 Results: ${passed}/3 tests passed`);
    
    return {
      totalTests: 3,
      passed,
      failed: 3 - passed,
      results: [healthCheck, registration, login],
    };
  } else {
    console.log('⚠️  Skipping login test due to registration failure');
    const passed = [healthCheck, registration].filter(r => r.success).length;
    console.log(`\n📊 Results: ${passed}/2 tests passed`);
    
    return {
      totalTests: 3,
      passed,
      failed: 3 - passed,
      results: [healthCheck, registration],
    };
  }
}
