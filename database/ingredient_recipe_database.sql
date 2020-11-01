-- Recipe and Ingredient database for merging with main database file: 
-- Added standard charset to match company databasefile
CREATE DATABASE IF NOT EXISTS EthicalEating; 
USE EthicalEating;

-- Creates the recipe table based on schema design
CREATE TABLE IF NOT EXISTS Recipes(
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  is_public BOOLEAN NOT NULL,
  date_created DATE
)CHARACTER SET=utf8mb4;

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
