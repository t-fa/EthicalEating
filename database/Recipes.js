const { IngredientReplacement } = require("./IngredientReplacements");
const { Ingredient } = require("./Ingredients");
const {
  buildCreateResponse,
  toJSON,
  buildResponseList,
  nullOrUndefined,
} = require("./utils");

/*
Recipe represents a Recipe in the system. A Recipe has zero or more Ingredients.
A Recipe can have a public or private status. A Recipe is owned by a User and
can be placed into a RecipeBook.
*/

// Recipe class. A database query for Recipes returns instances of the Recipe class.
class Recipe {
  constructor({ id, name, isPublic, ownerId } = {}) {
    this.id = id;
    this.name = name;
    this.isPublic = isPublic;
    this.ownerId = ownerId;
  }

  // fromDatabaseRow returns an instance of the class, populating data from database row @dbRow.
  static fromDatabaseRow(dbRow) {
    return new Recipe({
      id: dbRow.id,
      name: dbRow.name,
      isPublic: dbRow.is_public === 1 ? true : false,
      ownerId: dbRow.owner_id,
    });
  }

  // getID returns the ID of the Recipe.
  getID() {
    return this.id;
  }

  // toJSON returns a JSON representation of the entity with private ("_"-prefixed) fields removed.
  toJSON() {
    return toJSON(this);
  }
}

