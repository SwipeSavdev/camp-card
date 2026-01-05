# Camp Card Web - Backend API Connection Guide

##  API Endpoint Mapping

### Current Implementation Status

All pages are set up to call backend APIs using the centralized `api.ts` utility. Here's the complete mapping:

---

##  API Endpoints & Integration

### 1. Users Endpoint
**File**: `/app/users/page.tsx`
```
GET /users
 Called by: api.getUsers(session)
 Response: { content: User[] }
 Auth: Bearer token in header
 Displays: Table with users list
```

**Expected Response**:
```json
{
 "content": [
 {
 "id": "uuid",
 "email": "user@example.com",
 "full_name": "User Name",
 "role": "CUSTOMER|LEADER|SCOUT"
 }
 ]
}
```

**Integration Status**: **Ready to Connect**

---

### 2. Merchants Endpoint
**File**: `/app/merchants/page.tsx`
```
GET /merchants
 Called by: api.getMerchants(session)
 Response: { content: Merchant[] }
 Auth: Bearer token in header
 Displays: Merchants table
```

**Expected Response**:
```json
{
 "content": [
 {
 "id": "uuid",
 "name": "Merchant Name",
 "email": "merchant@example.com",
 "category": "Category Name",
 "status": "active|inactive"
 }
 ]
}
```

**Integration Status**: **Ready to Connect**

---

### 3. Offers Endpoint
**File**: `/app/offers/page.tsx`
```
GET /offers
 Called by: api.getOffers(session)
 Response: { content: Offer[] }
 Auth: Bearer token in header
 Displays: Offers table
```

**Expected Response**:
```json
{
 "content": [
 {
 "id": "uuid",
 "title": "Offer Title",
 "description": "Offer Description",
 "discount_percentage": 15,
 "active": true
 }
 ]
}
```

**Integration Status**: **Ready to Connect**

---

### 4. Categories Endpoint
**File**: `/app/categories/page.tsx`
```
GET /categories
 Called by: api.getCategories(session)
 Response: { content: Category[] }
 Auth: Bearer token in header
 Displays: Categories table
```

**Expected Response**:
```json
{
 "content": [
 {
 "id": "uuid",
 "name": "Category Name",
 "description": "Category Description",
 "active": true
 }
 ]
}
```

**Integration Status**: **Ready to Connect**

---

## Authentication & Headers

### Request Headers
All API calls include:
```
Content-Type: application/json
Authorization: Bearer {session.user.accessToken}
```

### Session Structure Expected
```typescript
interface Session {
 user?: {
 email?: string;
 name?: string;
 accessToken?: string; // Required for API calls
 [key: string]: any;
 };
 expires: string;
}
```

**Backend Requirement**: The NextAuth.js provider must return `accessToken` in the session.

---

##  API Implementation Details

### API Utility Location
**File**: `/lib/api.ts`

### Current API Methods
```typescript
export const api = {
 // Users
 getUsers: async (session?: Session | null) => {...}

 // Merchants
 getMerchants: async (session?: Session | null) => {...}
 getMerchantById: async (id: string, session?: Session | null) => {...}

 // Offers
 getOffers: async (session?: Session | null) => {...}
 getOfferById: async (id: string, session?: Session | null) => {...}

 // Categories
 getCategories: async (session?: Session | null) => {...}
 getCategoryById: async (id: string, session?: Session | null) => {...}

 // Health
 getHealth: async () => {...}
}
```

### Error Handling Pattern
```typescript
try {
 const data = await api.getUsers(session);
 setUsers(data.content || []);
} catch (err) {
 setError('Failed to load users');
 console.error('Error:', err);
}
```

---

## Connecting the Backend

### Step 1: Verify API Base URL
**Location**: Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Step 2: Test Health Endpoint
```bash
# Run this to verify backend is running
curl -X GET http://localhost:8080/health
```

### Step 3: Test API with Authentication
```bash
# Get a valid token first, then:
curl -X GET http://localhost:8080/users \
 -H "Authorization: Bearer YOUR_TOKEN_HERE" \
 -H "Content-Type: application/json"
```

### Step 4: Verify Response Format
Backend API responses **must** follow this format:
```json
{
 "content": [
 { /* item data */ }
 ]
}
```

 **Important**: Response must have a `content` field containing an array

---

## Testing API Integration

### Unit Test (Test in browser console)
```javascript
// After logging in, run in console:
const session = getSession(); // Get current session
const users = await fetch('http://localhost:8080/users', {
 headers: {
 'Authorization': `Bearer ${session.user.accessToken}`
 }
}).then(r => r.json());
console.log(users);
```

### Integration Test (Via the UI)
1. Login to the application
2. Navigate to `/users` page
3. Open DevTools (F12)  Network tab
4. Observe the GET `/users` request
5. Check response has `content` array
6. Verify data displays in table

---

## API Response Examples

### Users Response
```json
{
 "content": [
 {
 "id": "550e8400-e29b-41d4-a716-446655440001",
 "email": "john@example.com",
 "full_name": "John Doe",
 "role": "CUSTOMER"
 },
 {
 "id": "550e8400-e29b-41d4-a716-446655440002",
 "email": "jane@example.com",
 "full_name": "Jane Smith",
 "role": "LEADER"
 }
 ]
}
```

