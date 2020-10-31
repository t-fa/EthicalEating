// This module exports the different Entity models, instantiating
// each of them with a handle to the database connection pool that
// the models will use to perform queries.

const { pool } = require("./client");

// Import these models into your Route handlers where needed. For instance:
// const {
//   Users, Recipes, RecipeBooks, Ingredients, RecipeBookRecipes, IngredientReplacements
// } = require("./database");
// You can then use the methods on the models you imported.
// See the models modules in this folder for documentation and examples.
const { Users } = require("./Users");
const { Recipes } = require("./Recipes");
const { RecipeBooks } = require("./RecipeBooks");
const { Ingredients } = require("./Ingredients");
const { RecipeBookRecipes } = require("./RecipeBookRecipes");
const { IngredientReplacements } = require("./IngredientReplacements");

// Export an instance of each model, instantiated with pool.
// TODO: Should these be singletons / have some factory fn?
module.exports = {
  Users: Users(pool),
  Recipes: Recipes(pool),
  RecipeBooks: RecipeBooks(pool),
  Ingredients: Ingredients(pool),
  RecipeBookRecipes: RecipeBookRecipes(pool),
  IngredientReplacements: IngredientReplacements(pool),
};
