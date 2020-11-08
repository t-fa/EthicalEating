const express = require('express');
const bodyParser = require('body-parser');
const Models = require('../database/index');

const buildRecipeRouter = express.Router();
buildRecipeRouter.use(bodyParser.urlencoded({ extended: false }));
buildRecipeRouter.use(bodyParser.json());

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
          context.ingredients = listOfAllIngredients;
          res.render('buildRecipe', context);
    })
})
.post((req, res, next) => {
    const name = req.body.name;
    // TODO: set isPublic to false later as this will be "private" for the user's recipe book
    // For now leave as public so you can see it show up in the search :)
    if (!req.body.ingredients) {
        // There's a problem. Redirect to build.
        console.log("No ingredients in recipe!");
        res.redirect('/build');
        return;
    }
    let ingredients = req.body.ingredients;
    if (!Array.isArray(ingredients)) {
        ingredients = Array.from(ingredients);
    }
    Models.Recipes.createRecipeWithIngredients({ name: name, isPublic: true, ingredientIDList: ingredients}, (err, newRecipeObject) => {
        if (err) {
            console.log("Failed to create the recipe. Error:", err);
            return next(err); // bail out of the handler here, newRecipeObject undefined
          }
          // Created the recipe successfully.
          console.log("newRecipeObject:", newRecipeObject, "json:", newRecipeObject.toJSON());
          res.redirect('/');
    });
});

module.exports = buildRecipeRouter;