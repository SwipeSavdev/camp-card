// Shared mock data service for both web and mobile apps
// This ensures consistent data across platforms

export const mockUsers = {
 content: [
 // Admins
 { id: '1', email: 'admin@campcard.com', firstName: 'Sarah', lastName: 'Johnson', role: 'ADMIN', status: 'ACTIVE', createdAt: '2024-01-15' },
 { id: '2', email: 'admin2@campcard.com', firstName: 'Michael', lastName: 'Chen', role: 'ADMIN', status: 'ACTIVE', createdAt: '2024-01-20' },

 // Council Admins
 { id: '3', email: 'council1@bsa.org', firstName: 'David', lastName: 'Williams', role: 'COUNCIL_ADMIN', status: 'ACTIVE', createdAt: '2024-02-01' },
 { id: '4', email: 'council2@bsa.org', firstName: 'Jennifer', lastName: 'Martinez', role: 'COUNCIL_ADMIN', status: 'ACTIVE', createdAt: '2024-02-05' },
 { id: '5', email: 'council3@bsa.org', firstName: 'Robert', lastName: 'Taylor', role: 'COUNCIL_ADMIN', status: 'ACTIVE', createdAt: '2024-02-10' },
 { id: '6', email: 'council4@bsa.org', firstName: 'Patricia', lastName: 'Anderson', role: 'COUNCIL_ADMIN', status: 'ACTIVE', createdAt: '2024-02-15' },
 { id: '7', email: 'council5@bsa.org', firstName: 'James', lastName: 'Brown', role: 'COUNCIL_ADMIN', status: 'ACTIVE', createdAt: '2024-02-20' },

 // Troop Leaders
 { id: '8', email: 'leader1@troop.org', firstName: 'Lisa', lastName: 'Garcia', role: 'TROOP_LEADER', status: 'ACTIVE', createdAt: '2024-03-01' },
 { id: '9', email: 'leader2@troop.org', firstName: 'John', lastName: 'Davis', role: 'TROOP_LEADER', status: 'ACTIVE', createdAt: '2024-03-05' },
 { id: '10', email: 'leader3@troop.org', firstName: 'Maria', lastName: 'Rodriguez', role: 'TROOP_LEADER', status: 'ACTIVE', createdAt: '2024-03-10' },
 { id: '11', email: 'leader4@troop.org', firstName: 'Christopher', lastName: 'Lee', role: 'TROOP_LEADER', status: 'ACTIVE', createdAt: '2024-03-15' },
 { id: '12', email: 'leader5@troop.org', firstName: 'Amanda', lastName: 'White', role: 'TROOP_LEADER', status: 'ACTIVE', createdAt: '2024-03-20' },
 { id: '13', email: 'leader6@troop.org', firstName: 'Kevin', lastName: 'Harris', role: 'TROOP_LEADER', status: 'ACTIVE', createdAt: '2024-03-25' },
 { id: '14', email: 'leader7@troop.org', firstName: 'Elizabeth', lastName: 'Clark', role: 'TROOP_LEADER', status: 'ACTIVE', createdAt: '2024-04-01' },
 { id: '15', email: 'leader8@troop.org', firstName: 'Daniel', lastName: 'Lewis', role: 'TROOP_LEADER', status: 'ACTIVE', createdAt: '2024-04-05' },
 { id: '16', email: 'leader9@troop.org', firstName: 'Jessica', lastName: 'Walker', role: 'TROOP_LEADER', status: 'ACTIVE', createdAt: '2024-04-10' },
 { id: '17', email: 'leader10@troop.org', firstName: 'Ryan', lastName: 'Hall', role: 'TROOP_LEADER', status: 'ACTIVE', createdAt: '2024-04-15' },

 // Scouts
 { id: '18', email: 'scout1@scout.org', firstName: 'Emily', lastName: 'Thompson', role: 'SCOUT', status: 'ACTIVE', createdAt: '2024-05-01' },
 { id: '19', email: 'scout2@scout.org', firstName: 'Lucas', lastName: 'Green', role: 'SCOUT', status: 'ACTIVE', createdAt: '2024-05-05' },
 { id: '20', email: 'scout3@scout.org', firstName: 'Olivia', lastName: 'Adams', role: 'SCOUT', status: 'ACTIVE', createdAt: '2024-05-10' },
 { id: '21', email: 'scout4@scout.org', firstName: 'Ethan', lastName: 'Nelson', role: 'SCOUT', status: 'ACTIVE', createdAt: '2024-05-15' },
 { id: '22', email: 'scout5@scout.org', firstName: 'Sophia', lastName: 'Carter', role: 'SCOUT', status: 'ACTIVE', createdAt: '2024-05-20' },
 ...Array.from({ length: 75 }, (_, i) => ({
 id: `${23 + i}`,
 email: `user${23 + i}@campcard.com`,
 firstName: `User${23 + i}`,
 lastName: 'Demo',
 role: ['SCOUT', 'CUSTOMER', 'COUNCIL_ADMIN'][i % 3],
 status: i % 20 === 0 ? 'INACTIVE' : 'ACTIVE',
 createdAt: `2024-${String((i % 10) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
 })),
 ],
};

export const mockCouncils = {
 content: [
 { id: '1', name: 'Central Florida Council', city: 'Orlando', state: 'FL', scouts: 450, status: 'ACTIVE', createdAt: '2024-01-01' },
 { id: '2', name: 'Orange County Council', city: 'Anaheim', state: 'CA', scouts: 380, status: 'ACTIVE', createdAt: '2024-01-05' },
 { id: '3', name: 'Dallas Area Council', city: 'Dallas', state: 'TX', scouts: 520, status: 'ACTIVE', createdAt: '2024-01-10' },
 { id: '4', name: 'Georgia-Carolina Council', city: 'Atlanta', state: 'GA', scouts: 410, status: 'ACTIVE', createdAt: '2024-01-15' },
 { id: '5', name: 'Greater New York Councils', city: 'New York', state: 'NY', scouts: 600, status: 'ACTIVE', createdAt: '2024-01-20' },
 { id: '6', name: 'Chicago Area Council', city: 'Chicago', state: 'IL', scouts: 480, status: 'ACTIVE', createdAt: '2024-01-25' },
 { id: '7', name: 'Pacific Skyline Council', city: 'San Francisco', state: 'CA', scouts: 390, status: 'ACTIVE', createdAt: '2024-02-01' },
 { id: '8', name: 'Rocky Mountain Council', city: 'Denver', state: 'CO', scouts: 350, status: 'ACTIVE', createdAt: '2024-02-05' },
 { id: '9', name: 'Washington Area Council', city: 'Washington', state: 'DC', scouts: 420, status: 'ACTIVE', createdAt: '2024-02-10' },
 { id: '10', name: 'Greater Boston Council', city: 'Boston', state: 'MA', scouts: 370, status: 'ACTIVE', createdAt: '2024-02-15' },
 ],
};

export const mockTroops = {
 content: Array.from({ length: 300 }, (_, i) => {
 const councilId = (i % 10) + 1;
 const councilNames = ['Central Florida', 'Orange County', 'Dallas Area', 'Georgia-Carolina', 'Greater New York', 'Chicago Area', 'Pacific Skyline', 'Rocky Mountain', 'Washington Area', 'Greater Boston'];
 return {
 id: `${i + 1}`,
 number: `${(i % 100) + 1}`,
 name: `Troop ${(i % 100) + 1}`,
 council: councilNames[councilId - 1],
 scouts: Math.floor(Math.random() * 50) + 10,
 status: i % 15 === 0 ? 'INACTIVE' : 'ACTIVE',
 createdAt: `2024-${String((i % 10) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
 };
 }),
};

export const mockMerchants = {
 content: [
 // Pizza Chains (HQ + locations)
 { id: '1', name: 'Pizza Palace HQ', type: 'HQ', category: 'DINING', city: 'Orlando', state: 'FL', locations: 8, status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Pizza+Palace' },
 { id: '2', name: 'Pizza Palace - Downtown', type: 'LOCATION', parentId: '1', category: 'DINING', city: 'Orlando', state: 'FL', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Downtown' },
 { id: '3', name: 'Pizza Palace - Mall', type: 'LOCATION', parentId: '1', category: 'DINING', city: 'Orlando', state: 'FL', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Mall' },
 { id: '4', name: 'Pizza Palace - Beach', type: 'LOCATION', parentId: '1', category: 'DINING', city: 'Daytona', state: 'FL', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Beach' },
 { id: '5', name: 'Pizza Palace - Winter Park', type: 'LOCATION', parentId: '1', category: 'DINING', city: 'Winter Park', state: 'FL', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Winter+Park' },
 { id: '6', name: 'Pizza Palace - Lake Buena Vista', type: 'LOCATION', parentId: '1', category: 'DINING', city: 'Lake Buena Vista', state: 'FL', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=LBV' },
 { id: '7', name: 'Pizza Palace - Kissimmee', type: 'LOCATION', parentId: '1', category: 'DINING', city: 'Kissimmee', state: 'FL', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Kissimmee' },
 { id: '8', name: 'Pizza Palace - Altamonte Springs', type: 'LOCATION', parentId: '1', category: 'DINING', city: 'Altamonte Springs', state: 'FL', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Altamonte' },
 { id: '9', name: 'Pizza Palace - Sanford', type: 'LOCATION', parentId: '1', category: 'DINING', city: 'Sanford', state: 'FL', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Sanford' },

 // Burger Chains
 { id: '10', name: 'Burger Barn HQ', type: 'HQ', category: 'DINING', city: 'Dallas', state: 'TX', locations: 6, status: 'ACTIVE', image: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Burger+Barn' },
 { id: '11', name: 'Burger Barn - Downtown Dallas', type: 'LOCATION', parentId: '10', category: 'DINING', city: 'Dallas', state: 'TX', status: 'ACTIVE', image: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Downtown' },
 { id: '12', name: 'Burger Barn - Uptown', type: 'LOCATION', parentId: '10', category: 'DINING', city: 'Dallas', state: 'TX', status: 'ACTIVE', image: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Uptown' },
 { id: '13', name: 'Burger Barn - Arlington', type: 'LOCATION', parentId: '10', category: 'DINING', city: 'Arlington', state: 'TX', status: 'ACTIVE', image: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Arlington' },
 { id: '14', name: 'Burger Barn - Fort Worth', type: 'LOCATION', parentId: '10', category: 'DINING', city: 'Fort Worth', state: 'TX', status: 'ACTIVE', image: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Fort+Worth' },
 { id: '15', name: 'Burger Barn - Irving', type: 'LOCATION', parentId: '10', category: 'DINING', city: 'Irving', state: 'TX', status: 'ACTIVE', image: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Irving' },
 { id: '16', name: 'Burger Barn - Plano', type: 'LOCATION', parentId: '10', category: 'DINING', city: 'Plano', state: 'TX', status: 'ACTIVE', image: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Plano' },

 // Movie Theaters
 { id: '17', name: 'CinemaMax Entertainment HQ', type: 'HQ', category: 'ENTERTAINMENT', city: 'Los Angeles', state: 'CA', locations: 5, status: 'ACTIVE', image: 'https://via.placeholder.com/150/95E1D3/FFFFFF?text=CinemaMax' },
 { id: '18', name: 'CinemaMax - Downtown LA', type: 'LOCATION', parentId: '17', category: 'ENTERTAINMENT', city: 'Los Angeles', state: 'CA', status: 'ACTIVE', image: 'https://via.placeholder.com/150/95E1D3/FFFFFF?text=Downtown' },
 { id: '19', name: 'CinemaMax - Santa Monica', type: 'LOCATION', parentId: '17', category: 'ENTERTAINMENT', city: 'Santa Monica', state: 'CA', status: 'ACTIVE', image: 'https://via.placeholder.com/150/95E1D3/FFFFFF?text=Santa+Monica' },
 { id: '20', name: 'CinemaMax - Pasadena', type: 'LOCATION', parentId: '17', category: 'ENTERTAINMENT', city: 'Pasadena', state: 'CA', status: 'ACTIVE', image: 'https://via.placeholder.com/150/95E1D3/FFFFFF?text=Pasadena' },
 { id: '21', name: 'CinemaMax - Long Beach', type: 'LOCATION', parentId: '17', category: 'ENTERTAINMENT', city: 'Long Beach', state: 'CA', status: 'ACTIVE', image: 'https://via.placeholder.com/150/95E1D3/FFFFFF?text=Long+Beach' },
 { id: '22', name: 'CinemaMax - Anaheim', type: 'LOCATION', parentId: '17', category: 'ENTERTAINMENT', city: 'Anaheim', state: 'CA', status: 'ACTIVE', image: 'https://via.placeholder.com/150/95E1D3/FFFFFF?text=Anaheim' },

 // Retail Stores
 { id: '23', name: 'TechHub Electronics', type: 'SINGLE', category: 'RETAIL', city: 'New York', state: 'NY', status: 'ACTIVE', image: 'https://via.placeholder.com/150/A8E6CF/FFFFFF?text=TechHub' },
 { id: '24', name: 'Fashion Forward Boutique', type: 'SINGLE', category: 'RETAIL', city: 'Miami', state: 'FL', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FFD3B6/FFFFFF?text=Fashion' },
 { id: '25', name: 'Sports Authority', type: 'SINGLE', category: 'RETAIL', city: 'Chicago', state: 'IL', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FFAAA5/FFFFFF?text=Sports' },

 // Auto Services
 { id: '26', name: 'QuickLube Express HQ', type: 'HQ', category: 'AUTO', city: 'Houston', state: 'TX', locations: 4, status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF8B94/FFFFFF?text=QuickLube' },
 { id: '27', name: 'QuickLube - Downtown Houston', type: 'LOCATION', parentId: '26', category: 'AUTO', city: 'Houston', state: 'TX', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF8B94/FFFFFF?text=Downtown' },
 { id: '28', name: 'QuickLube - Midtown', type: 'LOCATION', parentId: '26', category: 'AUTO', city: 'Houston', state: 'TX', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF8B94/FFFFFF?text=Midtown' },
 { id: '29', name: 'QuickLube - Pearland', type: 'LOCATION', parentId: '26', category: 'AUTO', city: 'Pearland', state: 'TX', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF8B94/FFFFFF?text=Pearland' },
 { id: '30', name: 'QuickLube - The Woodlands', type: 'LOCATION', parentId: '26', category: 'AUTO', city: 'The Woodlands', state: 'TX', status: 'ACTIVE', image: 'https://via.placeholder.com/150/FF8B94/FFFFFF?text=Woodlands' },

 // Additional single locations to reach 100
 ...Array.from({ length: 70 }, (_, i) => ({
 id: `${31 + i}`,
 name: `Merchant ${31 + i}`,
 type: 'SINGLE',
 category: ['DINING', 'RETAIL', 'ENTERTAINMENT', 'AUTO', 'SERVICES'][i % 5],
 city: ['Orlando', 'Dallas', 'Los Angeles', 'Chicago', 'New York'][i % 5],
 state: ['FL', 'TX', 'CA', 'IL', 'NY'][i % 5],
 status: i % 25 === 0 ? 'INACTIVE' : 'ACTIVE',
 image: `https://via.placeholder.com/150/${['FF6B6B', '4ECDC4', '95E1D3', 'A8E6CF', 'FFD3B6'][i % 5]}/FFFFFF?text=Merchant+${31 + i}`,
 })),
 ],
};

export const mockOffers = {
 content: [
 // 1x Use Offers
 { id: '1', title: '20% off Pizza', description: 'Get 20% off any pizza at Pizza Palace', merchant: 'Pizza Palace', category: 'DINING', type: '1X_USE', discount: '20%', value: '$5-15', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=20%25+off+Pizza', barcode: '5901234123457', redemptions: 342, expiryDate: '2025-06-30' },
 { id: '2', title: 'Free Large Drink', description: 'Get a free large drink with any meal', merchant: 'Burger Barn', category: 'DINING', type: '1X_USE', discount: 'Free Item', value: '$4-6', status: 'ACTIVE', image: 'https://via.placeholder.com/200/4ECDC4/FFFFFF?text=Free+Drink', barcode: '5901234123458', redemptions: 287, expiryDate: '2025-06-30' },
 { id: '3', title: '$10 off Movie Tickets', description: 'Save $10 on any movie ticket purchase', merchant: 'CinemaMax', category: 'ENTERTAINMENT', type: '1X_USE', discount: '$10', value: '$10-20', status: 'ACTIVE', image: 'https://via.placeholder.com/200/95E1D3/FFFFFF?text=%2410+Movies', barcode: '5901234123459', redemptions: 156, expiryDate: '2025-07-15' },
 { id: '4', title: 'Buy 1 Get 1 Half Off Pizza', description: 'Buy one pizza, get second pizza 50% off', merchant: 'Pizza Palace', category: 'DINING', type: '1X_USE', discount: '50% 2nd Item', value: '$10-20', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=BOGO+50', barcode: '5901234123460', redemptions: 89, expiryDate: '2025-05-31' },
 { id: '5', title: 'Free Oil Change', description: 'Get a free oil change with fluid top-up', merchant: 'QuickLube Express', category: 'AUTO', type: '1X_USE', discount: 'Free Service', value: '$35-50', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FF8B94/FFFFFF?text=Oil+Change', barcode: '5901234123461', redemptions: 124, expiryDate: '2025-08-30' },
 { id: '6', title: 'Free Dessert', description: 'Get a free dessert with meal purchase', merchant: 'Pizza Palace', category: 'DINING', type: '1X_USE', discount: 'Free Item', value: '$4-8', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=Dessert', barcode: '5901234123462', redemptions: 198, expiryDate: '2025-06-15' },
 { id: '7', title: '2 for 1 Combo Deal', description: 'Buy one combo, get second free', merchant: 'Burger Barn', category: 'DINING', type: '1X_USE', discount: 'Buy 1 Get 1', value: '$12-18', status: 'ACTIVE', image: 'https://via.placeholder.com/200/4ECDC4/FFFFFF?text=BOGO+Combo', barcode: '5901234123463', redemptions: 267, expiryDate: '2025-07-01' },
 { id: '8', title: '$25 Gift Card', description: 'Get a $25 gift card for electronics', merchant: 'TechHub Electronics', category: 'RETAIL', type: '1X_USE', discount: '$25', value: '$25', status: 'ACTIVE', image: 'https://via.placeholder.com/200/A8E6CF/FFFFFF?text=Gift+Card', barcode: '5901234123464', redemptions: 143, expiryDate: '2025-08-31' },
 { id: '9', title: 'Free Tire Rotation', description: 'Free tire rotation service', merchant: 'QuickLube Express', category: 'AUTO', type: '1X_USE', discount: 'Free Service', value: '$20-30', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FF8B94/FFFFFF?text=Tire+Rotation', barcode: '5901234123465', redemptions: 78, expiryDate: '2025-09-30' },
 { id: '10', title: 'Buy 2 Get 1 Free Shirts', description: 'Buy 2 shirts, get 1 free', merchant: 'Fashion Forward Boutique', category: 'RETAIL', type: '1X_USE', discount: 'Buy 2 Get 1', value: '$30-50', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FFD3B6/FFFFFF?text=Clothing', barcode: '5901234123466', redemptions: 112, expiryDate: '2025-07-30' },
 { id: '11', title: 'Free Appetizer', description: 'Get a free appetizer with entree purchase', merchant: 'Pizza Palace', category: 'DINING', type: '1X_USE', discount: 'Free Item', value: '$5-10', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=Appetizer', barcode: '5901234123467', redemptions: 234, expiryDate: '2025-06-30' },
 { id: '12', title: 'Free Movie Concession', description: '$15 free concession with movie ticket', merchant: 'CinemaMax', category: 'ENTERTAINMENT', type: '1X_USE', discount: 'Free Item', value: '$15', status: 'ACTIVE', image: 'https://via.placeholder.com/200/95E1D3/FFFFFF?text=Popcorn', barcode: '5901234123468', redemptions: 189, expiryDate: '2025-08-15' },

 // Reusable Offers
 { id: '13', title: '$5 off Any Purchase', description: 'Get $5 off any purchase (reusable)', merchant: 'TechHub Electronics', category: 'RETAIL', type: 'REUSABLE', discount: '$5 off', value: '$5+', status: 'ACTIVE', image: 'https://via.placeholder.com/200/A8E6CF/FFFFFF?text=Save+%245', barcode: '5901234223460', redemptions: 467, expiryDate: '2025-12-31' },
 { id: '14', title: '10% off Total Bill', description: 'Get 10% off your total bill (reusable)', merchant: 'Pizza Palace', category: 'DINING', type: 'REUSABLE', discount: '10%', value: '10% off', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=10%25+off', barcode: '5901234223461', redemptions: 892, expiryDate: '2025-12-31' },
 { id: '15', title: '15% off Entire Order', description: 'Scout discount - 15% off any order', merchant: 'Burger Barn', category: 'DINING', type: 'REUSABLE', discount: '15%', value: '15% off', status: 'ACTIVE', image: 'https://via.placeholder.com/200/4ECDC4/FFFFFF?text=15%25+off', barcode: '5901234223462', redemptions: 654, expiryDate: '2025-12-31' },
 { id: '16', title: 'Free Small Popcorn', description: 'Free small popcorn with ticket purchase (reusable)', merchant: 'CinemaMax', category: 'ENTERTAINMENT', type: 'REUSABLE', discount: 'Free Item', value: '$3-5', status: 'ACTIVE', image: 'https://via.placeholder.com/200/95E1D3/FFFFFF?text=Popcorn', barcode: '5901234223463', redemptions: 423, expiryDate: '2025-09-30' },
 { id: '17', title: '$3 off Any Coffee', description: 'Scout special - $3 off any coffee drink', merchant: 'Coffee & Co', category: 'DINING', type: 'REUSABLE', discount: '$3 off', value: '$3+', status: 'ACTIVE', image: 'https://via.placeholder.com/200/8B4513/FFFFFF?text=Coffee', barcode: '5901234223464', redemptions: 756, expiryDate: '2025-12-31' },
 { id: '18', title: '20% off Drinks', description: '20% off all beverages (reusable)', merchant: 'Pizza Palace', category: 'DINING', type: 'REUSABLE', discount: '20%', value: '20% off', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=Drinks', barcode: '5901234223465', redemptions: 543, expiryDate: '2025-12-31' },
 { id: '19', title: '$2 off Sides', description: 'Scout special - $2 off any side (reusable)', merchant: 'Burger Barn', category: 'DINING', type: 'REUSABLE', discount: '$2 off', value: '$2+', status: 'ACTIVE', image: 'https://via.placeholder.com/200/4ECDC4/FFFFFF?text=Sides', barcode: '5901234223466', redemptions: 678, expiryDate: '2025-12-31' },
 { id: '20', title: 'Free Upgrade to Large', description: 'Upgrade any drink to large free', merchant: 'CinemaMax', category: 'ENTERTAINMENT', type: 'REUSABLE', discount: 'Free Upgrade', value: '$1-2', status: 'ACTIVE', image: 'https://via.placeholder.com/200/95E1D3/FFFFFF?text=Large+Upgrade', barcode: '5901234223467', redemptions: 834, expiryDate: '2025-12-31' },
 { id: '21', title: '25% off Tech Accessories', description: '25% off all tech accessories (reusable)', merchant: 'TechHub Electronics', category: 'RETAIL', type: 'REUSABLE', discount: '25%', value: '25% off', status: 'ACTIVE', image: 'https://via.placeholder.com/200/A8E6CF/FFFFFF?text=Tech+Sale', barcode: '5901234223468', redemptions: 412, expiryDate: '2025-12-31' },
 { id: '22', title: '$5 off Oil Changes', description: '$5 off any oil change (reusable)', merchant: 'QuickLube Express', category: 'AUTO', type: 'REUSABLE', discount: '$5 off', value: '$5+', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FF8B94/FFFFFF?text=Oil+Special', barcode: '5901234223469', redemptions: 523, expiryDate: '2025-12-31' },
 { id: '23', title: 'Happy Hour Special', description: 'Half price drinks 4-6pm daily (reusable)', merchant: 'Burger Barn', category: 'DINING', type: 'REUSABLE', discount: '50% Drinks', value: '50% off drinks', status: 'ACTIVE', image: 'https://via.placeholder.com/200/4ECDC4/FFFFFF?text=Happy+Hour', barcode: '5901234223470', redemptions: 721, expiryDate: '2025-12-31' },
 { id: '24', title: '30% off Entire Purchase', description: '30% off entire purchase on clothing (reusable)', merchant: 'Fashion Forward Boutique', category: 'RETAIL', type: 'REUSABLE', discount: '30%', value: '30% off', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FFD3B6/FFFFFF?text=Fashion+Sale', barcode: '5901234223471', redemptions: 345, expiryDate: '2025-12-31' },
 { id: '25', title: 'Free Car Wash', description: 'Get a free basic car wash (reusable)', merchant: 'QuickLube Express', category: 'AUTO', type: 'REUSABLE', discount: 'Free Service', value: '$10-15', status: 'ACTIVE', image: 'https://via.placeholder.com/200/FF8B94/FFFFFF?text=Car+Wash', barcode: '5901234223472', redemptions: 612, expiryDate: '2025-12-31' },
 ],
};

export const mockCards = {
 content: [
 { id: '1', name: 'Emily Thompson', cardNumber: '4111111111111111', status: 'ACTIVE', issuanceMethod: 'GATEWAY_PURCHASE', createdAt: '2024-05-15', expiresAt: '2025-05-15' },
 { id: '2', name: 'Lucas Green', cardNumber: '4222222222222222', status: 'ACTIVE', issuanceMethod: 'CLAIM_LINK', claimToken: 'CLM-A3F9X2B8', createdAt: '2024-05-20', expiresAt: '2025-05-20' },
 { id: '3', name: 'Olivia Adams', cardNumber: '4333333333333333', status: 'PENDING_CLAIM', issuanceMethod: 'CLAIM_LINK', claimToken: 'CLM-B5K2Y4C9', createdAt: '2024-06-01', expiresAt: '2024-07-01' },
 { id: '4', name: 'Ethan Nelson', cardNumber: '4444444444444444', status: 'ACTIVE', issuanceMethod: 'GATEWAY_PURCHASE', createdAt: '2024-06-10', expiresAt: '2025-06-10' },
 { id: '5', name: 'Sophia Carter', cardNumber: '4555555555555555', status: 'EXPIRED', issuanceMethod: 'GATEWAY_PURCHASE', createdAt: '2023-06-15', expiresAt: '2024-06-15' },
 ...Array.from({ length: 95 }, (_, i) => ({
 id: `${6 + i}`,
 name: `Card Holder ${6 + i}`,
 cardNumber: `${4000000000000000 + (6 + i) * 111111111}`,
 status: ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING_CLAIM', 'EXPIRED'][i % 6],
 issuanceMethod: i % 3 === 0 ? 'CLAIM_LINK' : 'GATEWAY_PURCHASE',
 claimToken: i % 3 === 0 ? `CLM-${String(i).padStart(8, '0')}` : undefined,
 createdAt: `2024-${String((i % 8) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
 expiresAt: `2025-${String((i % 8) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
 })),
 ],
};
