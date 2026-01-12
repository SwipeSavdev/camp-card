-- V012: Seed Sample Merchants and Offers for Production
-- This creates initial test data for the mobile app

-- ============================================================================
-- MERCHANTS
-- ============================================================================
INSERT INTO merchants (id, uuid, business_name, dba_name, description, category, tax_id, business_email, contact_phone, website_url, logo_url, status, terms_accepted, total_offers, active_offers, created_at, updated_at) VALUES
-- Restaurants
(1, gen_random_uuid(), 'Pizza Palace', 'Pizza Palace LLC', 'Family-owned pizzeria serving authentic Italian pizza since 1985. Fresh ingredients, homemade dough daily.', 'RESTAURANTS', '12-3456789', 'info@pizzapalace.com', '555-0101', 'https://pizzapalace.com', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200', 'APPROVED', true, 2, 2, NOW(), NOW()),
(2, gen_random_uuid(), 'Burger Barn', 'Burger Barn Inc', 'Gourmet burgers made from locally sourced, grass-fed beef. Over 20 specialty burger options.', 'RESTAURANTS', '23-4567890', 'hello@burgerbarn.com', '555-0102', 'https://burgerbarn.com', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200', 'APPROVED', true, 2, 2, NOW(), NOW()),
(3, gen_random_uuid(), 'Taco Town', 'Taco Town Express', 'Authentic Mexican cuisine with a modern twist. Fresh tacos, burritos, and quesadillas made to order.', 'RESTAURANTS', '34-5678901', 'contact@tacotown.com', '555-0103', 'https://tacotown.com', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200', 'APPROVED', true, 1, 1, NOW(), NOW()),

-- Retail
(4, gen_random_uuid(), 'Sports Galaxy', 'Sports Galaxy Stores', 'Your one-stop shop for all sporting goods. Equipment, apparel, and accessories for every sport.', 'RETAIL', '45-6789012', 'sales@sportsgalaxy.com', '555-0201', 'https://sportsgalaxy.com', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200', 'APPROVED', true, 2, 2, NOW(), NOW()),
(5, gen_random_uuid(), 'Book Haven', 'Book Haven LLC', 'Independent bookstore with over 50,000 titles. New releases, classics, and rare finds.', 'RETAIL', '56-7890123', 'books@bookhaven.com', '555-0202', 'https://bookhaven.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'APPROVED', true, 1, 1, NOW(), NOW()),

-- Entertainment
(6, gen_random_uuid(), 'Fun Zone Arcade', 'Fun Zone Entertainment', 'Family entertainment center with arcade games, mini-golf, go-karts, and laser tag.', 'ENTERTAINMENT', '67-8901234', 'play@funzone.com', '555-0301', 'https://funzone.com', 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=200', 'APPROVED', true, 2, 2, NOW(), NOW()),
(7, gen_random_uuid(), 'Cinema Plus', 'Cinema Plus Theaters', 'Premium movie experience with IMAX, 4DX, and luxury recliners. Fresh popcorn and gourmet concessions.', 'ENTERTAINMENT', '78-9012345', 'movies@cinemaplus.com', '555-0302', 'https://cinemaplus.com', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200', 'APPROVED', true, 1, 1, NOW(), NOW()),

-- Services
(8, gen_random_uuid(), 'Quick Oil Change', 'Quick Oil Change Inc', '10-minute oil changes with quality synthetic oils. Full vehicle inspection included.', 'AUTOMOTIVE', '89-0123456', 'service@quickoil.com', '555-0401', 'https://quickoil.com', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200', 'APPROVED', true, 1, 1, NOW(), NOW()),
(9, gen_random_uuid(), 'Outdoor Adventures', 'Outdoor Adventures Co', 'Camping gear, hiking equipment, and outdoor apparel. Expert staff and gear rentals available.', 'RETAIL', '90-1234567', 'info@outdooradv.com', '555-0501', 'https://outdooradv.com', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200', 'APPROVED', true, 2, 2, NOW(), NOW());

-- Reset sequence
SELECT setval('merchants_id_seq', (SELECT MAX(id) FROM merchants));

-- ============================================================================
-- MERCHANT LOCATIONS
-- ============================================================================
INSERT INTO merchant_locations (merchant_id, location_name, street_address, city, state, zip_code, latitude, longitude, phone, primary_location) VALUES
(1, 'Pizza Palace - Downtown', '123 Main Street', 'New York', 'NY', '10001', 40.7128, -74.0060, '555-0101', true),
(2, 'Burger Barn - Main Location', '456 Oak Avenue', 'Los Angeles', 'CA', '90001', 34.0522, -118.2437, '555-0102', true),
(3, 'Taco Town - Central', '789 Elm Street', 'Chicago', 'IL', '60601', 41.8781, -87.6298, '555-0103', true),
(4, 'Sports Galaxy - Mall', '321 Shopping Center', 'Houston', 'TX', '77001', 29.7604, -95.3698, '555-0201', true),
(5, 'Book Haven - University District', '555 College Ave', 'Seattle', 'WA', '98101', 47.6062, -122.3321, '555-0202', true),
(6, 'Fun Zone - Family Center', '888 Entertainment Blvd', 'Denver', 'CO', '80201', 39.7392, -104.9903, '555-0301', true),
(7, 'Cinema Plus - Town Center', '999 Movie Lane', 'Phoenix', 'AZ', '85001', 33.4484, -112.0740, '555-0302', true),
(8, 'Quick Oil - Express Lane', '111 Auto Drive', 'Atlanta', 'GA', '30301', 33.7490, -84.3880, '555-0401', true),
(9, 'Outdoor Adventures - Base Camp', '222 Trail Road', 'Portland', 'OR', '97201', 45.5051, -122.6750, '555-0501', true);

-- ============================================================================
-- OFFERS
-- ============================================================================
INSERT INTO offers (id, uuid, merchant_id, title, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, category, terms, image_url, status, valid_from, valid_until, usage_limit, usage_limit_per_user, featured, scout_exclusive, requires_qr_verification, created_at, updated_at) VALUES
-- Pizza Palace Offers
(1, gen_random_uuid(), 1, '20% Off Any Large Pizza', 'Get 20% off any large pizza with your Camp Card. Perfect for family dinners!', 'PERCENTAGE', 20.00, 15.00, 10.00, 'RESTAURANTS', 'Valid on dine-in and carryout. Cannot be combined with other offers. One per customer per visit.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 1000, 3, true, false, true, NOW(), NOW()),
(2, gen_random_uuid(), 1, 'Free Garlic Bread with Order', 'Enjoy complimentary garlic bread with any pizza purchase of $20 or more.', 'FREE_ITEM', 0, 20.00, NULL, 'RESTAURANTS', 'One free garlic bread per order. Minimum $20 purchase required. Dine-in or carryout.', 'https://images.unsplash.com/photo-1619531040576-f9416aabed4e?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days', 500, 5, false, true, true, NOW(), NOW()),

-- Burger Barn Offers
(3, gen_random_uuid(), 2, 'Buy One Get One Free Burgers', 'Buy any signature burger and get a second one free. Scout exclusive deal!', 'BUY_ONE_GET_ONE', 0, 12.00, 15.00, 'RESTAURANTS', 'Second burger must be of equal or lesser value. Cannot be combined with other offers.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '45 days', 200, 2, true, true, true, NOW(), NOW()),
(4, gen_random_uuid(), 2, '$5 Off Family Meal', 'Save $5 on any family meal combo for 4 people or more.', 'FIXED_AMOUNT', 5.00, 30.00, 5.00, 'RESTAURANTS', 'Valid on family meals for 4+ people. One discount per family per visit.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 300, 3, false, false, true, NOW(), NOW()),

-- Taco Town Offers
(5, gen_random_uuid(), 3, '15% Off Entire Order', 'Save 15% on your entire order at Taco Town. Valid any day!', 'PERCENTAGE', 15.00, 10.00, 8.00, 'RESTAURANTS', 'Cannot be combined with daily specials or other coupons.', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days', 800, 5, false, false, true, NOW(), NOW()),

-- Sports Galaxy Offers
(6, gen_random_uuid(), 4, '25% Off Camping Gear', 'Get 25% off all camping equipment. Perfect for Scout camping trips!', 'PERCENTAGE', 25.00, 50.00, 75.00, 'RETAIL', 'Valid on camping tents, sleeping bags, backpacks, and accessories. Excludes clearance items.', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 500, 2, true, true, true, NOW(), NOW()),
(7, gen_random_uuid(), 4, '$10 Off $50+ Purchase', 'Save $10 when you spend $50 or more on sporting goods.', 'FIXED_AMOUNT', 10.00, 50.00, 10.00, 'RETAIL', 'Minimum $50 purchase required before discount. Valid on regular priced items only.', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days', 400, 3, false, false, true, NOW(), NOW()),

-- Book Haven Offers
(8, gen_random_uuid(), 5, '20% Off Any Purchase', 'Get 20% off any book purchase. Feed your mind for less!', 'PERCENTAGE', 20.00, NULL, 20.00, 'RETAIL', 'Valid on all books including new releases. Cannot be combined with membership discounts.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 1000, 10, false, false, true, NOW(), NOW()),

-- Fun Zone Arcade Offers
(9, gen_random_uuid(), 6, 'Free Game Card with Admission', 'Get a free $10 game card when you pay for admission. Hours of fun!', 'FREE_ITEM', 10.00, 15.00, NULL, 'ENTERTAINMENT', 'One free game card per paid admission. Game card valid same day only.', 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 600, 3, true, false, true, NOW(), NOW()),
(10, gen_random_uuid(), 6, '50% Off Go-Kart Rides', 'Half price go-kart rides for Scouts! Race to the finish line for less.', 'PERCENTAGE', 50.00, NULL, 15.00, 'ENTERTAINMENT', 'Valid for single or double go-kart rides. Must show Scout ID or Camp Card.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days', 400, 2, false, true, true, NOW(), NOW()),

-- Cinema Plus Offers
(11, gen_random_uuid(), 7, '$3 Off Movie Tickets', 'Save $3 on any movie ticket. Enjoy the latest blockbusters for less!', 'FIXED_AMOUNT', 3.00, NULL, 3.00, 'ENTERTAINMENT', 'Valid on standard, 3D, and IMAX tickets. Not valid on special events or premieres.', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 1500, 5, false, false, true, NOW(), NOW()),

-- Quick Oil Change Offers
(12, gen_random_uuid(), 8, '$15 Off Full Synthetic Oil Change', 'Premium synthetic oil change at a discount. Keep your car running smooth!', 'FIXED_AMOUNT', 15.00, NULL, 15.00, 'AUTOMOTIVE', 'Valid on full synthetic oil changes only. Includes free 21-point inspection.', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', 300, 2, false, false, true, NOW(), NOW()),

-- Outdoor Adventures Offers
(13, gen_random_uuid(), 9, '30% Off Scout Uniforms & Patches', 'Official Scout uniforms and patches at 30% off. Gear up for your troop!', 'PERCENTAGE', 30.00, 25.00, 50.00, 'RETAIL', 'Valid on all official BSA uniforms, patches, and accessories. Excludes special orders.', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '120 days', 800, 3, true, true, true, NOW(), NOW()),
(14, gen_random_uuid(), 9, 'Free Water Bottle with $40 Purchase', 'Get a free reusable water bottle when you spend $40 or more.', 'FREE_ITEM', 0, 40.00, NULL, 'RETAIL', 'Free 32oz water bottle with $40+ purchase. While supplies last. One per customer.', 'https://images.unsplash.com/photo-1502666229322-48fc27e9e020?w=800', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days', 200, 1, false, false, true, NOW(), NOW());

-- Reset sequence
SELECT setval('offers_id_seq', (SELECT MAX(id) FROM offers));

-- Update merchant offer counts
UPDATE merchants SET
    total_offers = (SELECT COUNT(*) FROM offers WHERE offers.merchant_id = merchants.id),
    active_offers = (SELECT COUNT(*) FROM offers WHERE offers.merchant_id = merchants.id AND offers.status = 'ACTIVE');

-- ============================================================================
-- SUBSCRIPTION PLANS
-- ============================================================================
INSERT INTO subscription_plans (id, name, description, price, billing_period, max_redemptions_per_month, features, is_active, display_order, created_at, updated_at) VALUES
(1, 'Scout Basic', 'Perfect for individual Scouts. Access to all local offers with up to 20 redemptions per month.', 10.00, 'MONTHLY', 20, '["Access to all local offers", "QR code redemption", "20 redemptions per month", "Mobile app access"]', true, 1, NOW(), NOW()),
(2, 'Scout Premium', 'Best value for active Scouts. Unlimited redemptions and exclusive premium offers.', 25.00, 'MONTHLY', NULL, '["Access to all offers nationwide", "Unlimited redemptions", "Exclusive premium offers", "Priority customer support", "Referral bonuses", "Early access to new deals"]', true, 2, NOW(), NOW()),
(3, 'Family Pack', 'Cover the whole family! Up to 5 family members with shared benefits.', 45.00, 'MONTHLY', NULL, '["Up to 5 family members", "Access to all offers", "Unlimited redemptions per member", "Family coordination features", "Shared savings tracker"]', true, 3, NOW(), NOW()),
(4, 'Troop Bundle', 'Special pricing for Scout troops. Contact us for custom pricing based on troop size.', 0.00, 'ANNUAL', NULL, '["Custom pricing for troops", "Bulk discounts available", "Troop coordinator dashboard", "Fundraising tracking", "Group redemption reports"]', false, 4, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Reset sequence
SELECT setval('subscription_plans_id_seq', (SELECT MAX(id) FROM subscription_plans));
