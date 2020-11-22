const express = require('express');
const bodyParser = require('body-parser');
const Models = require('../database/index');

const ethicalRouter = express.Router();
ethicalRouter.use(bodyParser.urlencoded({ extended: false }));
ethicalRouter.use(bodyParser.json());

/* Returns list of all ingredients useful for linking to an individual ingredient
Currently renders index but should be changed to render a more appropriate handlebars file 
when frontend is built out
*/
ethicalRouter.route('/')
.get((req, res, next) => {
  context = {}
  Models.Ingredients.getAllIngredients((err, listOfAllIngredients) => {
    if (err) {
      console.log("Failed to fetch Ingredients:", err);
      return next(err);  // bail out of the handler here, listOfAllIngredients undefined
    }
    // Got the list of Ingredients.
    console.log("listOfAllIngredients:", listOfAllIngredients);
    console.log("listOfAllIngredients as json", listOfAllIngredients.map(ingredient => ingredient.toJSON()));
    context.ingredients = listOfAllIngredients;
    res.render('index', context);
  });
})


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