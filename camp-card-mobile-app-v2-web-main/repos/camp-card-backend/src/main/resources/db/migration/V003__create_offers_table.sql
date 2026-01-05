-- Flyway Migration V003: Create Offers and Offer Categories Schema
-- Author: Backend Engineering Team
-- Date: 2025-12-28
-- Purpose: Enable persistent storage of offers in PostgreSQL

-- Create offer_categories table (lookup table for offer types)
CREATE TABLE offer_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    color_code VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert standard offer categories
INSERT INTO offer_categories (name, description, icon_url, color_code) VALUES
    ('DINING', 'Restaurant and food offers', '/icons/dining.png', '#FF6B6B'),
    ('AUTO', 'Automotive services and repairs', '/icons/auto.png', '#4ECDC4'),
    ('ENTERTAINMENT', 'Entertainment and activities', '/icons/entertainment.png', '#95E1D3'),
    ('RETAIL', 'Retail shopping discounts', '/icons/retail.png', '#FFD93D'),
    ('SERVICES', 'Professional and personal services', '/icons/services.png', '#A8E6CF'),
    ('HEALTH', 'Health and wellness offers', '/icons/health.png', '#FF8B94'),
    ('TRAVEL', 'Travel and accommodation discounts', '/icons/travel.png', '#C7B3E5');

-- Create offers table (main offers data)
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL,
    category_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_description VARCHAR(255),
    discount_value NUMERIC(10, 2),
    usage_type VARCHAR(50) NOT NULL DEFAULT 'UNLIMITED',
    is_featured BOOLEAN DEFAULT FALSE,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_offers_merchant FOREIGN KEY (merchant_id) 
        REFERENCES merchants(id) ON DELETE CASCADE,
    CONSTRAINT fk_offers_category FOREIGN KEY (category_id) 
        REFERENCES offer_categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_offers_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_offers_updated_by FOREIGN KEY (updated_by) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_offers_merchant_id ON offers(merchant_id);
CREATE INDEX idx_offers_category_id ON offers(category_id);
CREATE INDEX idx_offers_valid_from ON offers(valid_from);
CREATE INDEX idx_offers_valid_until ON offers(valid_until);
CREATE INDEX idx_offers_is_active ON offers(is_active);
CREATE INDEX idx_offers_uuid ON offers(uuid);
CREATE INDEX idx_offers_created_at ON offers(created_at);

-- Add foreign key to offer_redemptions table
ALTER TABLE offer_redemptions 
ADD CONSTRAINT fk_offer_redemptions_offer 
FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE;

-- Insert seed data: Pizza Palace (5 DINING offers)
INSERT INTO offers (uuid, merchant_id, category_id, title, description, discount_description, 
                   discount_value, usage_type, is_featured, valid_from, valid_until, is_active, created_at)
SELECT 
    substring(gen_random_uuid()::text, 1, 36),
    merchants.id,
    oc.id,
    offer_title,
    offer_desc,
    discount_desc,
    20.0,
    'UNLIMITED',
    featured,
    '2025-12-01'::timestamp,
    '2025-12-31'::timestamp,
    true,
    CURRENT_TIMESTAMP
FROM merchants
CROSS JOIN (
    VALUES 
        ('20% off entire purchase', 'Valid on dine-in or takeout. Excludes alcohol.', '20% Off', true),
        ('Free appetizer with entree', 'Complimentary appetizer when you buy an entree. Valid Monday-Wednesday.', 'Free Appetizer', false),
        ('Buy one get one 50% off pizza', 'Buy any large pizza, get second pizza 50% off. Take-out only.', '50% Off 2nd Pizza', false),
        ('Lunch special: Buy 1 get 1', 'Two slices for the price of one during lunch hours (11am-2pm)', 'BOGO Lunch', false),
        ('Family bundle: Pizza + drinks', 'Large pizza with 2 two-liter drinks for $22.99', 'Family Bundle', false)
) AS offers_data(offer_title, offer_desc, discount_desc, featured)
CROSS JOIN offer_categories oc
WHERE merchants.business_name = 'Pizza Palace' AND oc.name = 'DINING';

-- Insert seed data: AutoCare (5 AUTO offers)
INSERT INTO offers (uuid, merchant_id, category_id, title, description, discount_description, 
                   discount_value, usage_type, is_featured, valid_from, valid_until, is_active, created_at)
SELECT 
    substring(gen_random_uuid()::text, 1, 36),
    merchants.id,
    oc.id,
    offer_title,
    offer_desc,
    discount_desc,
    10.0,
    'UNLIMITED',
    featured,
    '2025-12-01'::timestamp,
    '2026-01-15'::timestamp,
    true,
    CURRENT_TIMESTAMP
