-- SMART CANTEEN SEED DATA
-- Run after schema.sql

-- CANTEEN TABLES PRESET B (2x5, 10 tables, 80 seats)
INSERT INTO canteen_tables (table_number, seats_count, grid_row, grid_col) VALUES
(1, 8, 0, 0), (2, 8, 0, 1), (3, 8, 0, 2), (4, 8, 0, 3), (5, 8, 0, 4),
(6, 8, 1, 0), (7, 8, 1, 1), (8, 8, 1, 2), (9, 8, 1, 3), (10, 8, 1, 4)
ON CONFLICT (table_number) DO NOTHING;

INSERT INTO seats (table_id, seat_number)
SELECT ct.id, s.n
FROM canteen_tables ct
CROSS JOIN generate_series(1, 8) AS s(n)
ON CONFLICT (table_id, seat_number) DO NOTHING;

-- MENU ITEMS
INSERT INTO menu_items (name, description, price, category, is_veg, spice_level, prep_time_minutes)
VALUES
('Paneer Butter Masala', 'Creamy tomato-based paneer curry', 120, 'North Indian', true, 'medium', 15),
('Chole Bhature', 'Spiced chickpeas with fried bread', 80, 'North Indian', true, 'medium', 12),
('Dal Makhani', 'Slow-cooked black lentils in butter', 90, 'North Indian', true, 'mild', 15),
('Butter Chicken', 'Tender chicken in rich tomato gravy', 140, 'North Indian', false, 'medium', 18),
('Aloo Paratha', 'Stuffed potato flatbread with butter', 50, 'North Indian', true, 'mild', 10),
('Rajma Chawal', 'Kidney bean curry with steamed rice', 70, 'North Indian', true, 'medium', 12),
('Roti (2 pcs)', 'Fresh whole wheat flatbread', 20, 'North Indian', true, 'mild', 5),
('Jeera Rice', 'Cumin-tempered basmati rice', 50, 'North Indian', true, 'mild', 10),
('Naan', 'Soft tandoor-baked bread', 30, 'North Indian', true, 'mild', 5),
('Masala Dosa', 'Crispy crepe filled with spiced potato', 60, 'South Indian', true, 'medium', 10),
('Idli Sambhar (3 pcs)', 'Steamed rice cakes with lentil soup', 40, 'South Indian', true, 'mild', 8),
('Medu Vada (2 pcs)', 'Crispy fried lentil donuts', 35, 'South Indian', true, 'mild', 8),
('Uttapam', 'Thick pancake topped with vegetables', 55, 'South Indian', true, 'mild', 10),
('Filter Coffee', 'Traditional South Indian coffee', 25, 'South Indian', true, 'mild', 3),
('Samosa (2 pcs)', 'Crispy pastry with spiced potato filling', 30, 'Snacks', true, 'medium', 5),
('Veg Sandwich', 'Fresh vegetables between toasted bread', 40, 'Snacks', true, 'mild', 8),
('Grilled Sandwich', 'Cheesy grilled sandwich with veggies', 60, 'Snacks', true, 'mild', 10),
('Paneer Roll', 'Paneer wrapped in a soft paratha', 70, 'Snacks', true, 'medium', 10),
('Chicken Roll', 'Spiced chicken wrapped in paratha', 80, 'Snacks', false, 'spicy', 12),
('French Fries', 'Crispy salted potato fries', 50, 'Snacks', true, 'mild', 8),
('Maggi', 'Classic 2-minute noodles', 30, 'Snacks', true, 'medium', 8),
('Masala Chai', 'Spiced Indian tea', 15, 'Beverages', true, 'mild', 3),
('Coffee', 'Hot brewed coffee', 20, 'Beverages', true, 'mild', 3),
('Fresh Lime Soda', 'Sweet or salted lime soda', 25, 'Beverages', true, 'mild', 3),
('Mango Lassi', 'Thick mango yogurt smoothie', 40, 'Beverages', true, 'mild', 5),
('Cold Coffee', 'Iced coffee with milk', 45, 'Beverages', true, 'mild', 5),
('Buttermilk', 'Spiced chilled buttermilk', 20, 'Beverages', true, 'mild', 3)
ON CONFLICT DO NOTHING;

-- MENU CUSTOMIZATIONS
INSERT INTO menu_customizations (menu_item_id, name, price_addon, type)
SELECT id, 'Extra cheese', 20, 'checkbox' FROM menu_items WHERE name = 'Paneer Butter Masala'
UNION ALL
SELECT id, 'No onion', 0, 'checkbox' FROM menu_items WHERE name = 'Paneer Butter Masala'
UNION ALL
SELECT id, 'Extra gravy', 15, 'checkbox' FROM menu_items WHERE name = 'Paneer Butter Masala'
UNION ALL
SELECT id, 'Less oil', 0, 'checkbox' FROM menu_items WHERE name = 'Paneer Butter Masala'
UNION ALL
SELECT id, 'Extra gravy', 15, 'checkbox' FROM menu_items WHERE name = 'Butter Chicken'
UNION ALL
SELECT id, 'Boneless', 20, 'checkbox' FROM menu_items WHERE name = 'Butter Chicken'
UNION ALL
SELECT id, 'Extra cheese', 15, 'checkbox' FROM menu_items WHERE name = 'Grilled Sandwich'
UNION ALL
SELECT id, 'No onion', 0, 'checkbox' FROM menu_items WHERE name = 'Grilled Sandwich'
UNION ALL
SELECT id, 'Add corn', 10, 'checkbox' FROM menu_items WHERE name = 'Grilled Sandwich'
UNION ALL
SELECT id, 'Extra chutney', 0, 'checkbox' FROM menu_items WHERE name = 'Masala Dosa'
UNION ALL
SELECT id, 'Ghee roast', 15, 'checkbox' FROM menu_items WHERE name = 'Masala Dosa'
UNION ALL
SELECT id, 'Extra cheese', 15, 'checkbox' FROM menu_items WHERE name = 'Maggi'
UNION ALL
SELECT id, 'Add veggies', 10, 'checkbox' FROM menu_items WHERE name = 'Maggi'
UNION ALL
SELECT id, 'Add egg', 15, 'checkbox' FROM menu_items WHERE name = 'Maggi'
ON CONFLICT DO NOTHING;

INSERT INTO menu_customizations (menu_item_id, name, price_addon, type, group_name)
SELECT id, 'Sweet', 0, 'radio', 'lime_type' FROM menu_items WHERE name = 'Fresh Lime Soda'
UNION ALL
SELECT id, 'Salted', 0, 'radio', 'lime_type' FROM menu_items WHERE name = 'Fresh Lime Soda'
UNION ALL
SELECT id, 'Mixed', 0, 'radio', 'lime_type' FROM menu_items WHERE name = 'Fresh Lime Soda'
ON CONFLICT DO NOTHING;
