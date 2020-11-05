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
  ethical_score INT
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
('Water', 'null', 0 ),
('Cashew', 'null', 0 ),
('Flaxseed', 'null', 0),
('Potatoes', 'null', 0),
('Pasta', 'null', 0),
('Sunflower Oil (cold-pressed)', 'null', 0),
('Beyond Meat Meat Substitute', 'null', 0),
('Tempeh', 'null', 0),
('Salmon', 'null', 0),
('Coconut Milk', 'null', 0),
('Hazlenuts', 'null', 0),
('Sunflower Seeds', 'null', 0),
('Tofu', 'null', 0),
('Lentils', 'null', 0),
('Coconut Sugar', 'null', 0);

-- Seed Data for the recipes table
INSERT INTO Recipes (name, is_public, date_created) VALUES
('Almond Cake', TRUE, '2020-11-1' ),
('Hamburger Gravy', TRUE, '2020-11-1' ),
('Shrimp Scampi', TRUE, '2020-11-1' ),
('Chicken and Mushroom', TRUE, '2020-11-1' ),
('Herb Roasted Chicken', TRUE, '2020-11-1' );


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