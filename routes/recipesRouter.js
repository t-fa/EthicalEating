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

      if (!recipeWithReplacements) {
        res.status(404);
        return res.render("404");
      }
      // Make sure if the recipe's private that there's a logged in user and they are the owner.
      const sessionNumericUserId = req.session.user_id_numeric;
      if (!recipeWithReplacements.recipe.isPublic && recipeWithReplacements.recipe.ownerId !== sessionNumericUserId) {
        // the recipe is private and the user is not the owner.
        return res.redirect('/login');
      }
      context.user = req.session.user_id_numeric;
      context.undo = req.session.undo;
      context.ingredients = recipeWithReplacements;
      res.render("userRecipe", context);
    }
  );
});

// This will delete a Recipe from the system. Logged in user must be Recipe owner.
recipesRouter.route("/:recipeID").delete((req, res, next) => {
  const id = req.params.recipeID;
  if (!id) {
    res.status(400).json({ error: "missing recipeID" });
  }
  const ownerID = req.session.user_id_numeric;
  if (!ownerID) {
    res.status(400).json({ error: "missing ownerID" });
  }
  Models.RecipeBookRecipes.deleteRecipeByID({recipeID: id, recipeBookID: req.session.recipeBookID}, function(err) {
    if (err) {
      return next(err);
    }
    Models.Recipes.deleteRecipeByID(
      { recipeID: id, ownerID: ownerID },
      function (err) {
        if (err) {
          return next(err);
        }
        res.status(200).json("OK");
      }
    );
  })
});

module.exports = recipesRouter;
