const express = require('express');
const bodyParser = require('body-parser');
const Models = require('../database/index');

const ethicalRouter = express.Router();
ethicalRouter.use(bodyParser.urlencoded({ extended: false }));
ethicalRouter.use(bodyParser.json());


/* Renders page 'ingredientEthics' and passes down to handlebars an ingredient
accessible in context.ingredient and a list of potential replacements if an 
ethical issue exists. Replacements accesible within handlebars in 
context.ingredientReplacements
*/
ethicalRouter.route('/:ingredientId')
.get((req, res, next) => {
  context = {};

  // Get ingredient info from DB
  Models.Ingredients.getIngredient({ ingredientID: req.params.ingredientId }, (err, ingredientObject) => {
    if (err) {
      if (err === Models.Ingredients.Errors.notFound) {
        return next(err); // bail out of the handler here, ingredientObject undefined
      }
      // Another error occurred.
      return next(err); // bail out of the handler here, ingredientObject undefined
    }
    // Fetched the Ingredient successfully.
    context.ingredient = ingredientObject;
    
    // Check for more ethical replacement
    Models.IngredientReplacements.getReplacementsForIngredientAsIngredientObjects(
      { ingredientIDToReplace: ingredientObject.id },
      (err, listOfIngredientObjects) => {
        if (err) {
          console.log("Failed to get IngredientReplacements:", err);
          return; // bail out of the handler here, listOfIngredientObjects undefined
        }
        context.originalIngredient = ingredientObject;
        context.ingredientReplacements = listOfIngredientObjects;
        res.render('ingredientEthics', context);
      }
    );
  });
});



module.exports = ethicalRouter;