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
      // Return the recipeWithReplacements as a JSON object
      // This could be used to render a template, instead.
      res.status(200).json(recipeWithReplacements);
    }
  );
});

module.exports = recipesRouter;
