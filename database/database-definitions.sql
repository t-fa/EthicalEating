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
