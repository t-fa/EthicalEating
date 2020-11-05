const { toJSON, buildResponseList, buildCreateResponse } = require("./utils");

/**
IngredientReplacement is a recommended replacement of one Ingredient for another Ingredient
in the system. We suggest an IngredientReplacement when a more ethical Ingredients exists
for a given Ingredient. An IngredientReplacement may not replace an Ingredient with itself.
*/

// IngredientReplacement class. A database query for IngredientReplacements
// returns instances of the IngredientReplacement class.
class IngredientReplacement {
  constructor({
    id,
    replacementReason,
    ingredientIDReplaces,
    ingredientIDReplacement,
  } = {}) {
    this.id = id;
    this.replacementReason = replacementReason;
    this.ingredientIDReplaces = ingredientIDReplaces;
    this.ingredientIDReplacement = ingredientIDReplacement;
  }

  // fromDatabaseRow returns an instance of the class, populating data from database row @dbRow.
  static fromDatabaseRow(dbRow) {
    return new IngredientReplacement({
      id: dbRow.id,
      replacementReason: dbRow.replacement_reason,
      ingredientIDReplaces: dbRow.ingredient_id_replaces,
      ingredientIDReplacement: dbRow.ingredient_id_replacement,
    });
  }

  // getID returns the ID of the IngredientReplacement.
  getID() {
    return this.id;
  }

  // toJSON returns a JSON representation of the entity with private ("_"-prefixed) fields removed.
  toJSON() {
    return toJSON(this);
  }
}

// IngredientReplacements. Defines queries for IngredientReplacements. Instantiated with
// @database, a reference to the mysql connection pool to be used for queries.
const IngredientReplacements = (database) => {
  // Define any Error messages or Data Validator functions for the module.
  const Errors = {};
  const Validators = {};

  // ======> BEGIN QUERIES <======

  // We attach all these queries to the ingredientReplacement object which gets returned and exported from the module.
  const ingredientReplacement = {};

  /**
    createIngredientReplacement creates an IngredientReplacement replacing Ingredient with
    ID @ingredientIDReplaces with Ingredient with ID @ingredientIDReplacement for ethical
    reason @replacementReason.

    Creation fails if either of the two Ingredients do not exist or if the Ingredient IDs are
    the same (since an Ingredient cannot replace itself).
    => Receives:
      + ingredientIDReplaces: ID of the Ingredient A to replace.
      + ingredientIDReplacement: ID of the Ingredient to replace Ingredient A with.
      + replacementReason: Description of the reason why we are making the replacement.
      + replacementReasonSource: Source for the rationale we're using to suggest the replacement.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, Instance of created IngredientReplacement object) on creation success.
      + (Error, null) if an error occurs.
    => Code Example:
      // Create an IngredientReplacement, replacing Ingredient with ID = 1 with Ingredient with
      // ID = 2 for reason @replacementReason.
      IngredientReplacements.createIngredientReplacement({
        ingredientIDReplaces: 1,
        ingredientIDReplacement: 2,
        replacementReason: "This ingredient requires less water to produce.",
      }, (err, newIngredientReplacement) => {
        if (err) {
          console.log("Failed to create IngredientReplacement:", err);
          return; // bail out of the handler here, newIngredientReplacement undefined
        }
        console.log("Created newIngredientReplacement:", newIngredientReplacement, "json: ", newIngredientReplacement.toJSON());
      });
    */
  ingredientReplacement.createIngredientReplacement = (
    { ingredientIDReplaces, ingredientIDReplacement, replacementReason },
    callback
  ) => {
    if (ingredientIDReplaces === ingredientIDReplacement) {
      callback(
        new Error(
          "You cannot create an IngredientReplacement that replaces an Ingredient with itself."
        ),
        null
      );
      return;
    }
    database.execute(
      `
      INSERT INTO IngredientReplacements(ingredient_id_replaces, ingredient_id_replacement, replacement_reason, replacement_reason_source)
      VALUES (?, ?, ?, ?)
      `,
      [
        ingredientIDReplaces,
        ingredientIDReplacement,
        replacementReason,
        replacementReasonSource,
      ],
      (err, rows) =>
        buildCreateResponse(
          err,
          rows,
          {
            ingredientIDReplaces,
            ingredientIDReplacement,
            replacementReason,
            replacementReasonSource,
          },
          IngredientReplacement,
          callback
        )
    );
  };

  /**
    getReplacementsForIngredient returns a list of IngredientReplacements for Ingredient
    with ID @ingredientIDToReplace. The list may be empty if no replacements exist or
    if the Ingredient with @ingredientIDToReplace does not exist.
    => Receives:
      + ingredientIDToReplace: ID of the Ingredient to find IngredientReplacements for.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, []IngredientReplacement objects) on query success. List may be empty.
      + (Error, null) if an error occurs.
    => Notes:
      + TODO: make a query that returns the IngredientReplacements as Ingredient objects directly
      by joining to Ingredients.
    => Code Example:
      // Find IngredientReplacements for Ingredient with @ingredientID = 1.
      IngredientReplacements.getReplacementsForIngredient(
        { ingredientID: 1 },
        (err, listOfIngredientReplacements) => {
          if (err) {
            console.log("Failed to get IngredientReplacements:", err);
            return; // bail out of the handler here, listOfIngredientReplacements undefined
          }
          console.log("Fetched listOfIngredientReplacements:", listOfIngredientReplacements);
          console.log("List as JSON objects",
            listOfIngredientReplacements.map((ingredientReplacement) =>
              ingredientReplacement.toJSON()
            )
          );
        }
      );
  */
  ingredientReplacement.getReplacementsForIngredient = (
    { ingredientID },
    callback
  ) => {
    database.execute(
      "SELECT * FROM IngredientReplacements WHERE ingredient_id_replaces = ?",
      [ingredientID],
      (err, rows) => {
        if (err) {
          callback(err, null);
        }
        buildResponseList(err, rows, IngredientReplacement, callback);
      }
    );
  };

  return { ...ingredientReplacement, Errors, Validators };
};

module.exports = { IngredientReplacements, IngredientReplacement };
