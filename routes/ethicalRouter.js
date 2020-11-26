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
        if (req.query.backAction === "close") {
          context.backActionClose = true;
        }

        // If client sets Accept header to application/json, return a JSON representation
        // of the page rather than rendering the template itself. This way a client can
        // consume the data to display on the same page, e.g., as a pop-over tooltip.
        if (req.headers.accept && req.headers.accept === "application/json") {
          return res.json(context);
        }

        // If the user isn't viewing this in the context of a recipe
        // then don't show the replacements as a form -- set noEdit.
        if (!req.query.recipeID) {
          context.noEdit = true;
          return res.render('ingredientEthics', context);
        }

        // Fetch the recipe to see if the user owns it -- if so, show them
        // the editing form. if not, do not give user the ability to edit.
        context.noEdit = false;
        Models.Recipes.getByIDWithIngredientsAndReplacements({"recipeID": req.query.recipeID}, function(err, data) {
          if (err) {
            return res.status(500).render("500");
          }
          if (data.recipe.ownerId === null || data.recipe.ownerId !== req.session.user_id_numeric) {
            context.noEdit = true;
          }
          res.render('ingredientEthics', context);
        });
      }
    );
  });
});



module.exports = ethicalRouter;