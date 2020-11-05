-- CS361 OSU Fall 2020 Zero Rows Returned
-- The queries in this file initialize the Database Tables for the project.
-- This file will be run on database initialization to set up the database.
-- Right now it does not delete any data, but it could TRUNCATE TABLE or
-- even drop & recreate the entire database if you want a fresh start every time.

-- Using the CHARACTER SET=utf8mb4; flag allows for Unicode characters (non-ASCII), including emoji :)

DROP DATABASE IF EXISTS EthicalEating;
CREATE DATABASE IF NOT EXISTS EthicalEating;
USE EthicalEating;

-- Creates the recipe table based on schema design
CREATE TABLE IF NOT EXISTS Recipes(
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  is_public BOOLEAN NOT NULL,
  date_created DATE
) CHARACTER SET=utf8mb4;

-- Creates the Ingredients table based on schema design
CREATE TABLE IF NOT EXISTS Ingredients(
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  name VARCHAR(255),
  description VARCHAR(255),
  ethical_reason VARCHAR(255)
) CHARACTER SET=utf8mb4;

-- Creates the RecipeIngredients table based on schema design
CREATE TABLE IF NOT EXISTS RecipeIngredients(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ingredient_id INT,
  recipe_id INT,
  FOREIGN KEY (ingredient_id) REFERENCES Ingredients (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES Recipes (id) ON DELETE CASCADE ON UPDATE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE IF NOT EXISTS Users(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(99) NOT NULL,
  recipebook_id INT NOT NULL DEFAULT -1,
  password VARCHAR(99) NOT NULL,
  CONSTRAINT UNIQUE(username)
) CHARACTER SET=utf8mb4;

CREATE TABLE IF NOT EXISTS RecipeBooks(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  -- Only allow a single RecipeBook per User.
  CONSTRAINT UNIQUE(owner_id),
  FOREIGN KEY(owner_id) REFERENCES Users (id) ON UPDATE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE IF NOT EXISTS RecipeBookRecipes(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  recipebook_id INT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES Recipes (id),
  FOREIGN KEY (recipebook_id) REFERENCES RecipeBooks (id)
) CHARACTER SET=utf8mb4;

CREATE TABLE IF NOT EXISTS IngredientReplacements(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ingredient_id_replaces INT NOT NULL,
  ingredient_id_replacement INT NOT NULL,
  replacement_reason VARCHAR(512),
  replacement_reason_source VARCHAR(512),
  FOREIGN KEY (ingredient_id_replaces) REFERENCES Ingredients (id),
  FOREIGN KEY (ingredient_id_replacement) REFERENCES Ingredients (id)
) CHARACTER SET=utf8mb4;

-- The file below will be used to seed the database with the initial 
-- recipes and ingredients. This file may be merged with the creation file
-- after testing has been performed.

-- Seed data for the ingredients
INSERT INTO Ingredients (name, description, ethical_reason) VALUES
('Olive Oil', 'Olive based cooking Oil' , 'null'),
('White Flour', 'Wheat based baking flour', 'null' ),
('Butter', 'Semi-solid dairy product', 'null' ),
('Chicken', 'Meat,Poultry, Animal product', 'null' ),
('Sugar', 'Sweetening agent', 'null'),
('Salt', 'Spice','null'),
('Egg', 'Chicken Egg, Animal product', 'null' ),
('Rice', 'Cereal grain', 'null' ),
('Vegetable Oil', 'Corn based cooking oil', 'null' ),
('Pork', 'Pork, Bacon, Ham, Animal Product', 'null' ),
('Beef', 'Cow, Beef, Hamburger','null' ),
('Cheese', 'Fermented Dairy Product, Animal product', 'null' ),
('Garlic', 'Garnish, Spice', 'null'),
('Orange', 'Fruit', 'null'),
('Turkey', 'Turkey meat, Animal product', 'null'),
('Onion', 'Vegetable, Spice, Garnish', 'null' ),
('Corn', 'Corn, Maize, Cereal grain ', 'null'),
('Whole Milk', 'Cows Milk, Animal product', 'null' ),
('Mayonnaise', 'Egg based condiment', 'null'),
('Chiles', 'Plant product, Spice', 'null' ),
('Almonds', 'Plant product', 'null'),
('Bacon', 'Bacon, Pork, Animal product', 'null' ),
('Mushrooms', 'Plant based product, Garnish', 'null'),
('Coconut', 'Fruit', 'null' ),
('Beets', 'Root Vegetable','null' ),
('Strawberries', 'Fruit', 'null' ),
('Fennel', 'Vegetable, Herb, Spice', 'null' ),
('Lamb', 'Lamb, Animal based product', 'null'),
('Apple', 'Fruit', 'null' ),
('Shrimp', 'Shrimp, Animal based product', 'null' ),
('Green Onions', 'Vegetable, Garnish, ', 'null'),
('Pepper', 'Spice', 'null'),
('Water', 'Water', 'null' ),
('Cashew', 'Legume', 'null' );

-- Seed Data for the recipes table
INSERT INTO Recipes (name, is_public, date_created) VALUES
('Almond Cake', TRUE, '2020-11-1' ),
('Hamburger Gravy', TRUE, '2020-11-1' ),
('Shrimp Scampi', TRUE, '2020-11-1' ),
('Chicken and Mushroom', TRUE, '2020-11-1' ),
('Herb Roasted Chicken', TRUE, '2020-11-1' );


-- Required data for the ethical score, will create after team meeting
INSERT INTO RecipeIngredients(recipe_id, ingredient_id) VALUES
-- Almond Cake
(1,2), 
(1,5),
(1,3),
(1,7),
(1,21),
(1,6),
-- Hamurber Gravy
(2,11),
(2,6),
(2,13),
(2,16),
(2,3),
(2,2),
(2,18),
-- Shrimp Scampi
(3,16),
(3,20),
(3,13),
(3,29),
(3,31),
(3,8),
(3,24),
-- Chicken and Mushroom
(4,4),
(4,6),
(4,1),
(4,33),
(4,3),
(4,23),
-- Herb Roasted Chicken
(5,15),
(5,6),
(5,3),
(5,16),
(5,1),
(5,25),
(5,13);


-- Add Ingredient Replacements
INSERT INTO IngredientReplacements(ingredient_id_replaces, ingredient_id_replacement, replacement_reason, replacement_reason_source) VALUES
(
  (SELECT id FROM Ingredients WHERE name = "Butter"),
  (SELECT id FROM Ingredients WHERE name = "Olive Oil"),
  "Olive oil can be used as a substitute for butter in many recipes. Butter, an animal product, requires lots more water to produce.",
  "https://waterfootprint.org/media/downloads/Report-48-WaterFootprint-AnimalProducts-Vol1_1.pdf"
),
(
  (SELECT id FROM Ingredients WHERE name = "Sugar"),
  (SELECT id FROM Ingredients WHERE name = "Coconut Sugar"),
  "Coconut sugar can be grown using less water with higher crop yields for a given size plot of land.",
  "https://www.thegivingnature.com/coconut-sugar/"
),
(
  (SELECT id FROM Ingredients WHERE name = "Egg"),
  (SELECT id FROM Ingredients WHERE name = "Flaxseed"),
  "Flaxseed can be used as an egg substitute in many recipes. It is more environmentally sustainable than animal products.",
  "https://healabel.com/f-ingredients/flaxseed"
),
(
  (SELECT id FROM Ingredients WHERE name = "Rice"),
  (SELECT id FROM Ingredients WHERE name = "Potatoes"),
  "Potatoes require almost five times less water to produce than rice.",
  "https://www.potatobusiness.com/trends-news/potatoes-have-a-lower-environmental-impact-than-rice-or-pasta-research-says/"
),
(
  (SELECT id FROM Ingredients WHERE name = "Rice"),
  (SELECT id FROM Ingredients WHERE name = "Pasta"),
  "Pasta requires less water to produce than rice.",
  "https://www.potatobusiness.com/trends-news/potatoes-have-a-lower-environmental-impact-than-rice-or-pasta-research-says/"
),
(
  (SELECT id FROM Ingredients WHERE name = "Vegetable Oil"),
  (SELECT id FROM Ingredients WHERE name = "Sunflower Oil (cold-pressed)"),
  "Vegetable oil is extracted with hazardous solvents and can have a higher environmental impact than cold-pressed, natural extraction methods.",
  "https://www.sciencedirect.com/science/article/abs/pii/S0960308511000198"
),
(
  (SELECT id FROM Ingredients WHERE name = "Pork"),
  (SELECT id FROM Ingredients WHERE name = "Beyond Meat Meat Substitute"),
  "Beef takes lots of water to produce. Beyond Meat requires 99% less water.",
  "http://css.umich.edu/publication/beyond-meats-beyond-burger-life-cycle-assessment-detailed-comparison-between-plant-based"
),
(
  (SELECT id FROM Ingredients WHERE name = "Pork"),
  (SELECT id FROM Ingredients WHERE name = "Tempeh"),
  "Tempeh has a low water footprint and does not have an impact on the environment from livestock raising.",
  "https://healabel.com/t-ingredients/tempeh"
),
(
  (SELECT id FROM Ingredients WHERE name = "Beef"),
  (SELECT id FROM Ingredients WHERE name = "Beyond Meat Meat Substitute"),
  "Beef takes lots of water to produce. Beyond Meat requires 99% less water.",
  "http://css.umich.edu/publication/beyond-meats-beyond-burger-life-cycle-assessment-detailed-comparison-between-plant-based"
),
(
  (SELECT id FROM Ingredients WHERE name = "Beef"),
  (SELECT id FROM Ingredients WHERE name = "Chicken"),
  "Chicken requires less water to produce than beef.",
  "https://waterfootprint.org/media/downloads/Report-48-WaterFootprint-AnimalProducts-Vol1_1.pdf"
),
(
  (SELECT id FROM Ingredients WHERE name = "Beef"),
  (SELECT id FROM Ingredients WHERE name = "Salmon"),
  "Salmon has a lower environmental impact than meat and can often be a substitute.",
  "https://www.ecoandbeyond.co/articles/most-environmentally-friendly-meat/"
),
(
  (SELECT id FROM Ingredients WHERE name = "Beef"),
  (SELECT id FROM Ingredients WHERE name = "Tempeh"),
  "Tempeh has a low water footprint and does not have an impact on the environment from livestock raising.",
  "https://healabel.com/t-ingredients/tempeh"
),
(
  (SELECT id FROM Ingredients WHERE name = "Whole Milk"),
  (SELECT id FROM Ingredients WHERE name = "Coconut Milk"),
  "Coconut milk has a lower environmental impact to produce than whole milk.",
  "https://www.greenmatters.com/p/eco-friendly-non-dairy-milks"
),
(
  (SELECT id FROM Ingredients WHERE name = "Almonds"),
  (SELECT id FROM Ingredients WHERE name = "Hazlenuts"),
  "Hazlenuts require less water to produce than other nuts like Almonds or Cashews.",
  "https://healabel.com/a-ingredients/almonds https://healabel.com/h-ingredients/hazelnuts"
),
(
  (SELECT id FROM Ingredients WHERE name = "Almonds"),
  (SELECT id FROM Ingredients WHERE name = "Sunflower Seeds"),
  "Sunflower Seeds require less water to produce than Almonds.",
  "https://www.nomeatathlete.com/sunflower-seed-sauce/"
),
(
  (SELECT id FROM Ingredients WHERE name = "Bacon"),
  (SELECT id FROM Ingredients WHERE name = "Chicken"),
  "Chicken requires less water to produce than bacon.",
  "https://waterfootprint.org/media/downloads/Report-48-WaterFootprint-AnimalProducts-Vol1_1.pdf"
),
(
  (SELECT id FROM Ingredients WHERE name = "Bacon"),
  (SELECT id FROM Ingredients WHERE name = "Tempeh"),
  "Tempeh has a low water footprint and does not have an impact on the environment from livestock raising.",
  "https://healabel.com/t-ingredients/tempeh"
),
(
  (SELECT id FROM Ingredients WHERE name = "Lamb"),
  (SELECT id FROM Ingredients WHERE name = "Turkey"),
  "Turkey requires less impact than some other meats like beef or lamb.",
  "https://www.ecoandbeyond.co/articles/most-environmentally-friendly-meat/"
),
(
  (SELECT id FROM Ingredients WHERE name = "Lamb"),
  (SELECT id FROM Ingredients WHERE name = "Salmon"),
  "Salmon has a lower environmental impact than meat and can often be a substitute.",
  "https://www.ecoandbeyond.co/articles/most-environmentally-friendly-meat/"
),
(
  (SELECT id FROM Ingredients WHERE name = "Lamb"),
  (SELECT id FROM Ingredients WHERE name = "Beyond Meat Meat Substitute"),
  "Lamb takes lots of water to produce. Beyond Meat requires 99% less water.",
  "http://css.umich.edu/publication/beyond-meats-beyond-burger-life-cycle-assessment-detailed-comparison-between-plant-based"
),
(
  (SELECT id FROM Ingredients WHERE name = "Lamb"),
  (SELECT id FROM Ingredients WHERE name = "Tempeh"),
  "Tempeh has a low water footprint and does not have an impact on the environment from livestock raising.",
  "https://healabel.com/t-ingredients/tempeh"
),
(
  (SELECT id FROM Ingredients WHERE name = "Cashew"),
  (SELECT id FROM Ingredients WHERE name = "Sunflower Seeds"),
  "Sunflower Seeds require less water to produce than Cashews.",
  "https://www.nomeatathlete.com/sunflower-seed-sauce/"
),
(
  (SELECT id FROM Ingredients WHERE name = "Cashew"),
  (SELECT id FROM Ingredients WHERE name = "Hazlenuts"),
  "Hazlenuts require less water to produce than other nuts like Cashews.",
  "https://www.huffpost.com/entry/food-water-footprint_n_5952862"
),
(
  (SELECT id FROM Ingredients WHERE name = "Lentils"),
  (SELECT id FROM Ingredients WHERE name = "Tofu"),
  "Tofu requires less than half the water to produce than lentils.",
  "https://www.huffpost.com/entry/food-water-footprint_n_5952862"
);
