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
INSERT INTO Ingredients (name, description, is_ethical) VALUES
('Olive Oil', 'Olive based cooking Oil' , '1'),
('White Flour', 'Wheat based baking flour', '1' ),
('Butter', 'Semi-solid dairy product', '0' ),
('Chicken', 'Meat, Poultry, Animal product', '1' ),
('Salmon', 'Fish, Animal product', '1' ),
('Sugar', 'Sweetening agent', '0'),
('Coconut Sugar', 'Sweetening agent', '1'),
('Salt', 'Spice','1'),
('Egg', 'Chicken Egg, Animal product', '0' ),
('Flaxseed', 'Egg replacement', '1' ),
('Rice', 'Cereal grain', '0' ),
('Pasta', 'Cereal grain', '1' ),
('Potatoes', 'A classic tuber', '1'),
('Vegetable Oil', 'Corn based cooking oil', '0' ),
('Sunflower Oil (cold-pressed)', 'Seed based cooking oil', '1' ),
('Pork', 'Pork, Bacon, Ham, Animal Product', '0' ),
('Tempeh', 'Fermented soybean meat substitute', '1' ),
('Beyond Meat Meat Substitute', 'Meat substitute', '1' ),
('Beef', 'Cow, Beef, Hamburger','0' ),
('Cheese', 'Fermented Dairy Product, Animal product', '1' ),
('Garlic', 'Garnish, Spice', '1'),
('Orange', 'Fruit', '1'),
('Turkey', 'Turkey meat, Animal product', '1'),
('Onion', 'Vegetable, Spice, Garnish', '1' ),
('Corn', 'Corn, Maize, Cereal grain ', '1'),
('Whole Milk', 'Cows Milk, Animal product', '0' ),
('Mayonnaise', 'Egg based condiment', '1'),
('Chiles', 'Plant product, Spice', '1' ),
('Almonds', 'Plant product', '0'),
('Bacon', 'Bacon, Pork, Animal product', '0' ),
('Mushrooms', 'Plant based product, Garnish', '1'),
('Coconut', 'Fruit', '1' ),
('Coconut Milk', 'A plant-based milk', '1' ),
('Beets', 'Root Vegetable','1' ),
('Strawberries', 'Fruit', '1' ),
('Fennel', 'Vegetable, Herb, Spice', '1' ),
('Lamb', 'Lamb, Animal based product', '0'),
('Apple', 'Fruit', '1' ),
('Shrimp', 'Shrimp, Animal based product', '1' ),
('Green Onions', 'Vegetable, Garnish, ', '1'),
('Pepper', 'Spice', '1'),
('Water', 'Water', '1' ),
('Cashew', 'Legume', '0' ),
('Lentils', 'Legume', '0' ),
('Hazlenuts', 'Legume', '1' ),
('Sunflower Seeds', 'A small seed', '1' ),
('Tofu', 'A soy-based meat substitute', '1' );

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
(
  (SELECT id FROM Recipes WHERE name = 'Almond Cake'),
  (SELECT id FROM Ingredients WHERE name = 'White Flour')
),
(
  (SELECT id FROM Recipes WHERE name = 'Almond Cake'),
  (SELECT id FROM Ingredients WHERE name = 'Butter')
),
(
  (SELECT id FROM Recipes WHERE name = 'Almond Cake'),
  (SELECT id FROM Ingredients WHERE name = 'Sugar')
),
(
  (SELECT id FROM Recipes WHERE name = 'Almond Cake'),
  (SELECT id FROM Ingredients WHERE name = 'Salt')
),
(
  (SELECT id FROM Recipes WHERE name = 'Almond Cake'),
  (SELECT id FROM Ingredients WHERE name = 'Egg')
),
(
  (SELECT id FROM Recipes WHERE name = 'Almond Cake'),
  (SELECT id FROM Ingredients WHERE name = 'Almonds')
),
-- Hamurbger Gravy
(
  (SELECT id FROM Recipes WHERE name = 'Hamburger Gravy'),
  (SELECT id FROM Ingredients WHERE name = 'White Flour')
),
(
  (SELECT id FROM Recipes WHERE name = 'Hamburger Gravy'),
  (SELECT id FROM Ingredients WHERE name = 'Butter')
),
(
  (SELECT id FROM Recipes WHERE name = 'Hamburger Gravy'),
  (SELECT id FROM Ingredients WHERE name = 'Salt')
),
(
  (SELECT id FROM Recipes WHERE name = 'Hamburger Gravy'),
  (SELECT id FROM Ingredients WHERE name = 'Beef')
),
(
  (SELECT id FROM Recipes WHERE name = 'Hamburger Gravy'),
  (SELECT id FROM Ingredients WHERE name = 'Garlic')
),
(
  (SELECT id FROM Recipes WHERE name = 'Hamburger Gravy'),
  (SELECT id FROM Ingredients WHERE name = 'Onion')
),
(
  (SELECT id FROM Recipes WHERE name = 'Hamburger Gravy'),
  (SELECT id FROM Ingredients WHERE name = 'Whole Milk')
),
-- Shrimp Scampi
(
  (SELECT id FROM Recipes WHERE name = 'Shrimp Scampi'),
  (SELECT id FROM Ingredients WHERE name = 'Rice')
),
(
  (SELECT id FROM Recipes WHERE name = 'Shrimp Scampi'),
  (SELECT id FROM Ingredients WHERE name = 'Garlic')
),
(
  (SELECT id FROM Recipes WHERE name = 'Shrimp Scampi'),
  (SELECT id FROM Ingredients WHERE name = 'Onion')
),
(
  (SELECT id FROM Recipes WHERE name = 'Shrimp Scampi'),
  (SELECT id FROM Ingredients WHERE name = 'Chiles')
),
(
  (SELECT id FROM Recipes WHERE name = 'Shrimp Scampi'),
  (SELECT id FROM Ingredients WHERE name = 'Coconut')
),
(
  (SELECT id FROM Recipes WHERE name = 'Shrimp Scampi'),
  (SELECT id FROM Ingredients WHERE name = 'Apple')
),
(
  (SELECT id FROM Recipes WHERE name = 'Shrimp Scampi'),
  (SELECT id FROM Ingredients WHERE name = 'Green Onions')
),
-- Chicken and Mushroom
(
  (SELECT id FROM Recipes WHERE name = 'Chicken and Mushroom'),
  (SELECT id FROM Ingredients WHERE name = 'Olive Oil')
),
(
  (SELECT id FROM Recipes WHERE name = 'Chicken and Mushroom'),
  (SELECT id FROM Ingredients WHERE name = 'Butter')
),
(
  (SELECT id FROM Recipes WHERE name = 'Chicken and Mushroom'),
  (SELECT id FROM Ingredients WHERE name = 'Chicken')
),
(
  (SELECT id FROM Recipes WHERE name = 'Chicken and Mushroom'),
  (SELECT id FROM Ingredients WHERE name = 'Salt')
),
(
  (SELECT id FROM Recipes WHERE name = 'Chicken and Mushroom'),
  (SELECT id FROM Ingredients WHERE name = 'Mushrooms')
),
(
  (SELECT id FROM Recipes WHERE name = 'Chicken and Mushroom'),
  (SELECT id FROM Ingredients WHERE name = 'Water')
),
-- Herb Roasted Chicken
(
  (SELECT id FROM Recipes WHERE name = 'Herb Roasted Chicken'),
  (SELECT id FROM Ingredients WHERE name = 'Olive Oil')
),
(
  (SELECT id FROM Recipes WHERE name = 'Herb Roasted Chicken'),
  (SELECT id FROM Ingredients WHERE name = 'Butter')
),
(
  (SELECT id FROM Recipes WHERE name = 'Herb Roasted Chicken'),
  (SELECT id FROM Ingredients WHERE name = 'Salt')
),
(
  (SELECT id FROM Recipes WHERE name = 'Herb Roasted Chicken'),
  (SELECT id FROM Ingredients WHERE name = 'Garlic')
),
(
  (SELECT id FROM Recipes WHERE name = 'Herb Roasted Chicken'),
  (SELECT id FROM Ingredients WHERE name = 'Turkey')
),
(
  (SELECT id FROM Recipes WHERE name = 'Herb Roasted Chicken'),
  (SELECT id FROM Ingredients WHERE name = 'Onion')
),
(
  (SELECT id FROM Recipes WHERE name = 'Herb Roasted Chicken'),
  (SELECT id FROM Ingredients WHERE name = 'Beets')
);

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


