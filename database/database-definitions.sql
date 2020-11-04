-- CS361 OSU Fall 2020 Zero Rows Returned
-- The queries in this file initialize the Database Tables for the project.
-- This file will be run on database initialization to set up the database.
-- Right now it does not delete any data, but it could TRUNCATE TABLE or
-- even drop & recreate the entire database if you want a fresh start every time.

-- Using the CHARACTER SET=utf8mb4; flag allows for Unicode characters (non-ASCII), including emoji :)

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
('Water', 'null', 0 );


-- Seed Data for the recipes table
INSERT INTO Recipes (name, is_public, date_created) VALUES
('Almond Cake', TRUE, '2020-11-1' ),
('Hamburger Gravy', TRUE, '2020-11-1' ),
('Shrimp Scampi', TRUE, '2020-11-1' ),
('Chicken and Mushroom', TRUE, '2020-11-1' ),
('Herb Roasted Chicken', TRUE, '2020-11-1' );


-- Required data for the ethical score, will create after team meeting


