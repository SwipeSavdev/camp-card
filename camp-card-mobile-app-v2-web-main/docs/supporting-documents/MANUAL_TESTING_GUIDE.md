# Camp Card Web - Manual Testing Guide

## Getting Started

### Prerequisites
- Node.js installed
- Development server running on http://localhost:3001
- Backend API running on http://localhost:8080 (or configured endpoint)

### Quick Start
```bash
# Navigate to the web app directory
cd repos/camp-card-web

# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Server runs on http://localhost:3001
```

---

## Testing Checklist

### 1. Authentication Flow
- [ ] Visit http://localhost:3001
- [ ] Verify redirect to login page
- [ ] Check login form is displayed
- [ ] Attempt login with valid credentials
- [ ] Verify redirect to dashboard after successful login
- [ ] Check user email displayed in sidebar

### 2. Navigation Sidebar
- [ ] Sidebar visible on left side
- [ ] "Camp Card" logo at top
- [ ] All menu items visible
- [ ] Icons display correctly for each item
- [ ] Current page highlighted
- [ ] Click each menu item to verify navigation
- [ ] Sign out button present at bottom

### 3. Dashboard Page (`/dashboard`)
- [ ] Page loads without errors
- [ ] Title "Dashboard" displayed
- [ ] Statistics cards visible
- [ ] All stat cards have values
- [ ] Page layout matches design
- [ ] No console errors