FROM merchants
CROSS JOIN (
    VALUES 
        ('$10 off oil change', 'Includes up to 5 quarts. Appointment recommended.', '$10 Off Oil Change', true),
        ('Free tire rotation with any service', 'Complimentary tire rotation with any service over $50.', 'Free Tire Rotation', false),
        ('$25 off major service over $150', 'Discount applies to transmission, coolant, or brake service.', '$25 Off Major Service', false),
        ('Battery installation free', 'Free installation with battery purchase over $50', 'Free Install', false),
        ('Alignment and balance combo', 'Wheel alignment and balancing combo for $45', 'Combo Deal', true)
) AS offers_data(offer_title, offer_desc, discount_desc, featured)
CROSS JOIN offer_categories oc
WHERE merchants.business_name = 'AutoCare' AND oc.name = 'AUTO';

-- Insert seed data: Fun Zone (5 ENTERTAINMENT offers)
INSERT INTO offers (uuid, merchant_id, category_id, title, description, discount_description, 
                   discount_value, usage_type, is_featured, valid_from, valid_until, is_active, created_at)
SELECT 
    substring(gen_random_uuid()::text, 1, 36),
    merchants.id,
    oc.id,
    offer_title,
    offer_desc,
    discount_desc,
    15.0,
    usage_type,
    featured,
    '2025-12-01'::timestamp,
    '2026-02-01'::timestamp,
    true,
    CURRENT_TIMESTAMP
FROM merchants
CROSS JOIN (
    VALUES 
        ('Buy 1 get 1 50% off tickets', 'Valid on weekday tickets only.', 'BOGO 50% Off', 'LIMITED', true),
        ('Free game card ($10 value)', 'Get $10 free play on arcade game card with ticket purchase.', 'Free $10 Game Card', 'UNLIMITED', false),
        ('Family 4-pack discount', 'Buy 4 tickets, pay for 3. Valid any day.', '25% Off 4-Pack', 'UNLIMITED', false),
        ('Laser tag tournament', 'Entry for 4 players, $5 discount', 'Laser Tag', 'UNLIMITED', false),
        ('Combo: Games + Bowling', 'Unlimited games + 2 bowling games for $35', 'Game Combo', 'UNLIMITED', false)
) AS offers_data(offer_title, offer_desc, discount_desc, usage_type, featured)
CROSS JOIN offer_categories oc
WHERE merchants.business_name = 'Fun Zone' AND oc.name = 'ENTERTAINMENT';

-- Insert additional cross-category offers (35 more to reach 50 total)

-- Additional Dining offers for Pizza Palace
INSERT INTO offers (uuid, merchant_id, category_id, title, description, discount_description, 
                   discount_value, usage_type, is_featured, valid_from, valid_until, is_active, created_at)
SELECT 
    substring(gen_random_uuid()::text, 1, 36),
    merchants.id,
    oc.id,
    offer_title,
    offer_desc,
    discount_desc,
    15.0,
    'UNLIMITED',
    featured,
    '2025-12-01'::timestamp,
    '2026-06-30'::timestamp,
    true,
    CURRENT_TIMESTAMP
FROM merchants
CROSS JOIN (
    VALUES 
        ('Dessert pizza special', 'Chocolate or fruit dessert pizza half off', '50% Off Dessert', false),
        ('Catering order discount', 'Discount on catering orders of 10+ pizzas', '20% Off Catering', false),
        ('Free breadsticks combo', 'Order any pizza, get free order of breadsticks', 'Free Breadsticks', false),
        ('Weekend family deal', 'Large pizza + appetizer + dessert for $35', 'Family Deal', true),
        ('Weekday lunch combo', 'Slice + drink + side for $8.99', 'Lunch Combo', true),
        ('Pasta special discount', 'Any pasta entree 25% off with purchase of drink', '25% Off Pasta', false),
        ('Seasonal special menu', 'New seasonal items 15% off first two weeks', 'New Menu', false)
) AS offers_data(offer_title, offer_desc, discount_desc, featured)
CROSS JOIN offer_categories oc
WHERE merchants.business_name = 'Pizza Palace' AND oc.name = 'DINING';

-- Additional Auto services for AutoCare
INSERT INTO offers (uuid, merchant_id, category_id, title, description, discount_description, 
                   discount_value, usage_type, is_featured, valid_from, valid_until, is_active, created_at)
