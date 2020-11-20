const express = require("express");
const bodyParser = require("body-parser");
const Models = require("../database/index");

const recipesRouter = express.Router();
recipesRouter.use(bodyParser.urlencoded({ extended: false }));
recipesRouter.use(bodyParser.json());

recipesRouter.route("/:recipeID/ingredients").patch((req, res, next) => {
  const recipeID = Number(req.params.recipeID);
  const {
    toReplaceID,
    replaceWithID,
    originalName,
    replaceWithName,
  } = req.body;
  Models.Recipes.replaceIngredientForRecipeID(
    { toReplaceID, replaceWithID, recipeID },
    function (err, _) {
      if (err !== null) {
        res.status(500).json(err);
        return;
      }

      // Put an "undo object" on the session so the user may undo the replacement
      // if they wish.
      const undoObj = {
        model: "Recipes",
        fn: "replaceIngredientForRecipeID",
        args: {
          toReplaceID: replaceWithID,
          replaceWithID: toReplaceID,
          recipeID,
        },
      };

      req.session.undo = {
        ttl: 3, // persist undo option for three page navigations.
        data: undoObj,
        msg: `You replaced <strong>${originalName}</strong> with the more
              ethical alternative <strong>${replaceWithName}</strong>.
              <a href="/undo">Click here</a> to undo this replacement.`,
      };
      res.status(200).json("OK");
    }
  );
});

recipesRouter.route("/:recipeID").get((req, res, next) => {
  context = {};
  Models.Recipes.getByIDWithIngredientsAndReplacements(
    { recipeID: req.params.recipeID },
    (err, recipeWithReplacements) => {
      if (err) {
        console.log("Failed to fetch Recipe ID:", req.params.recipeID, err);
        return next(err); // bail out of the handler here, recipeWithReplacements undefined
      }
      context.undo = req.session.undo;
      context.ingredients = recipeWithReplacements;
      res.render("userRecipe", context);
    }
  );
});

module.exports = recipesRouter;
