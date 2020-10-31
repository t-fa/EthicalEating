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
    => Code Example:
      // Add Recipe with ID @recipeID = 2 to RecipeBook with ID @recipeBookId = 1.
      RecipeBooks.addRecipeByIDToRecipeBookWithID({recipeID: 2, recipeBookID: 1}, (err, insertionInfo) => {
        if (err) { // addition failed
          return;  // bail out of the handler here, insertionInfo undefined
        }
        // Addition successful. @insertionInfo contains info about the insert if needed.
      });
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
    => Code Example:
      // Get a list of every Recipe object for RecipeBook with ID @recipeBookID = 1.
      RecipeBooks.getRecipesForRecipeBookID(
        { recipeBookID: 1 },
        (err, listOfRecipeObjects) => {
          if (err) {
            if (err === RecipeBooks.Errors.notFound) {
              // No RecipeBook Recipes found.
              console.log(err);
              return; // bail out of the handler here, listOfRecipeObjects undefined
            }
            console.log("Some other database error:", err);
            return; // bail out of the handler here, listOfRecipeObjects undefined
          }
          // Fetched list of Recipes successfully.
          console.log("data", listOfRecipeObjects);
        }
      );
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

  /**
    createRecipeBookForOwningUserID creates a RecipeBook for User with ID = @userID.
    The addition will fail if a User with ID = @userID does not exist, or if the
    User with @userID already has a RecipeBook. On RecipeBook creation, the User's
    recipebook_id field is updated with the ID of the newly created RecipeBook.
    => Receives:
      + userID: userID for which to create a RecipeBook.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, RecipeBook) instance of the created RecipeBook on creation success.
      + (RecipeBooks.Errors.recipeBookAlreadyExists, null) if the RecipeBook already exists for the User.
      + (Error, null) if another error occurs.
    => Code Example:
      // Create a RecipeBook for User with ID @userID = 1.
      RecipeBooks.createRecipeBookForOwningUserID(
        { userID: 1 },
        (err, recipeBookObject) => {
          if (err) {
            if (err === RecipeBooks.Errors.recipeBookAlreadyExists) {
              // The RecipeBook already exists for the user.
              console.log(err); // bail out of the handler here, recipeBookObject undefined
              return;
            }
            console.log("Some other database error:", err);
            return; // bail out of the handler here, recipeBookObject undefined
          }
          // RecipeBook was created.
          console.log("recipeBookObject:", recipeBookObject, "json:", recipeBookObject.toJSON());
        }
      );
    */
  recipeBook.createRecipeBookForOwningUserID = ({ userID }, callback) => {
    database.execute(
      "INSERT INTO RecipeBooks(owner_id) VALUES(?)",
      [userID],
      (err, insertResult) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            callback(Errors.recipeBookAlreadyExists, null);
            return;
          }
          // Some other error occurred. No data.
          callback(err, null);
          return;
        }

        // Now update the User's recipebook_id with the new RecipeBook ID.
        const newRecipeBookID = insertResult.insertId;
        database.execute(
          "UPDATE Users SET recipebook_id = ? WHERE id = ?",
          [newRecipeBookID, userID],
          (err, rows) => {
            if (err) {
              // Some other error occurred. No data.
              callback(err, null);
              return;
            }
            // Query successful. Build response for callback.
            buildCreateResponse(
              err,
              rows,
              { id: newRecipeBookID, ownerID: userID },
              RecipeBook,
              callback
            );
          }
        );
      }
    );
  };

  return { ...recipeBook, Errors, Validators };
};

module.exports = { RecipeBooks, RecipeBook };
