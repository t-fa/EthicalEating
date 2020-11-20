const { toJSON, buildResponseList, buildCreateResponse } = require("./utils");
const { Ingredient } = require("./Ingredients");
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
    replacementReasonSource,
  } = {}) {
    this.id = id;
    this.replacementReason = replacementReason;
    this.ingredientIDReplaces = ingredientIDReplaces;
    this.ingredientIDReplacement = ingredientIDReplacement;
    this.replacementReasonSource = replacementReasonSource;
  }

  // fromDatabaseRow returns an instance of the class, populating data from database row @dbRow.
  static fromDatabaseRow(dbRow) {
    return new IngredientReplacement({
      id: dbRow.id,
      replacementReason: dbRow.replacement_reason,
      ingredientIDReplaces: dbRow.ingredient_id_replaces,
      ingredientIDReplacement: dbRow.ingredient_id_replacement,
      replacementReasonSource: dbRow.replacement_reason_source,
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
  // Define any Error messages for the module.
  const Errors = {};

  // ======> BEGIN QUERIES <======

  // We attach all these queries to the ingredientReplacement object which gets returned and exported from the module.
  const ingredientReplacement = {};

  /**
    getReplacementsForIngredientAsIngredientObjects returns a list of Ingredients for each
    IngredientReplacement that we suggest for the Ingredient with the ID @ingredientIDToReplace.
    The list may be empty if no replacements exist or if the Ingredient with @ingredientIDToReplace
    does not exist.
    => Receives:
      + ingredientIDToReplace: ID of the Ingredient to find IngredientReplacements for.
      + callback: function(error, data)
    => Returns: by calling @callback with:
      + (null, []Ingredient objects) on query success. List may be empty.
      + (Error, null) if an error occurs.
  */

  ingredientReplacement.getReplacementsForIngredientAsIngredientObjects = (
    { ingredientIDToReplace },
    callback
  ) => {
    database.execute(
      `
    SELECT i.name, ir.* FROM IngredientReplacements ir
    INNER JOIN Ingredients i
    ON ir.ingredient_id_replacement = i.id
    WHERE ingredient_id_replaces = ?
    `,
      [ingredientIDToReplace],
      (err, rows) => {
        if (err) {
          callback(err, null);
        }
        callback(
          err,
          rows.map((r) => ({
            ...Ingredient.fromDatabaseRow(r).toJSON(),
            ...IngredientReplacement.fromDatabaseRow(r).toJSON(),
          }))
        );
      }
    );
  };

  return { ...ingredientReplacement, Errors };
};

module.exports = { IngredientReplacements, IngredientReplacement };