### 4. Users Page (`/users`)
- [ ] Page loads and shows "Manage Users"
- [ ] Table headers: Name, Email, Role, Actions
- [ ] User data loads from API (if backend connected)
- [ ] Role badges show with correct colors:
 - [ ] CUSTOMER = Green (#F0F8E8)
 - [ ] LEADER = Orange (#F8F0E8)
 - [ ] SCOUT = Blue (#E8F0F8)
- [ ] Edit button present for each row
- [ ] Delete button present for each row
- [ ] "Add New User" button visible at top
- [ ] Empty state message if no users exist
- [ ] Loading state appears while fetching

### 5. Merchants Page (`/merchants`)
- [ ] Page loads and shows "Manage Merchants"
- [ ] Table headers: Name, Email, Category, Status, Actions
- [ ] Merchant data displays correctly
- [ ] Status badge shows "active" or "inactive"
- [ ] Active status = Green background
- [ ] Inactive status = Gray background
- [ ] "Add Merchant" button visible
- [ ] Edit/Delete buttons functional
- [ ] Error handling if API fails

### 6. Offers Page (`/offers`)
- [ ] Page loads and shows "Manage Offers"
- [ ] Table headers: Title, Description, Discount, Status, Actions
- [ ] Offer data displays correctly
- [ ] Discount shows as percentage (e.g., "15%")
- [ ] Status badge displays (Active/Inactive)
- [ ] "Create New Offer" button visible
- [ ] Edit/Delete buttons present
- [ ] Loading state works

### 7. Categories Page (`/categories`)
- [ ] Page loads and shows "Manage Categories"
- [ ] Table headers: Name, Description, Status, Actions
- [ ] Category data displays
- [ ] Status color coding works
- [ ] "Add Category" button visible
- [ ] Edit/Delete buttons functional
- [ ] Empty state message displays when needed

### 8. Settings Page (`/settings`)
- [ ] Page loads with "Settings" title
- [ ] Settings form displays
- [ ] Three settings visible:
 1. Application name (Camp Card)
 2. Backend API endpoint
 3. API request timeout
- [ ] Input fields editable
- [ ] "Save Settings" button functional
- [ ] Success message appears after save
- [ ] Message disappears after 3 seconds

### 9. Styling & UX
- [ ] Consistent spacing throughout
- [ ] Buttons have hover effects
- [ ] Colors match theme (navy, blue, red, green)
- [ ] Text is readable with good contrast
- [ ] Tables are clean and organized
- [ ] No layout issues on various screen sizes
- [ ] Responsive design works on mobile (check DevTools)

### 10. Error Handling
- [ ] Disconnect backend API
- [ ] Try to load data pages
- [ ] Error message displays
- [ ] Page doesn't crash
- [ ] Retry functionality works
- [ ] Log out and back in
- [ ] Previous errors clear

### 11. API Integration
- [ ] Check browser Network tab
- [ ] Verify API calls being made
- [ ] Correct endpoints are called:
 - [ ] GET /users
 - [ ] GET /merchants
 - [ ] GET /offers
 - [ ] GET /categories
- [ ] Authorization header includes Bearer token
- [ ] Response data properly displayed in tables
- [ ] No 401/403 errors with valid token

### 12. Data Display
- [ ] Tables show correct number of columns
- [ ] Data aligns properly in columns
- [ ] Long text truncates or wraps appropriately
- [ ] Status badges display correctly
- [ ] All data from API visible
- [ ] No missing fields

### 13. Forms & Inputs
- [ ] Input fields are properly styled
- [ ] Focus states visible (blue border)
- [ ] Placeholder text visible
- [ ] Can type in all inputs
- [ ] Settings form saves values temporarily

### 14. Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] No console errors in any browser
- [ ] Layout correct in all browsers

---

##  Detailed Test Scenarios

### Scenario 1: First Time User
1. Open http://localhost:3001
2. Should redirect to login
3. Login with credentials
4. Land on dashboard
5. Navigate to each page using sidebar
6. Check that sidebar stays visible
7. Log out and verify redirect to login

### Scenario 2: Data Loading
1. Go to Users page
2. Observe loading state
3. Wait for data to load
4. Verify table populates with data
5. Check that each column has data
6. Go to another page
7. Verify similar loading behavior

### Scenario 3: API Error Handling
1. Stop backend API server
2. Try to load Users page
3. Should show "Failed to load users"
4. Error message visible and styled
5. Can still navigate to other pages
6. Restart API server
7. Refresh page - data loads successfully

### Scenario 4: Table Interactions
1. On any table page (Users/Merchants/Offers/Categories)
2. Hover over Edit button - should change color
3. Hover over Delete button - should change color
4. Click Edit button - button is clickable
5. Click Delete button - button is clickable
6. Hover over "Add" button - color changes
7. All buttons are accessible via keyboard

### Scenario 5: Settings Changes
1. Go to Settings page
2. Change "Application name" field
3. Change "API endpoint" field
4. Click "Save Settings" button
5. Success message appears
6. Message disappears after 3 seconds
7. Values remain in form (session state)

---

## Debugging Tips

### Check Console Errors
```javascript
// Open browser DevTools (F12)
// Go to Console tab
// Look for any red error messages
```

### Check Network Requests
```
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests
5. Check request/response headers
6. Verify Authorization header present
```

### Check API Response Format
```json
// Expected response format:
{
 "content": [
 {
 "id": "123",
 "name": "Example",
 // other fields
 }
 ]
}
```

### Common Issues & Solutions

**Issue**: "Failed to load users" message
- **Solution**: Check backend API is running on correct port
- **Solution**: Verify API endpoint in Settings
- **Solution**: Check Authorization header in network tab

**Issue**: Sidebar not displaying
- **Solution**: Clear browser cache
- **Solution**: Check if AdminLayout component imported correctly
- **Solution**: Verify not in mobile view

**Issue**: Buttons not working
- **Solution**: Check browser console for errors
- **Solution**: Verify event handlers are bound
- **Solution**: Check CSS for pointer-events issues

**Issue**: Styling looks wrong
- **Solution**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- **Solution**: Clear Next.js cache: `rm -rf .next`
- **Solution**: Restart dev server

---

## Performance Testing

### Page Load Times (Target: < 2 seconds)
- [ ] Dashboard loads in < 2s
- [ ] Users page loads in < 2s
- [ ] Merchants page loads in < 2s
- [ ] Offers page loads in < 2s
- [ ] Categories page loads in < 2s
- [ ] Settings page loads in < 1s (no API call)

### API Response Times (Target: < 1 second)
- [ ] GET /users responds in < 1s
- [ ] GET /merchants responds in < 1s
- [ ] GET /offers responds in < 1s
- [ ] GET /categories responds in < 1s

### Resource Usage
- Check Network tab
- [ ] No excessive file sizes
- [ ] No duplicate requests
- [ ] Caching working properly

---

## Sign-Off Checklist

### Core Functionality
- [ ] All pages load without errors
- [ ] Navigation works between all pages
- [ ] Authentication required and working
- [ ] API calls made with proper auth headers
- [ ] Data displays correctly

### User Experience
- [ ] Consistent design across all pages
- [ ] Clear visual hierarchy
- [ ] Good readability
- [ ] Intuitive navigation
- [ ] Helpful error messages

### Technical Quality
- [ ] No console errors
- [ ] TypeScript builds without errors
- [ ] API integration working
- [ ] No memory leaks
- [ ] Performance acceptable

### Ready for Production?
- [ ] All tests passed
- [ ] Backend API ready
- [ ] Environment variables set
- [ ] Error handling complete
- [ ] Documentation updated

---

##  Support

If you encounter issues:

1. **Check the error message** - Read it carefully, it often tells you what's wrong
2. **Check the browser console** (F12) - Look for detailed error info
3. **Check the Network tab** - Verify API calls and responses
4. **Check the backend API** - Verify it's running and responding
5. **Verify authentication** - Check that you're logged in properly

---

**Last Updated**: 2024-12-27
**Version**: 1.0
**Status**: Ready for Manual Testing