-- Views that help compute intermediate results and can be used to form more complex queries.

-- The IngredientAndItsReplacements view consists of 1 row for every Ingredient
-- with the Ingredient's ID, name, and description, and a "replacements" column
-- that contains every IngredientReplacement for that Ingredient as a JSON object.
CREATE SQL SECURITY INVOKER VIEW IngredientAndItsReplacements as
SELECT
    i.id,
    i.name,
    i.description,
    json_arrayagg(
        json_object(
            "id",
            i2.id,
            "name",
            i2.name,
            "description",
            i2.description,
            "replacement_reason",
            ir.replacement_reason,
            "replacement_reason_source",
            ir.replacement_reason_source
        )
    ) as replacements
FROM
    Ingredients i
    INNER JOIN IngredientReplacements ir ON ir.ingredient_id_replaces = i.id
    INNER JOIN Ingredients i2 ON ir.ingredient_id_replacement = i2.id
GROUP BY
    i.id;

-- The RecipeAndItsIngredients view consists of 1 row for every Recipe with the
-- Recipe's ID, name, is_public status and date_created and an Ingredients column
-- that contains every Ingredient in that Recipe as a JSON object.
CREATE
SQL SECURITY INVOKER
VIEW RecipeAndItsIngredients as
SELECT
    r.id,
    r.name,
    r.is_public,
    r.date_created,
    JSON_ARRAYAGG(
        json_object(
            "id",
            i.id,
            "name",
            i.name,
            "description",
            i.description
        )
    ) as ingredients
