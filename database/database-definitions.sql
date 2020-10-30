-- CS361 OSU Fall 2020 Zero Rows Returned
-- The queries in this file initialize the Database Tables for the project.
-- This file will be run on database initialization to set up the database.
-- Right now it does not delete any data, but it could TRUNCATE TABLE or
-- even drop & recreate the entire database if you want a fresh start every time.

-- Using the CHARACTER SET=utf8mb4; flag allows for Unicode characters (non-ASCII), including emoji :)

-- TODO: Tables To be defined
-- Recipes
-- Ingredients
-- RecipeIngredients

CREATE DATABASE IF NOT EXISTS EthicalEating;
USE EthicalEating;

CREATE TABLE IF NOT EXISTS Users(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(99) NOT NULL,
  password VARCHAR(99) NOT NULL,
  CONSTRAINT UNIQUE(username)
) CHARACTER SET=utf8mb4;

CREATE TABLE IF NOT EXISTS RecipeBooks(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE
) CHARACTER SET=utf8mb4;

-- TODO: commented out for now because creation fails since Recipes doesn't exist yet :)
-- See TABLES TO BE DEFINED at top.
-- CREATE TABLE IF NOT EXISTS RecipeBookRecipes(
--   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
--   recipe_id INT NOT NULL,
--   recipebook_id INT NOT NULL,
--   FOREIGN KEY (recipe_id) REFERENCES Recipes (id)
--   FOREIGN KEY (recipebook_id) REFERENCES RecipeBooks (id)
-- ) CHARACTER SET=utf8mb4;

-- TODO: commented out for now because creation fails since Ingredients doesn't exist yet :)
-- See TABLES TO BE DEFINED at top.
-- CREATE TABLE IF NOT EXISTS IngredientReplacements(
--     id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
--     ingredient_id_replaces INT NOT NULL,
--     ingredient_id_replacement INT NOT NULL,
--     FOREIGN KEY (ingredient_id_replaces) REFERENCES Ingredients (id)
--     FOREIGN KEY (ingredient_id_replacement) REFERENCES Ingredients (id)
-- ) CHARACTER SET=utf8mb4;
