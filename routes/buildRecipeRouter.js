const express = require('express');
const bodyParser = require('body-parser');
const Models = require('../database/index');

const buildRecipeRouter = express.Router();
buildRecipeRouter.use(bodyParser.urlencoded({ extended: false }));
buildRecipeRouter.use(bodyParser.json());


// used to update recipe w/ recipeID with new ingredients.
buildRecipeRouter.route('/:recipeID')
.put((req, res, next) => {
    context = {}
    console.log("put body", req.body, req.session);
    if (!req.body.ingredients || !req.session.user_id) {
        // There's a problem. Redirect to build.
        console.log("No ingredients in recipe!");
        res.redirect('/build');
        return;
    }
    let ingredients = req.body.ingredients;
    if (!Array.isArray(ingredients)) {
        // If recipe has just one ingredient, req.body.ingredients will be a
        // single ID, like "14" instead of an array. createRecipeWithIngredients
        // requires an array of ingredients, so make an array with a single
        // ingredient ID in this case.
        ingredients = [ingredients];
    }
    console.log("Updating recipe ID with ingredients:", req.params.recipeID, ingredients);
    Models.Recipes.updateRecipeWithIngredientIDList(
        {
          recipeID: req.params.recipeID,
          ingredientIDList: ingredients,
        },
        (err, _) => {
        if (err) {
            console.log("Failed to create the recipe. Error:", err);
            return next(err); // bail out of the handler here, newRecipeObject undefined
          }
          // Updated the recipe successfully.
          res.status(200).json("OK");
        //   res.redirect('/book');
    });
});

buildRecipeRouter.route('/')
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
          context.ingredients = listOfAllIngredients.sort((a, b) => (a.name > b.name) ? 1 : -1);
          console.log("sorted list", context.ingredients)
          res.render('buildRecipe', context);
    })
})
.post((req, res, next) => {
    const name = req.body.name;
    const isPublic = req.body.isPublic;
    console.log(isPublic)
    if (!req.body.ingredients || !req.session.user_id) {
        // There's a problem. Redirect to build.
        console.log("No ingredients in recipe!");
        res.redirect('/build');
        return;
    }
    let ingredients = req.body.ingredients;
    if (!Array.isArray(ingredients)) {
        // If recipe has just one ingredient, req.body.ingredients will be a
        // single ID, like "14" instead of an array. createRecipeWithIngredients
        // requires an array of ingredients, so make an array with a single
        // ingredient ID in this case.
        ingredients = [ingredients];
    }
    console.log("Building recipe with name, ingredients, recipeBookID:", name, ingredients, res.locals.recipeBookID);
    Models.Recipes.createRecipeWithIngredients(
        {
          name: name,
          isPublic: isPublic,
          ingredientIDList: ingredients,
          recipeBookID: res.locals.recipeBookID,
          username: req.session.user_id,
        },
        (err, newRecipeObject) => {
        if (err) {
            console.log("Failed to create the recipe. Error:", err);
            return next(err); // bail out of the handler here, newRecipeObject undefined
          }
          // Created the recipe successfully.
          console.log("newRecipeObject:", newRecipeObject, "json:", newRecipeObject.toJSON());
          res.redirect('/book');
    });
});

module.exports = buildRecipeRouter;