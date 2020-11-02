-- The file below will be used to seed the database with the initial 
-- recipes and ingredients. This file may be merged with the creation file
-- after testing has been performed.

-- Seed data for the ingredients
INSERT INTO Ingredients (name, description, ethical_score) VALUES
('Olive Oil', 'null' , 0),
('White Flour', 'null', 0 ),
('Butter', 'null', 0 ),
('Chicken', 'null', 0 ),
('Sugar', 'null', 0),
('Salt', 'null',0),
('Egg', 'null', 0 ),
('Rice', 'null', 0 ),
('Vegetable Oil', 'null', 0 ),
('Pork', 'null', 0 ),
('Beef', 'null',0 ),
('Cheese', 'null', 0 ),
('Garlic', 'null', 0),
('Orange', 'null', 0),
('Turkey', 'null', 0),
('Onion', 'null', 0 ),
('Corn', 'null', 0),
('Whole Milk', 'null', 0 ),
('Mayonnaise', 'null', 0),
('Chiles', 'null', 0 ),
('Almonds', 'null', 0 ),
('Bacon', 'null', 0 ),
('Mushrooms', 'null', 0),
('Coconut', 'null', 0 ),
('Beets', 'null',0 ),
('Strawberries', 'null', 0 ),
('Fennel', 'null', 0 ),
('Lamb', 'null', 0),
('Apple', 'null', 0 ),
('Shrimp', 'null', 0 ),
('Green Onions', 'null', 0 ),
('Pepper', 'null', 0),
('Water', 'null', 0 );


-- Seed Data for the recipes table
INSERT INTO Recipes (name, is_public, date_created) VALUES
('Almond Cake', TRUE, '2020-11-1' ),
('Hamburger Gravy', TRUE, '2020-11-1' ),
('Shrimp Scampi', TRUE, '2020-11-1' ),
('Chicken and Mushroom', TRUE, '2020-11-1' ),
('Herb Roasted Chicken', TRUE, '2020-11-1' );


-- Required data for the ethical score, will create after team meeting


