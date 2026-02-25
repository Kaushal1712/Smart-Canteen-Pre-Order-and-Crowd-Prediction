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

DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM menu_customizations;
DELETE FROM menu_items;


-- 🟢 NEW CANTEEN MENU ITEMS
INSERT INTO menu_items (name, description, price, category, is_veg, spice_level, prep_time_minutes)
VALUES

-- BREAKFAST
('Poha', 'Light flattened rice cooked with spices', 25, 'Breakfast', true, 'mild', 5),
('Upma', 'Semolina breakfast dish with veggies', 30, 'Breakfast', true, 'mild', 7),
('Sabudana', 'Sabudana khichdi with peanuts', 35, 'Breakfast', true, 'mild', 7),
('Sabudana Wada', 'Crispy sabudana fritters', 30, 'Breakfast', true, 'mild', 8),

-- SOUTH INDIAN
('Idli Sambhar', 'Steamed idli served with sambhar', 40, 'South Indian', true, 'mild', 8),
('Plain Dosa', 'Crispy plain dosa with chutney', 45, 'South Indian', true, 'mild', 8),
('Masala Dosa', 'Dosa stuffed with potato masala', 60, 'South Indian', true, 'medium', 10),
('Uttapam', 'Thick dosa topped with vegetables', 55, 'South Indian', true, 'mild', 10),

-- SNACKS / STREET FOOD
('Vadapav', 'Mumbai style batata vada pav', 20, 'Snacks', true, 'medium', 5),
('Batata Vada Sambhar', 'Batata vada served with sambhar', 40, 'Snacks', true, 'medium', 8),
('Samosa', 'Crispy potato samosa', 15, 'Snacks', true, 'medium', 5),
('Dahi Samosa', 'Samosa topped with curd and chutneys', 30, 'Snacks', true, 'mild', 6),
('Kanda Bhaji', 'Onion fritters', 30, 'Snacks', true, 'medium', 6),
('Bread Pattice', 'Bread stuffed with potato filling', 25, 'Snacks', true, 'mild', 6),
('Bread Butter', 'Toasted bread with butter', 20, 'Snacks', true, 'mild', 3),
('Toast Butter', 'Crispy butter toast', 20, 'Snacks', true, 'mild', 3),
('French Fries', 'Crispy salted fries', 50, 'Snacks', true, 'mild', 8),
('Veg Sandwich', 'Fresh vegetable sandwich', 40, 'Snacks', true, 'mild', 7),
('Veg Grilled Sandwich', 'Grilled vegetable sandwich', 60, 'Snacks', true, 'mild', 10),
('Cheese Sandwich', 'Cheesy vegetable sandwich', 55, 'Snacks', true, 'mild', 8),
('Paneer Roll', 'Paneer stuffed roll', 70, 'Snacks', true, 'medium', 10),
('Dhokla', 'Steamed gram flour snack', 30, 'Snacks', true, 'mild', 6),

-- MAGGI
('Plain Maggi', 'Classic Maggi noodles', 30, 'Snacks', true, 'mild', 5),
('Masala Maggi', 'Spicy masala Maggi', 35, 'Snacks', true, 'medium', 6),
('Cheese Maggi', 'Maggi topped with cheese', 45, 'Snacks', true, 'mild', 6),

-- MAIN COURSE
('Dal Rice', 'Dal served with steamed rice', 60, 'Main Course', true, 'mild', 10),
('Rajma Rice', 'Rajma curry with rice', 70, 'Main Course', true, 'medium', 12),
('Jeera Rice', 'Cumin flavored basmati rice', 50, 'Main Course', true, 'mild', 8),
('Fried Rice', 'Vegetable fried rice', 70, 'Chinese', true, 'medium', 10),
('Schezwan Fried Rice', 'Spicy schezwan fried rice', 80, 'Chinese', true, 'spicy', 12),
('Hakka Noodles', 'Stir fried hakka noodles', 70, 'Chinese', true, 'medium', 10),
('Schezwan Hakka Noodles', 'Spicy schezwan noodles', 80, 'Chinese', true, 'spicy', 12),
('Chole Bhature', 'Chole curry with bhature', 80, 'North Indian', true, 'medium', 12),
('Puri Bhaji', 'Puri with potato bhaji', 60, 'North Indian', true, 'mild', 10),
('Paneer Thali', 'Paneer curry with roti, rice & sides', 120, 'Thali', true, 'medium', 15),
('Veg Thali', 'Complete veg meal thali', 100, 'Thali', true, 'mild', 15),
('Roti', 'Whole wheat roti', 10, 'North Indian', true, 'mild', 3),

-- PARATHAS
('Aloo Paratha', 'Potato stuffed paratha', 40, 'North Indian', true, 'mild', 8),
('Paneer Paratha', 'Paneer stuffed paratha', 60, 'North Indian', true, 'mild', 10),

-- BEVERAGES
('Tea', 'Hot chai', 10, 'Beverages', true, 'mild', 2),
('Coffee', 'Hot coffee', 15, 'Beverages', true, 'mild', 2),
('Filter Coffee', 'South Indian filter coffee', 25, 'Beverages', true, 'mild', 3),
('Cold Coffee', 'Iced coffee with milk', 40, 'Beverages', true, 'mild', 3),
('Cold Drinks', 'Chilled soft drinks', 30, 'Beverages', true, 'mild', 1),
('Fresh Lime Water', 'Refreshing lime drink', 20, 'Beverages', true, 'mild', 2),
('Lassi', 'Sweet lassi', 30, 'Beverages', true, 'mild', 3),
('Mango Lassi', 'Mango flavored lassi', 40, 'Beverages', true, 'mild', 3),
('Masala Buttermilk', 'Spiced buttermilk', 20, 'Beverages', true, 'mild', 2),

-- DESSERT
('Gulab Jamun (2 pc)', 'Soft gulab jamuns', 30, 'Desserts', true, 'mild', 2);