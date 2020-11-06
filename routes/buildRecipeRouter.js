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
    const ingredients = [];
    Models.Recipes.createRecipe({ name: name, isPublic: false}, (err, newRecipeObject) => {
        if (err) {
            console.log("Failed to create the recipe. Error:", err);
            return next(err); // bail out of the handler here, newRecipeObject undefined
          }
          // Created the recipe successfully.
          console.log("newRecipeObject:", newRecipeObject, "json:", newRecipeObject.toJSON());
          ingredients.forEach(ingredient => {
              Models.Recipes.addIngredientIDToRecipeID({ ingredientID: ingredient.id, recipeID: newRecipeObject.id}, (err, newIngredient) => {
                if (err) {
                    console.log("Failed to add ingredient to recipe. Error:", err);
                    return next(err); // bail out of the handler here, newRecipeObject undefined
                  }
                  // Created the recipe successfully.
                  console.log("newRecipeObject:", newRecipeObject, "json:", newRecipeObject.toJSON());
              })
          })
        });
    res.redirect('/')
})

module.exports = buildRecipeRouter;