// Recipes defines queries for Recipes. Instantiated with @database,
// a reference to the mysql connection pool to be used for queries.
const Recipes = (database) => {
  // Define any Error messages or Data Validator functions for the module.
  const Errors = {
    recipeBookAlreadyExists: "RecipeBook already exists for user.",
    recipeWithNameAlreadyExists:
      "Your RecipeBook already has a Recipe with this name.",
    recipeWithNameAlreadyExistsTryAgain:
      "Your RecipeBook already has a Recipe with this name, please try a different recipe name",
  };

  // ======> BEGIN QUERIES <======

  // We attach all these queries to the recipes object which gets returned and exported from the module.
  const recipes = {};

  /*
    createRecipeWithIngredients creates the Recipe with @name and @isPublic status having
    Ingredients with IDs given in @ingredientIDList.
    => Receives:
      + name: Name of the Recipe.
      + isPublic: Whether the Recipe is publicly visible.
      + ingredientIDList: A list of Ingredient IDs for the Ingredients in the recipe.
      + recipeBookID: ID of the RecipeBook into which to add this Recipe.
      + username: username of the User who owns the Recipe. This is null if it's a recipe we pre-populated.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, Recipe) with the Recipe object that was created.
      + (Error, null) if an error occurs.
  */
  recipes.createRecipeWithIngredients = (
    { name, isPublic, ingredientIDList, recipeBookID, username },
    callback
  ) => {
    database.execute(
      `
      INSERT INTO Recipes(name, is_public, date_created, owner_id)
      VALUES(
        ?,
        ?,
        CURDATE(),
        (SELECT id FROM Users WHERE username = ?)
      )
      `,
      [name, isPublic, username],
      (err, recipeInsert) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            callback(Errors.recipeWithNameAlreadyExistsTryAgain, null);
            return;
          }
          callback(err, null);
          return;
        }
        const recipeID = recipeInsert.insertId;
        // Sanity check ingredient IDs -- make sure all Integers.
        const cleanedIngredientIDs = ingredientIDList
          .filter((id) => Number.isInteger(Number(id)))
          .map((ingredientID) => [Number(ingredientID), recipeID]);
        database.query(
          "INSERT INTO RecipeIngredients(ingredient_id, recipe_id) VALUES ?",
          [cleanedIngredientIDs],
          (err, rows) => {
            if (err) {
              callback(err, null);
              return;
            }

            database.execute(
              "INSERT INTO RecipeBookRecipes(recipe_id, recipebook_id) VALUES(?, ?)",
              [recipeID, recipeBookID],
              (err, recipeBookInsert) => {
                if (err) {
                  callback(err, null);
                  return;
                }
                buildCreateResponse({
                  err,
                  rows,
                  callback,
                  entity: Recipe,
                  creationParams: { name, isPublic, ingredientIDList },
                });
              }
            );
          }
        );
      }
    );
  };

  /*
    updateRecipeWithIngredientsList updates the Ingredients list for the given Recipe with
    ID @recipeID to the Ingredients in list @ingredientIDList.
    => Receives:
      + recipeID: ID of the Recipe to update.
      + ingredientIDList: List of Ingredient IDs to set on the Recipe.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, Recipe) with the Recipe object that was created.
      + (Error, null) if an error occurs.
  */
  recipes.updateRecipeWithIngredientIDList = (
    { recipeID, ingredientIDList },
    callback
  ) => {
    database.execute(
      "DELETE FROM RecipeIngredients WHERE recipe_id = ?",
      [recipeID],
      (err, data) => {
        if (err) {
          callback(err, null);
          return;
        }
        // Sanity check ingredient IDs -- make sure all Integers.
        const cleanedIngredientIDs = ingredientIDList
          .filter((id) => Number.isInteger(Number(id)))
          .map((ingredientID) => [Number(ingredientID), recipeID]);
        database.query(
          "INSERT INTO RecipeIngredients(ingredient_id, recipe_id) VALUES ?",
          [cleanedIngredientIDs],
          (err, rows) => {
            if (err) {
              callback(err, null);
              return;
            }
            callback(null, null);
          }
        );
      }
    );
  };

  /**
    replaceIngredientForRecipeID replaces Ingredient with ID @toReplaceID with Ingredient with
    ID @replaceWithID for Recipe with ID @recipeID.
    => Receives:
      + toReplaceID: ID of the Ingredient to replace.
      + replaceWithID: ID of the Ingredient to replace with.
      + recipeID: ID of the Recipe in which to make the replacement.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, null) returns nothing on success
      + (Error, null) if an error occurs.
  */
  recipes.replaceIngredientForRecipeID = (
    { toReplaceID, replaceWithID, recipeID },
    callback
  ) => {
    database.execute(
      `
      UPDATE RecipeIngredients SET ingredient_id = ?
      WHERE id = (SELECT * FROM (
        SELECT id FROM RecipeIngredients WHERE ingredient_id = ? AND recipe_id = ?
      ) as subquery);
      `,
      [replaceWithID, toReplaceID, recipeID],
      (err) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, null);
      }
    );
  };

  /**
  togglePublicPrivate toggles a recipe from private to public, or public to private
  using recipeID
  => Receives:
      + resultantPublicity: 'true' for set to Public, 'false' for set to Private
      + recipeID: ID of the Recipe in which to make the toggle.
      + callback: function(error, data)
  => Returns: by calling @callback with:
      + (null, null) returns nothing on success
      + (Error, null) if an error occurs.
  */
  recipes.togglePublicPrivate = (
    { resultantPublicity, recipeID },
    callback
  ) => {
    database.execute(
      `
      UPDATE Recipes 
      SET is_Public = ?
      WHERE id = ?
      `,
      [resultantPublicity, recipeID],
      (err) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, null);
      }
    );
  };

  /**
    deleteRecipeByID deletes the Recipe with ID @recipeID.
    Also deletes all RecipeIngredients with recipe_id = @recipeID.
    => Receives:
      + recipeID: ID of the Recipe to delete.
    => Returns: by calling @callback with:
      + (null, null) returns nothing on success
      + (Error, null) if an error occurs.
  */
  recipes.deleteRecipeByID = ({ recipeID, ownerID }, callback) => {
    database.execute(
      "DELETE FROM Recipes WHERE id = ? AND owner_id = ?",
      [recipeID, ownerID],
      (err) => {
        if (err) {
          callback(err, null);
          return;
        }
        database.execute(
          "DELETE FROM RecipeIngredients WHERE recipe_id = ?",
          [recipeID],
          (err) => {
            if (err) {
              callback(err, null);
              return;
            }
            callback(null, null);
          }
        );
      }
    );
  };

  /**
    getAllRecipes fetches a list of all the Recipe objects in the system.
    => Receives:
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, []Recipes) the list of Recipes in the system.
      + (Error, null) if an error occurs.
  */
  recipes.getAllRecipes = (callback) => {
    database.execute(
      "SELECT * FROM RecipeItsIngredientsAndTheirReplacements WHERE is_public = TRUE",
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const recipeIDToData = {};
        rows.forEach((row) => {
          recipeIDToData[row.id] = {};
          recipeIDToData[row.id]["recipe"] = Recipe.fromDatabaseRow(
            row
          ).toJSON();
          recipeIDToData[row.id]["ingredients"] = {};
          const thisIngredient = recipeIDToData[row.id]["ingredients"];
          if (!nullOrUndefined(row.ingredients_and_replacements)) {
            row.ingredients_and_replacements.forEach((iar) => {
              const ID = iar.ingredient.id;
              thisIngredient[ID] = {};
              thisIngredient[ID]["ingredient"] = Ingredient.fromDatabaseRow(
                iar.ingredient
              ).toJSON();
              thisIngredient[ID]["replacements"] = [];
              if (!nullOrUndefined(iar.replacements)) {
                thisIngredient[ID]["replacements"] = iar.replacements.map(
                  (r) => ({
                    ...Ingredient.fromDatabaseRow(r).toJSON(),
                    ...IngredientReplacement.fromDatabaseRow(r).toJSON(),
                  })
                );
              }
            });
          }
        });
        callback(
          null,
          Object.keys(recipeIDToData).map((k) => recipeIDToData[k])
        );
      }
    );
  };

  /**
    searchByName searches for all *public* Recipe objects by name. Performs a fuzzy, case-insensitive search
    where name only has to contain @query somewhere. This returns more potential results at the
    cost of some accuracy. The search returns a highly nested object, but it's very information
    rich! It contains all Recipe objects matching the result, with the Ingredient objects for
    every Ingredient in that Recipe, and also the IngredientReplacements (as Ingredients) for
    all the Ingredients in each of the Recipes returned by the search.
    => Receives:
      + query: what to search for in the name. Query can appear anywhere in the name.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null,
        []{
          "recipe":Recipe,
          "ingredients":[]{
            "ingredient": Ingredient,
            "replacements": []Ingredient
          })
        This is a list of objects with a @recipe and @ingredients key. The Ingredients key contains a
        list of objects with the Ingredient itself at key @ingredient and any replacements we have to suggest
        for that Ingredient at the key @replacements. @replacements is a list of Ingredients that are
        replacements that we suggest. All data are returned as json for display to the user, rather
        than as objects for manipulation.
      + (Error, null) if an error occurs.
  */
  recipes.searchByName = ({ query }, callback) => {
    database.execute(
      "SELECT * FROM RecipeItsIngredientsAndTheirReplacements WHERE UPPER(name) LIKE ? AND is_public = TRUE",
      ["%" + query.toUpperCase() + "%"],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const recipeIDToData = {};
        rows.forEach((row) => {
          recipeIDToData[row.id] = {};
          recipeIDToData[row.id]["recipe"] = Recipe.fromDatabaseRow(
            row
          ).toJSON();
          recipeIDToData[row.id]["ingredients"] = {};
          const thisIngredient = recipeIDToData[row.id]["ingredients"];
          if (!nullOrUndefined(row.ingredients_and_replacements)) {
            row.ingredients_and_replacements.forEach((iar) => {
              const ID = iar.ingredient.id;
              thisIngredient[ID] = {};
              thisIngredient[ID]["ingredient"] = Ingredient.fromDatabaseRow(
                iar.ingredient
              ).toJSON();
              thisIngredient[ID]["replacements"] = [];
              if (!nullOrUndefined(iar.replacements)) {
                thisIngredient[ID]["replacements"] = iar.replacements.map(
                  (r) => ({
                    ...Ingredient.fromDatabaseRow(r).toJSON(),
                    ...IngredientReplacement.fromDatabaseRow(r).toJSON(),
                  })
                );
              }
            });
          }
        });
        callback(
          null,
          Object.keys(recipeIDToData).map((k) => recipeIDToData[k])
        );
      }
    );
  };

  /**
    getByIDWithIngredientsAndReplacements returns the Recipe with ID @recipeID if it exists.
    The result contains the Recipe object, Ingredient objects for every Ingredient in the Recipe,
    and also the IngredientReplacements (as Ingredients) for all the Ingredients in each of the
    Recipes returned by the search.
    => Receives:
      + recipeID: the ID of the Recipe to return.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null,
        {
          "recipe":Recipe,
          "ingredients":[]{
            "ingredient": Ingredient,
            "replacements": []Ingredient
          })
        This is an object with a @recipe and @ingredients key. The Ingredients key contains a list
        of objects with the Ingredient itself at key @ingredient and any replacements we have to suggest
        for that Ingredient at the key @replacements. @replacements is a list of Ingredients that are
        replacements that we suggest. All data are returned as json for display to the user, rather
        than as objects for manipulation.
      + (Error, null) if an error occurs.
  */
  recipes.getByIDWithIngredientsAndReplacements = ({ recipeID }, callback) => {
    database.execute(
      "SELECT * FROM RecipeItsIngredientsAndTheirReplacements WHERE id = ?",
      [recipeID],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const recipeIDToData = {};
        rows.forEach((row) => {
          recipeIDToData[row.id] = {};
          recipeIDToData[row.id]["recipe"] = Recipe.fromDatabaseRow(
            row
          ).toJSON();
          recipeIDToData[row.id]["ingredients"] = {};
          const thisIngredient = recipeIDToData[row.id]["ingredients"];
          if (!nullOrUndefined(row.ingredients_and_replacements)) {
            row.ingredients_and_replacements.forEach((iar) => {
              const ID = iar.ingredient.id;
              thisIngredient[ID] = {};
              thisIngredient[ID]["ingredient"] = Ingredient.fromDatabaseRow(
                iar.ingredient
              ).toJSON();
              thisIngredient[ID]["replacements"] = [];
              if (!nullOrUndefined(iar.replacements)) {
                thisIngredient[ID]["replacements"] = iar.replacements.map(
                  (r) => ({
                    ...Ingredient.fromDatabaseRow(r).toJSON(),
                    ...IngredientReplacement.fromDatabaseRow(r).toJSON(),
                  })
                );
              }
            });
          }
        });
        callback(null, recipeIDToData[recipeID]);
      }
    );
  };

  /**
getByIDWithIngredientsAndReplacementsAsync returns the Recipe with ID @recipeID if it exists.
The difference being that it does so asynchronously.
The result contains the Recipe object, Ingredient objects for every Ingredient in the Recipe,
and also the IngredientReplacements (as Ingredients) for all the Ingredients in each of the
Recipes returned by the search.
=> Receives:
    + recipeID: the ID of the Recipe to return.
    + callback: function(error, data)
=> Returns: by calling @callback with:
    + (null,
    {
        "recipe":Recipe,
        "ingredients":[]{
        "ingredient": Ingredient,
        "replacements": []Ingredient
        })
    This is an object with a @recipe and @ingredients key. The Ingredients key contains a list
    of objects with the Ingredient itself at key @ingredient and any replacements we have to suggest
    for that Ingredient at the key @replacements. @replacements is a list of Ingredients that are
    replacements that we suggest. All data are returned as json for display to the user, rather
    than as objects for manipulation.
    + (Error, null) if an error occurs.
*/

  recipes.getByIDWithIngredientsAndReplacementsAsync = async ({ recipeID }) => {
    return new Promise(function (resolve, reject) {
      database.execute(
        "SELECT * FROM RecipeItsIngredientsAndTheirReplacements WHERE id = ?",
        [recipeID],
        (err, rows) => {
          if (err) {
            reject(err);
          }
          const recipeIDToData = {};
          rows.forEach((row) => {
            recipeIDToData[row.id] = {};
            recipeIDToData[row.id]["recipe"] = Recipe.fromDatabaseRow(
              row
            ).toJSON();
            recipeIDToData[row.id]["ingredients"] = {};
            const thisIngredient = recipeIDToData[row.id]["ingredients"];
            if (!nullOrUndefined(row.ingredients_and_replacements)) {
              row.ingredients_and_replacements.forEach((iar) => {
                const ID = iar.ingredient.id;
                thisIngredient[ID] = {};
                thisIngredient[ID]["ingredient"] = Ingredient.fromDatabaseRow(
                  iar.ingredient
                ).toJSON();
                thisIngredient[ID]["replacements"] = [];
                if (!nullOrUndefined(iar.replacements)) {
                  thisIngredient[ID]["replacements"] = iar.replacements.map(
                    (r) => ({
                      ...Ingredient.fromDatabaseRow(r).toJSON(),
                      ...IngredientReplacement.fromDatabaseRow(r).toJSON(),
                    })
                  );
                }
              });
            }
          });
          resolve(recipeIDToData[recipeID]);
        }
      );
    });
  };

  /**
    clone copies the recipe with ID @recipeID to owning User @username so that future modifications
    to the Recipe's Ingredients will not impact the original Recipe that was copied. Used before
    inserting a public Recipe into an individual User's RecipeBook.
    => Receives:
      + recipeID: ID of the Recipe to clone.
      + username: username of the User to which the new Recipe belongs.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, recipeID) the ID of the recipe that was cloned.
      + (Error, null) if an error occurs.
    => Attribution: First Insert Recipe name select trick: https://stackoverflow.com/a/43610081
  */
  recipes.clone = ({ recipeID, username }, callback) => {
    database.execute(
      `
      INSERT INTO Recipes(name, is_public, date_created, owner_id) VALUES
      (
        (SELECT * FROM (SELECT name FROM Recipes WHERE id = ?) as newRecipe),
        FALSE,
        CURDATE(),
        (SELECT id FROM Users WHERE username = ?)
      );
      `,
      [recipeID, username],
      (err, insertResult) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            callback(Errors.recipeWithNameAlreadyExists, null);
            return;
          }
          callback(err, null);
          return;
        }
        const newRecipeID = insertResult.insertId;
        database.execute(
          `
          INSERT INTO RecipeIngredients(recipe_id, ingredient_id)
          (SELECT ? as recipe_id, ingredient_id FROM RecipeIngredients WHERE recipe_id = ?);
          `,
          [newRecipeID, recipeID],
          (err, rows) => {
            if (err) {
              callback(err, null);
              return;
            }
            callback(null, newRecipeID);
          }
        );
      }
    );
  };

  return { ...recipes, Errors };
};

module.exports = { Recipes, Recipe };
