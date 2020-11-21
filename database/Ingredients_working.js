const {
  buildCreateResponse,
  buildResponse,
  buildResponseList,
  toJSON,
} = require("./utils");

/**
Ingredient is an Ingredient in the system. A Recipe consists of zero or more Ingredients.
An Ingredient is mapped to a Recipe by a RecipeIngredient. The same Ingredient may appear
in multiple Recipes.
*/

// Ingredient class. A database query for Ingredients returns instances of the Ingredient class.
class Ingredient {
  constructor({ id, name, description, isEthical } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isEthical = isEthical;
  }

  // fromDatabaseRow returns an instance of the class, populating data from database row @dbRow.
  static fromDatabaseRow(dbRow) {
    return new Ingredient({
      id: dbRow.id,
      name: dbRow.name,
      description: dbRow.description,
      isEthical: dbRow.isEthical,
    });
  }

  // getID returns the ID of the Ingredient.
  getID() {
    return this.id;
  }

  // toJSON returns a JSON representation of the entity with private ("_"-prefixed) fields removed.
  toJSON() {
    return toJSON(this);
  }
}

// Ingredients defines queries for Ingredients. Instantiated with @database,
// a reference to the mysql connection pool to be used for queries.
const Ingredients = (database) => {
  // Define any Error messages or data Validator functions for the module.
  const Errors = {
    notFound: "That ingredient does not exist.",
  };
  const Validators = {};

  // ======> BEGIN QUERIES <======

  // We attach all these queries to the ingredients object which gets returned and exported from the module.
  const ingredients = {};

  /**
    createIngredient creates a new Ingredient with name @name and description @description.
    => Receives:
      + name: Name of the Ingredient.
      + description: Description of the Ingredient.
      + is_ethical: 1 for True, 0 for False.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, Ingredient) with the Ingredient object that was created.
      + (Error, null) if an error occurs.
    => Code Example:
      // Create an Ingredient with @name "foo", @description "desc", and @isEthical "1".
      Ingredients.createIngredient({ name: "foo", description: "desc", isEthical: "1" }, (err, newIngredientObject) => {
        if (err) {
          console.log("Failed to create the ingredient. Error:", err);
          return; // bail out of the handler here, newIngredientObject undefined
        }
        // Created the ingredient successfully.
        console.log("newIngredientObject:", newIngredientObject, "json:", newIngredientObject.toJSON());
    });
  */
  ingredients.createIngredient = ({ name, description }, callback) => {
    database.execute(
      "INSERT INTO Ingredients(name, description) VALUES(?, ?)",
      [name, description, isEthical],
      (err, rows) => {
        console.log(err, rows);
        if (err) {
          callback(err, null);
          return;
        }
        buildCreateResponse(
          err,
          rows,
          { name, description, isEthical },
          Ingredient,
          callback
        );
      }
    );
  };

  /**
    getAllIngredients fetches a list of all the Ingredient objects in the system.
    => Receives:
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, []Ingredients) the list of Ingredients in the system.
      + (Error, null) if an error occurs.
    => Code Example:
      // Get all the Ingredients.
      Ingredients.getAllIngredients((err, listOfAllIngredients) => {
        if (err) {
          console.log("Failed to fetch Ingredients:", err);
          return;  // bail out of the handler here, listOfAllIngredients undefined
        }
        // Got the list of Ingredients.
        console.log("listOfAllIngredients:", listOfAllIngredients);
        console.log("listOfAllIngredients as json", listOfAllIngredients.map(ingredient => ingredient.toJSON()));
      });
  */
 ingredients.getAllIngredients = (callback) => {
  database.execute("SELECT * FROM Ingredients", (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }
    buildResponseList(err, rows, Ingredient, callback);
  });
};

  /**
    getIngredient fetches the Ingredient with ID @ingredientID if it exists.
    => Receives:
      + ingredientID: ID of the Ingredient to fetch.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, Ingredient) with the Ingredient object that was fetched.
      + (Ingrdients.Errors.notFound, null) if the Ingredient could not be found.
      + (Error, null) if another error occurs.
    => Code Example:
      // Fetch an Ingredient with ID @ingredientID = 2.
      Ingredients.getIngredient({ ingredientID: 2 }, (err, ingredientObject) => {
        if (err) {
          if (err === Ingredients.Errors.notFound) {
            console.log("Could not find the ingredient.");
            return; // bail out of the handler here, ingredientObject undefined
          }
          // Another error occurred.
          console.log("An error occurred with the query. Error:", err);
          return; // bail out of the handler here, ingredientObject undefined
        }
        // Fetched the Ingredient successfully.
        console.log("ingredientObject:", ingredientObject, "json:", ingredientObject.toJSON());
      });
  */
  ingredients.getIngredient = ({ ingredientID }, callback) => {
    database.execute(
      "SELECT * FROM Ingredients WHERE id = ?",
      [ingredientID],
      (err, rows) => {
        console.log(err, rows);
        if (err) {
          callback(err, null);
          return;
        }
        if (!rows || rows.length !== 1) {
          callback(Errors.notFound, null);
        }
        buildResponse(err, rows, Ingredient, callback);
      }
    );
  };

  /**
    searchByName searches for Ingredient objects by name. Performs a fuzzy, case-insensitive search
    where name only has to contain @query somewhere. This returns more potential results at the
    cost of some accuracy.
    => Receives:
      + query: what to search for in the name. Query can appear anywhere in the name.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, []Ingredient) the list of Ingredients in the system with names like the provided @query.
      + (Error, null) if an error occurs.
    => Code Example:
      // Search for flour.
      Ingredients.searchByName({"query": "flour"}, (err, listOfFlourIngredients) => {
        if (err) {
          console.log("Failed to fetch Ingredients:", err);
          return;  // bail out of the handler here, listOfFlourIngredients undefined
        }
        // Got the listOfFlourIngredients.
        console.log("listOfFlourIngredients:", listOfFlourIngredients);
        console.log("listOfFlourIngredients as json", listOfFlourIngredients.map(ingredient => ingredient.toJSON()));
      });
  */
  ingredients.searchByName = ({ query }, callback) => {
    database.execute(
      "SELECT * FROM Ingredients WHERE UPPER(name) LIKE ?",
      ["%" + query.toUpperCase() + "%"],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        buildResponseList(err, rows, Ingredient, callback);
      }
    );
  };

  return { ...ingredients, Errors, Validators };
};

module.exports = { Ingredients, Ingredient };