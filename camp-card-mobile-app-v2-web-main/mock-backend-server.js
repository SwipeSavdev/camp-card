/**
 * Mock Backend API Server for Camp Card
 * Provides stub endpoints for development and testing
 * This allows the web portal to function without a full Java backend
 */

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 8080;

// Mock data store
const mockData = {
 users: [
 { id: '1', email: 'test@example.com', full_name: 'Demo Admin', role: 'ADMIN' },
 { id: '2', email: 'user@example.com', full_name: 'John Smith', role: 'CUSTOMER' },
 { id: '3', email: 'scout@example.com', full_name: 'Jane Doe', role: 'SCOUT' },
 ],
 offers: [
 { id: '1', title: 'First Offer', description: 'Test offer 1', discount_percentage: 10, active: true },
 { id: '2', title: 'Second Offer', description: 'Test offer 2', discount_percentage: 20, active: true },
 ],
 merchants: [
 { id: '1', name: 'Merchant 1', email: 'merchant1@example.com', active: true },
 ],
};

// Authentication endpoint
app.post('/auth/login', (req, res) => {
 const { email, password } = req.body;

 if (email === 'test@example.com' && password === 'password123') {
 return res.json({
 user: {
 id: '123e4567-e89b-12d3-a456-426614174000',
 email: 'test@example.com',
 full_name: 'Demo Admin',
 role: 'ADMIN',
 },
 access_token: 'mock-token-' + Date.now(),
 refresh_token: 'mock-refresh-' + Date.now(),
 });
 }

 res.status(401).json({ error: 'Invalid credentials' });
});

// Users endpoints
app.get('/users', (req, res) => {
 res.json({ content: mockData.users });
});

app.get('/users/:id', (req, res) => {
 const user = mockData.users.find(u => u.id === req.params.id);
 if (!user) return res.status(404).json({ error: 'User not found' });
 res.json(user);
});

app.post('/users', (req, res) => {
 const newUser = { id: Date.now().toString(), ...req.body };
 mockData.users.push(newUser);
 res.status(201).json(newUser);
});

// Offers endpoints
app.get('/offers', (req, res) => {
 res.json({ content: mockData.offers });
});

app.get('/offers/:id', (req, res) => {
 const offer = mockData.offers.find(o => o.id === req.params.id);
 if (!offer) return res.status(404).json({ error: 'Offer not found' });
 res.json(offer);
});

app.post('/offers', (req, res) => {
 const newOffer = { id: Date.now().toString(), ...req.body };
 mockData.offers.push(newOffer);
 res.status(201).json(newOffer);
});

// Merchants endpoints
app.get('/merchants', (req, res) => {
 res.json({ content: mockData.merchants });
});

// Health check
app.get('/health', (req, res) => {
 res.json({ status: 'UP', message: 'Mock API Server Running' });
});

// Fallback for other endpoints
app.use((req, res) => {
 res.status(404).json({
 error: 'Endpoint not found',
 message: `${req.method} ${req.path} not implemented in mock API`,
 note: 'This is a mock API for development. Replace with real backend when available.'
 });
});

app.listen(PORT, () => {
 console.log(` Mock Backend API Server running on http://localhost:${PORT}`);
 console.log(` Demo Credentials: test@example.com / password123`);
 console.log(` Endpoints: /auth/login, /users, /offers, /merchants, /health`);
});
