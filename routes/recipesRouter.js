const express = require("express");
const bodyParser = require("body-parser");
const Models = require("../database/index");

const recipesRouter = express.Router();
recipesRouter.use(bodyParser.urlencoded({ extended: false }));
recipesRouter.use(bodyParser.json());

recipesRouter.route("/:recipeID").get((req, res, next) => {
  context = {};
  Models.Recipes.getByIDWithIngredientsAndReplacements(
    { recipeID: req.params.recipeID },
    (err, recipeWithReplacements) => {
      if (err) {
        console.log("Failed to fetch Recipe ID:", req.params.recipeID, err);
        return next(err); // bail out of the handler here, recipeWithReplacements undefined
        }
        context.ingredients = recipeWithReplacements
        res.render('userRecipe', context);
        
    }
  );
});

module.exports = recipesRouter;