### Merchants Response
```json
{
 "content": [
 {
 "id": "550e8400-e29b-41d4-a716-446655440001",
 "name": "Pizza Palace",
 "email": "info@pizzapalace.com",
 "category": "Food & Beverage",
 "status": "active"
 },
 {
 "id": "550e8400-e29b-41d4-a716-446655440002",
 "name": "Retail Store",
 "email": "info@retail.com",
 "category": "Retail",
 "status": "inactive"
 }
 ]
}
```

### Offers Response
```json
{
 "content": [
 {
 "id": "550e8400-e29b-41d4-a716-446655440001",
 "title": "Summer Sale",
 "description": "20% off on all items",
 "discount_percentage": 20,
 "active": true
 },
 {
 "id": "550e8400-e29b-41d4-a716-446655440002",
 "title": "Member Discount",
 "description": "15% off for members",
 "discount_percentage": 15,
 "active": false
 }
 ]
}
```

### Categories Response
```json
{
 "content": [
 {
 "id": "550e8400-e29b-41d4-a716-446655440001",
 "name": "Food & Beverage",
 "description": "Restaurants and food establishments",
 "active": true
 },
 {
 "id": "550e8400-e29b-41d4-a716-446655440002",
 "name": "Retail",
 "description": "Clothing and retail stores",
 "active": true
 }
 ]
}
```

---

##  Workflow: Adding New API Endpoints

If you need to add more API endpoints, follow this pattern:

### 1. Add to API Utility (`lib/api.ts`)
```typescript
export const api = {
 // ... existing methods ...

 // New endpoint
 getNewEndpoint: async (session?: Session | null) => {
 try {
 return await apiCall<any>('/new-endpoint', {}, session);
 } catch (error) {
 console.error('Failed to fetch new endpoint:', error);
 return { content: [] };
 }
 },
};
```

### 2. Update Page to Use It
```typescript
import { api } from '@/lib/api';

const [data, setData] = useState([]);

useEffect(() => {
 if (session) {
 fetchData();
 }
}, [session]);

const fetchData = async () => {
 try {
 setLoading(true);
 const result = await api.getNewEndpoint(session);
 setData(result.content || []);
 } catch (err) {
 setError('Failed to load data');
 } finally {
 setLoading(false);
 }
};
```

### 3. Test in Browser
- Navigate to page
- Open DevTools Network tab
- Verify request is made
- Check response in DevTools

---

## Common Backend Issues & Solutions

### Issue: 401 Unauthorized
**Cause**: Token missing or invalid
**Solution**:
- Verify `accessToken` in session
- Check token not expired
- Ensure backend validates token correctly

### Issue: 404 Not Found
**Cause**: Endpoint doesn't exist on backend
**Solution**:
- Verify API endpoint path is correct
- Check backend API is running
- Confirm backend routes are set up

### Issue: 500 Server Error
**Cause**: Backend error processing request
**Solution**:
- Check backend logs
- Verify request format matches API spec
- Check data validation on backend

### Issue: CORS Error
**Cause**: Cross-origin request blocked
**Solution**:
- Configure CORS on backend
- Allow `http://localhost:3001` origin
- Add proper headers to responses

### Issue: Response has wrong format
**Cause**: API returns different structure than expected
**Solution**:
- Update expected response type
- Modify API method to handle response
- Check if response structure is wrapped differently

---

## API Status Dashboard

| Endpoint | Method | Status | Page | Ready |
|----------|--------|--------|------|-------|
| /users | GET |  | /users | |
| /merchants | GET |  | /merchants | |
| /merchants/{id} | GET |  | (prepared) | |
| /offers | GET |  | /offers | |
| /offers/{id} | GET |  | (prepared) | |
| /categories | GET |  | /categories | |
| /categories/{id} | GET |  | (prepared) | |
| /health | GET |  | (health check) | |

---

## Next Steps for Backend Team

### Immediate Actions
1. Implement GET endpoints for all four main resources
2. Ensure responses follow the `{ content: [...] }` format
3. Test endpoints with Bearer token authentication
4. Verify CORS headers allow localhost:3001

### Future Implementation
- [ ] POST endpoints for creating new records
- [ ] PUT/PATCH endpoints for updating records
- [ ] DELETE endpoints for removing records
- [ ] Search/filter parameters
- [ ] Pagination support
- [ ] Error response standardization

---

## Testing Checklist

### Backend Development
- [ ] All endpoints implemented
- [ ] Response format matches specification
- [ ] Authentication working
- [ ] CORS configured
- [ ] Error handling implemented

### Frontend Integration
- [ ] API calls working
- [ ] Data displaying correctly
- [ ] Error messages showing
- [ ] Loading states working
- [ ] No console errors

### End-to-End
- [ ] Login and access dashboard
- [ ] Navigate to Users page
- [ ] Verify users list loading
- [ ] Check all columns displaying
- [ ] Repeat for other pages
- [ ] Test error scenarios

---

##  Support & Debugging

### Check API in Real-time
```bash
# Terminal 1: Start backend
cd /path/to/backend
npm run start # or your start command

# Terminal 2: Monitor API calls
cd /path/to/web
npm run dev

# Terminal 3: Test endpoints
curl -H "Authorization: Bearer TOKEN" \
 http://localhost:8080/users
```

### Browser DevTools Debugging
1. Open browser (Chrome/Firefox/Safari)
2. Press F12 to open DevTools
3. Go to Network tab
4. Navigate to API-dependent page
5. Check requests and responses
6. Verify status codes and data

---

**Last Updated**: 2024-12-27
**Version**: 1.0
**Status**: Ready for Backend Integration
