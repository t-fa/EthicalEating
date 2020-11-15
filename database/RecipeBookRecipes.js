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
  // Define any Error messages for the module.
  const Errors = {};

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

  return { ...recipeBookRecipes, Errors };
};

module.exports = { RecipeBookRecipes, RecipeBookRecipe };