FROM
    Recipes r
    INNER JOIN RecipeIngredients ri ON r.id = ri.recipe_id
    INNER JOIN Ingredients i ON ri.ingredient_id = i.id
GROUP BY
    r.id;

-- The RecipeItsIngredientsAndTheirReplacements view consists of 1 row for every
-- Recipe with the Recipe's ID, name, is_public status and date_created and an
-- Ingredients column that contains every Ingredient in that Recipe as a JSON object
-- along with every available IngredientReplacement for each of these Ingredients.
CREATE
SQL SECURITY INVOKER
VIEW RecipeItsIngredientsAndTheirReplacements as
SELECT
    r.id,
    r.name,
    r.is_public,
    r.date_created,
    JSON_ARRAYAGG(
        json_object(
            "ingredient",
            json_object(
                "id",
                i.id,
                "name",
                i.name,
                "description",
                i.description
            ),
            "replacements",
            (
                SELECT
                    json_arrayagg(
                        json_object(
                            "id",
                            i2.id,
                            "name",
                            i2.name,
                            "description",
                            i2.description,
                            "replacement_reason",
                            ir.replacement_reason,
                            "replacement_reason_source",
                            ir.replacement_reason_source
                        )
                    )
                FROM
                    Ingredients ii
                    INNER JOIN IngredientReplacements ir ON ir.ingredient_id_replaces = ii.id
                    INNER JOIN Ingredients i2 ON ir.ingredient_id_replacement = i2.id
                GROUP BY
                    ii.id
                HAVING
                    ii.id = i.id
            )
        )
    ) as ingredients_and_replacements
FROM
    Recipes r
    INNER JOIN RecipeIngredients ri ON r.id = ri.recipe_id
    INNER JOIN Ingredients i ON ri.ingredient_id = i.id
GROUP BY
    r.id;
