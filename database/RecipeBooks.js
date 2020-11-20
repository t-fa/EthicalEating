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
  // Define any Error messages for the module.
  const Errors = {};

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

  return { ...recipeBook, Errors };
};

module.exports = { RecipeBooks, RecipeBook };