SELECT 
    substring(gen_random_uuid()::text, 1, 36),
    merchants.id,
    oc.id,
    offer_title,
    offer_desc,
    discount_desc,
    20.0,
    'UNLIMITED',
    featured,
    '2025-12-01'::timestamp,
    '2026-06-30'::timestamp,
    true,
    CURRENT_TIMESTAMP
FROM merchants
CROSS JOIN (
    VALUES 
        ('Air filter replacement special', 'Air or cabin filter replacement $15 (reg $25)', 'Filter Special', false),
        ('Brake pad inspection', 'Free brake pad inspection and safety check', 'Free Inspection', false),
        ('Transmission fluid flush', 'Transmission service 30% off', '30% Off Service', false),
        ('Engine diagnostic special', 'Complete engine diagnostic scan $25 off', 'Diagnostic', false),
        ('Scheduled maintenance package', '30000 mile service package $150 off', 'Maintenance', true),
        ('Suspension inspection free', 'Complimentary suspension and steering check', 'Free Check', false),
        ('Headlight replacement service', 'Headlight/taillight replacement 20% off', '20% Off Lights', false)
) AS offers_data(offer_title, offer_desc, discount_desc, featured)
CROSS JOIN offer_categories oc
WHERE merchants.business_name = 'AutoCare' AND oc.name = 'AUTO';

-- Additional Entertainment offers for Fun Zone
INSERT INTO offers (uuid, merchant_id, category_id, title, description, discount_description, 
                   discount_value, usage_type, is_featured, valid_from, valid_until, is_active, created_at)
SELECT 
    substring(gen_random_uuid()::text, 1, 36),
    merchants.id,
    oc.id,
    offer_title,
    offer_desc,
    discount_desc,
    18.0,
    usage_type,
    featured,
    '2025-12-01'::timestamp,
    '2026-06-30'::timestamp,
    true,
    CURRENT_TIMESTAMP
FROM merchants
CROSS JOIN (
    VALUES 
        ('Arcade token bonus', 'Buy $20 in tokens, get $5 free', 'Bonus Tokens', 'UNLIMITED', false),
        ('Birthday party platinum', 'Birthday party for 20 kids with games and premium food $299', 'Party Pkg', 'LIMITED', true),
        ('Season pass special', 'Unlimited visits for 3 months only $99', 'Season Pass', 'LIMITED', true),
        ('Group outing discount', 'Groups of 15+ get special rates and free event coordinator', 'Group Rate', 'UNLIMITED', false),
        ('VIP fast-pass experience', 'Skip the lines VIP pass for one day', 'VIP Pass', 'LIMITED', false),
        ('Corporate team building', 'Team building packages for companies, customized options', 'Team Building', 'LIMITED', false),
        ('School field trip special', 'Educational group rates and chaperone discount', 'School Trip', 'UNLIMITED', false)
) AS offers_data(offer_title, offer_desc, discount_desc, usage_type, featured)
CROSS JOIN offer_categories oc
WHERE merchants.business_name = 'Fun Zone' AND oc.name = 'ENTERTAINMENT';

-- Retail offers (using Pizza Palace as merchant since we need existing merchants)
INSERT INTO offers (uuid, merchant_id, category_id, title, description, discount_description, 
                   discount_value, usage_type, is_featured, valid_from, valid_until, is_active, created_at)
SELECT 
    substring(gen_random_uuid()::text, 1, 36),
    merchants.id,
    oc.id,
    offer_title,
    offer_desc,
    discount_desc,
    discount_val,
    'UNLIMITED',
    featured,
    '2025-12-01'::timestamp,
    '2026-06-30'::timestamp,
    true,
    CURRENT_TIMESTAMP
FROM merchants
CROSS JOIN (
    VALUES 
        ('Scout uniform accessories', 'Scout patches and badges 15% off', '15% Off', 15.0, false),
        ('Camping gear sale', 'Tents and sleeping bags 25% discount', '25% Off', 25.0, true),
        ('Water bottles hydration', 'Insulated water bottles $2 off (reg $12)', 'Bottle Special', 2.0, false),
        ('First aid kit bundle', 'Scout safety first aid kits 30% off', '30% Off', 30.0, false),
        ('Flashlight emergency kit', 'LED flashlights and emergency supplies 20% off', '20% Off', 20.0, false)
) AS offers_data(offer_title, offer_desc, discount_desc, discount_val, featured)
CROSS JOIN offer_categories oc
WHERE merchants.business_name = 'Pizza Palace' AND oc.name = 'RETAIL';

