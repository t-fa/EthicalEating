const { IngredientReplacement } = require("./IngredientReplacements");
const { Ingredient } = require("./Ingredients");
const { buildCreateResponse, toJSON, buildResponseList } = require("./utils");

/*
Recipe represents a Recipe in the system. A Recipe has zero or more Ingredients.
A Recipe can have a public or private status. A Recipe is owned by a User and
can be placed into a RecipeBook.
*/

// Recipe class. A database query for Recipes returns instances of the Recipe class.
class Recipe {
  constructor({ id, name, isPublic } = {}) {
    this.id = id;
    this.name = name;
    this.isPublic = isPublic;
  }

  // fromDatabaseRow returns an instance of the class, populating data from database row @dbRow.
  static fromDatabaseRow(dbRow) {
    return new Recipe({
      id: dbRow.id,
      name: dbRow.name,
      isPublic: dbRow.is_public === 1 ? true : false,
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
  };
  const Validators = {};

  // ======> BEGIN QUERIES <======

  // We attach all these queries to the recipes object which gets returned and exported from the module.
  const recipes = {};

  /*
    createRecipe creates the Recipe with @name and @isPublic status.
    => Receives:
      + name: Name of the Recipe.
      + isPublic: Whether the Recipe is publicly visible.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, Recipe) with the Recipe object that was created.
      + (Error, null) if an error occurs.
    => Code Example:
      // Create a Recipe with @name "foo" that is public since @isPublic = true.
      Recipes.createRecipe({ name: "foo", isPublic: true }, (err, newRecipeObject) => {
        if (err) {
          console.log("Failed to create the recipe. Error:", err);
          return; // bail out of the handler here, newRecipeObject undefined
        }
        // Created the recipe successfully.
        console.log("newRecipeObject:", newRecipeObject, "json:", newRecipeObject.toJSON());
      });
  */
  recipes.createRecipe = ({ name, isPublic }, callback) => {
    database.execute(
      "INSERT INTO Recipes(name, is_public) VALUES(?, ?)",
      [name, isPublic],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        buildCreateResponse(err, rows, { name, isPublic }, Recipe, callback);
      }
    );
  };

  /**
    addIngredientIDToRecipeID adds Ingredient with ID @ingredientID to Recipe with ID @recipeID.
    => Receives:
      + ingredientID: ID of the Ingredient to add to Recipe.
      + recipeID: ID of the Recipe to which to add the Ingredient.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, null) returns nothing on success
      + (Error, null) if an error occurs.
    => Code Example:
      // Create a Recipe with @name "foo" that is public since @isPublic = true.
      Recipes.createRecipe({ name: "foo", isPublic: true }, (err, newRecipeObject) => {
        if (err) {
          console.log("Failed to create the recipe. Error:", err);
          return; // bail out of the handler here, newRecipeObject undefined
        }
        // Created the recipe successfully.
        console.log("newRecipeObject:", newRecipeObject, "json:", newRecipeObject.toJSON());
      });
  */
  recipes.addIngredientIDToRecipeID = (
    { ingredientID, recipeID },
    callback
  ) => {
    database.execute(
      "INSERT INTO RecipeIngredients(ingredient_id, recipe_id) VALUES (?, ?)",
      [ingredientID, recipeID],
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
    getIngredients gets a list of Ingredient objects for Recipe with ID @recipeID
    => Receives:
      + recipeID: ID of the Recipe for which to fetch the list of Ingredients.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, []Ingredients) a list of Ingredient objects in the Recipe.
      + (Error, null) if an error occurs.
    => Code Example:
      // Get list of Ingredients for Recipe with ID @recipeID.
      Recipes.getIngredients({ recipeID: 1 }, (err, listOfIngredients) => {
        if (err) {
            console.log("Failed to fetch recipe ingredients:", err);
            return; // bail out of the handler here, listOfIngredients undefined
        }
        // Got the Ingredients list.
        console.log("listOfIngredients:", listOfIngredients);
        console.log("listOfIngredients as json", listOfIngredients.map(ingredient => ingredient.toJSON()));
      });
  */
  recipes.getIngredients = ({ recipeID }, callback) => {
    database.execute(
      `
      SELECT * FROM Ingredients i
      INNER JOIN RecipeIngredients ri
      ON i.id = ri.ingredient_id
      WHERE ri.recipe_id = ?
      `,
      [recipeID],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        buildResponseList(err, rows, Ingredient, callback);
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
    => Code Example:
      // Get all the Recipes.
      Recipes.getAllRecipes((err, listOfAllRecipes) => {
        if (err) {
          console.log("Failed to fetch Recipes:", err);
          return;  // bail out of the handler here, listOfAllRecipes undefined
        }
        // Got the list of Rrecipes.
        console.log("listOfAllRecipes:", listOfAllRecipes);
        console.log("listOfAllRecipes as json", listOfAllRecipes.map(recipe => recipe.toJSON()));
      });
  */
  recipes.getAllRecipes = (callback) => {
    database.execute("SELECT * FROM Recipes", (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }
      buildResponseList(err, rows, Recipe, callback);
    });
  };

  /**
    searchByName searches for Recipe objects by name. Performs a fuzzy, case-insensitive search
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
    => Code Example:
      // Search for Cupcakes.
      Recipes.searchByName({"query": "Cupcakes"}, (err, listOfAllCupcakeRecipes) => {
        if (err) {
          console.log("Failed to fetch Recipes:", err);
          return;  // bail out of the handler here, listOfAllCupcakeRecipes undefined
        }
        // Got the listOfAllCupcakeRecipes.
        console.log("listOfAllCupcakeRecipes:", listOfAllCupcakeRecipes, "json string", JSON.stringify(listOfAllCupcakeRecipes));
      });
  */
  recipes.searchByName = ({ query }, callback) => {
    database.execute(
      "SELECT * FROM RecipeItsIngredientsAndTheirReplacements WHERE UPPER(name) LIKE ?",
      ["%" + query.toUpperCase() + "%"],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const recipeIDToData = {};
        rows.forEach((row) => {
          recipeIDToData[row.id] = {};
          recipeIDToData[row.id]["recipe"] = Recipe.fromDatabaseRow(row).toJSON();
          recipeIDToData[row.id]["ingredients"] = {};
          const thisIngredient = recipeIDToData[row.id]["ingredients"];
          if (row.ingredients_and_replacements !== null) {
            JSON.parse(row.ingredients_and_replacements).forEach((iar) => {
              const ID = iar.ingredient.id;
              thisIngredient[ID] = {};
              thisIngredient[ID]["ingredient"] = Ingredient.fromDatabaseRow(iar.ingredient).toJSON();
              thisIngredient[ID]["replacements"] = [];
              if (iar.replacements !== null) {
                thisIngredient[ID]["replacements"] = JSON.parse(iar.replacements).map((r) => ({
                  ...Ingredient.fromDatabaseRow(r).toJSON(),
                  ...IngredientReplacement.fromDatabaseRow(r).toJSON(),
                }));
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

  return { ...recipes, Errors, Validators };
};

module.exports = { Recipes, Recipe };
