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
        ingredients = Array.from(ingredients);
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