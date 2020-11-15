const { buildCreateResponse, toJSON, buildResponseList } = require("./utils");
const { Recipe } = require("./Recipes");

/*
RecipeBook represents a User's RecipeBook in the system.
RecipeBooks have an id and an ownerID. ownerID is a foreign key to the userID
to which the RecipeBook belongs. Users may have exactly 0 or 1 RecipeBook.
*/

// RecipeBook class. A database query for RecipeBooks returns instances of the RecipeBook class.
class RecipeBook {
  constructor({ id, ownerID } = {}) {
    this.id = id;
    this.ownerID = ownerID;
  }

  // fromDatabaseRow returns an instance of the class, populating data from database row @dbRow.
  static fromDatabaseRow(dbRow) {
    return new RecipeBook({
      id: dbRow.id,
      ownerID: dbRow.owner_id,
    });
  }

  // getID returns the ID of the RecipeBook.
  getID() {
    return this.id;
  }

  // toJSON returns a JSON representation of the entity with private ("_"-prefixed) fields removed.
  toJSON() {
    return toJSON(this);
  }
}

// RecipeBooks defines queries for RecipeBooks. Instantiated with @database,
// a reference to the mysql connection pool to be used for queries.
const RecipeBooks = (database) => {
  // Define any Error messages or Data Validator functions for the module.
  const Errors = {
    notFound: "No RecipeBook with that ID exists.",
    recipeBookAlreadyExists: "RecipeBook already exists for user.",
  };

  const Validators = {};

  // ======> BEGIN QUERIES <======

  // We attach all these queries to the recipeBook object which gets returned and exported from the module.
  const recipeBook = {};

  /**
    addRecipeByIDToRecipeBookWithID adds the Recipe with ID @recipeID to the RecipeBook with ID @recipeBookID.
    Fails if either Recipe with ID does not exist, RecipeBook with ID does not exist, or Recipe with ID
    already exists in the RecipeBook.
    => Receives:
      + recipeID: ID of Recipe to add to RecipeBook with ID recipeBookID.
      + recipeBookID: ID of RecipeBook into which to add a new Recipe.
      + callback function(error, data)
    => Returns: by calling @callback with:
      + (null, insertionInfo) on addition success.
      + (Error, null) if an error occurs.
  */
  recipeBook.addRecipeByIDToRecipeBookWithID = (
    { recipeID, recipeBookID },
    callback
  ) => {
    database.execute(
      "INSERT INTO RecipeBookRecipes(recipe_id, recipebook_id) VALUES(?, ?)",
      [recipeID, recipeBookID],
      (err, data) => callback(err, data)
    );
  };

  /**
    getRecipesForRecipeBookID returns a list of Recipe objects for all the Recipes in
    the RecipeBook with ID = @recipeBookID. Returns both public and private Recipes.
    => Receives:
      + recipeBookID: ID of RecipeBook from which to fetch list of Recipes.
      + callback: function(error, data)
    => Returns by calling @callback with:
      + (null, []Recipe) array of Recipe objects on query success. Array may be empty.
      + (Error, null) if an error occurs.
  */
  recipeBook.getRecipesForRecipeBookID = ({ recipeBookID }, callback) => {
    database.execute(
      `
      SELECT r.* FROM RecipeBookRecipes rbr
      INNER JOIN Recipes r ON r.id = rbr.recipe_id
      WHERE recipebook_id = ?
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

  return { ...recipeBook, Errors, Validators };
};

module.exports = { RecipeBooks, RecipeBook };
