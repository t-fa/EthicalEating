const { buildResponseList, toJSON } = require("./utils");
const { Recipe } = require("./Recipes");
const { Ingredient } = require("./Ingredients");

/*
RecipeBookRecipe maps a Recipe in a User's RecipeBook to a Recipe object.
There is exactly 0 or 1 RecipeBookRecipe rows for a given Recipe and RecipeBook.
That is, a RecipeBook may not contain multiple copies of the same Recipe.
*/

// RecipeBookRecipe class. A database query for RecipeBookRecipes returns instances of this RecipeBookRecipe class.
class RecipeBookRecipe {
  constructor({ id, recipeID, recipeBookID } = {}) {
    this.id = id;
    this.recipeID = recipeID;
    this.recipeBookID = recipeBookID;
  }

  // fromDatabaseRow returns an instance of the class, populating data from database row @dbRow.
  static fromDatabaseRow(dbRow) {
    return new RecipeBookRecipes({
      id: dbRow.id,
      recipeID: dbRow.recipe_id,
      recipeBookID: dbRow.recipebook_id,
    });
  }

  // getID returns the ID of the RecipeBookRecipe.
  getID() {
    return this.id;
  }

  // toJSON returns a JSON representation of the entity with private ("_"-prefixed) fields removed.
  toJSON() {
    return toJSON(this);
  }
}

// RecipeBookRecipes defines queries for RecipeBookRecipes. Instantiated with
// @database, a reference to the mysql connection pool to be used for queries.
const RecipeBookRecipes = (database) => {
  // Define any Error messages or Data Validator functions for the module.
  const Errors = {};
  const Validators = {};

  // ======> BEGIN QUERIES <======

  // We attach all these queries to the recipeBookRecipes object which gets
  // returned and exported from the module.
  const recipeBookRecipes = {};

  /**
    getAllRecipes fetches all RecipeBookRecipes from the RecipeBook with ID @recipeBookID
    and returns a list of Recipe objects.
    => Receives:
      + recipeBookID: ID of RecipeBook from which to fetch Recipes.
      + callback function(error, data)
    => Returns: by calling @callback with:
      + (null, []Recipe) a list of Recipe objects on query success. List may be empty.
      + (Error, null) if an error occurs.
    => Code Example:
      // Get a list of every Recipe object in RecipeBook with ID @recipeBookID = 1.
      RecipeBookRecipes.getAllRecipes({recipeBookID: 1}, (err, listOfRecipeObjects) => {
        if (err) { // Couldn't fetch the recipes.
          console.log(err);
          return; // bail out of the handler here, listOfRecipeObjects undefined
        }
        // Fetched list of Recipes in RecipeBook.
        console.log("listOfRecipeObjects:", listOfRecipeObjects);
      });
  */
  recipeBookRecipes.getAllRecipes = ({ recipeBookID }, callback) => {
    database.execute(
      `
      SELECT * FROM RecipeBookRecipes rbr
      INNER JOIN Recipes r
      ON rbr.recipe_id = r.id
      WHERE rbr.recipebook_id = ?
      `,
      [recipeBookID],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        buildResponseList(err, rows, Recipe, callback);
      }
    );
  };

  /**
    getAllRecipesWithIngredients fetches all RecipeBookRecipes from the RecipeBook with ID @recipeBookID
    and returns list of objects containing Recipes and a list of each Recipe's Ingredient objects.
    => Receives:
      + recipeBookID: ID of RecipeBook from which to fetch Recipes.
      + callback function(error, data)
    => Returns: by calling @callback with:
      + (null, []{recipe:Recipe, ingredients: []Ingredient})
        => Returns a list (possibly empty) of objects with keys "recipe" and
        "ingredients". "recipe" maps to the Recipe object and "ingredients" maps to a list
        of Ingredient objects constituting that Recipe's Ingredients. List may be empty.
      + (Error, null) if an error occurs.
    => Code Example:
      // Get a list of every Recipe object in RecipeBook with ID @recipeBookID = 1.
      RecipeBookRecipes.getAllRecipes({recipeBookID: 1}, (err, listOfRecipeAndIngredientObjects) => {
        if (err) {
          // Couldn't fetch the recipes.
          console.log(err);
          return; // bail out of the handler here, listOfRecipeAndIngredientObjects undefined
        }
        // Fetched list of Recipes in RecipeBook.
        console.log("listOfRecipeAndIngredientObjects:", listOfRecipeAndIngredientObjects);
      });
    => Sample Returned Data:
        [
          {
          "recipe": {
            "id": 1,
            "name": "Recipe 1",
            "isPublic": 1
          },
          "ingredients": [
            {
              "id": 1,
              "name": "ingredient 1",
              "description": "description 1"
            },
            {
              "id": 2,
              "name": "ingredient 2",
              "description": "description 2"
            }
          ]
      },
      {
        "recipe": {
          "id": 2,
          "name": "Recipe 2",
          "isPublic": 1
        },
        "ingredients": [
          {
            "id": 2,
            "name": "ingredient 2",
            "description": "description 2"
          }
        ]
      }
    ]
  */
  recipeBookRecipes.getAllRecipesWithIngredients = (
    { recipeBookID },
    callback
  ) => {
    // TODO: ensure when we deploy that JSON_ARRAYAGG function is present
    // in the database we are using. If not, break up query into multiple.
    database.execute(
      `
      SELECT *, CONCAT(CONCAT('[', JSON_ARRAYAGG(data.ingredients)), ']') as ingredients FROM
      (
        SELECT r.id, r.name, r.is_public,
          (
            SELECT
            JSON_OBJECT("id", i.id, "name", i.name, "description", i.description)
            FROM Ingredients
            WHERE id = i.id
          ) as "ingredients"
        FROM RecipeBookRecipes rbr
        INNER JOIN Recipes r ON rbr.recipe_id = r.id
        INNER JOIN RecipeIngredients ri ON ri.recipe_id = r.id
        INNER JOIN Ingredients i ON ri.ingredient_id = i.id
        WHERE rbr.recipebook_id = ?
      ) data
      GROUP BY data.id
      `,
      [recipeBookID],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(
          err,
          rows.map((recipeWithIngredients) => {
            const parsedIngredients = JSON.parse(
              recipeWithIngredients.ingredients
            );
            const recipe = Recipe.fromDatabaseRow(recipeWithIngredients);
            const ingredients = parsedIngredients.map((ingredient) =>
              Ingredient.fromDatabaseRow(ingredient).toJSON()
            );
            return { recipe, ingredients };
          })
        );
      }
    );
  };

  return { recipeBookRecipes, Errors, Validators };
};

module.exports = { RecipeBookRecipes, RecipeBookRecipe };