-- Services offers
INSERT INTO offers (uuid, merchant_id, category_id, title, description, discount_description, 
                   discount_value, usage_type, is_featured, valid_from, valid_until, is_active, created_at)
SELECT 
    substring(gen_random_uuid()::text, 1, 36),
    merchants.id,
    oc.id,
    offer_title,
    offer_desc,
    discount_desc,
    discount_val,
    'UNLIMITED',
    featured,
    '2025-12-01'::timestamp,
    '2026-06-30'::timestamp,
    true,
    CURRENT_TIMESTAMP
FROM merchants
CROSS JOIN (
    VALUES 
        ('Car wash and wax', 'Full car wash and wax $35 (reg $50)', 'Car Care', 15.0, false),
        ('Interior detailing', 'Vehicle interior cleaning 40% off', '40% Off', 40.0, false),
        ('Paint protection sealant', 'Vehicle paint protection package $99', 'Paint Pro', 30.0, false),
        ('Glass coating and protection', 'Windshield protection coating $20 off', 'Glass Coating', 20.0, false),
        ('Party planning service', 'Professional party coordination 15% off', 'Party Plan', 15.0, false)
) AS offers_data(offer_title, offer_desc, discount_desc, discount_val, featured)
CROSS JOIN offer_categories oc
WHERE merchants.business_name = 'AutoCare' AND oc.name = 'SERVICES';

-- Health and Wellness offers
INSERT INTO offers (uuid, merchant_id, category_id, title, description, discount_description, 
                   discount_value, usage_type, is_featured, valid_from, valid_until, is_active, created_at)
SELECT 
    substring(gen_random_uuid()::text, 1, 36),
    merchants.id,
    oc.id,
    offer_title,
    offer_desc,
    discount_desc,
    discount_val,
    'UNLIMITED',
    featured,
    '2025-12-01'::timestamp,
    '2026-06-30'::timestamp,
    true,
    CURRENT_TIMESTAMP
FROM merchants
CROSS JOIN (
    VALUES 
        ('Fitness class pass', '10-class fitness pass $50 off', 'Fitness Pass', 50.0, false),
        ('Personal training sessions', 'First 5 sessions $20 each (reg $60)', 'Training Deal', 40.0, false),
        ('Nutrition consultation', 'Complimentary nutrition assessment with membership', 'Free Nutrition', 0.0, false),
        ('Health screening package', 'Annual health screening 25% off', '25% Off', 25.0, false),
        ('Wellness retreat package', 'Weekend wellness retreat $100 discount', 'Wellness Pkg', 100.0, true)
) AS offers_data(offer_title, offer_desc, discount_desc, discount_val, featured)
CROSS JOIN offer_categories oc
WHERE merchants.business_name = 'Fun Zone' AND oc.name = 'HEALTH';

-- Travel and Transportation offers
INSERT INTO offers (uuid, merchant_id, category_id, title, description, discount_description, 
                   discount_value, usage_type, is_featured, valid_from, valid_until, is_active, created_at)
SELECT 
    substring(gen_random_uuid()::text, 1, 36),
    merchants.id,
    oc.id,
    offer_title,
    offer_desc,
    discount_desc,
    discount_val,
    'UNLIMITED',
    featured,
    '2025-12-01'::timestamp,
    '2026-12-31'::timestamp,
    true,
    CURRENT_TIMESTAMP
FROM merchants
CROSS JOIN (
    VALUES 
        ('Hotel booking cashback', 'Book any hotel partner, receive 20% back', '20% Cashback', 20.0, true),
        ('Gas station rewards', 'Earn 2x points on all fuel purchases', '2x Rewards', 0.0, false),
        ('Airline ticket bonus', 'Book flights online, get $25 credit', 'Flight Credit', 25.0, false),
        ('Car rental discount', 'Hertz and Budget car rentals 15% off', 'Rental Deal', 15.0, false),
        ('Travel insurance discount', 'Trip insurance packages 20% off', '20% Insurance', 20.0, false),
        ('Vacation package bundle', 'Flight + Hotel bundles get extra $50 credit', 'Vacation Deal', 50.0, true),
        ('Airport parking discount', 'Valet parking at major airports 25% off', 'Parking', 25.0, false),
        ('Pet travel accommodation', 'Pet-friendly hotel bookings with special rates', 'Pet Travel', 15.0, false)
) AS offers_data(offer_title, offer_desc, discount_desc, discount_val, featured)
CROSS JOIN offer_categories oc
WHERE merchants.business_name = 'Pizza Palace' AND oc.name = 'TRAVEL';

-- Verify successful migration
SELECT COUNT(*) as total_offers FROM offers;
