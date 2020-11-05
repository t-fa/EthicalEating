const express = require('express');
const bodyParser = require('body-parser');
const Models = require('../database/index');

const searchRouter = express.Router();
searchRouter.use(bodyParser.urlencoded({ extended: false }));
searchRouter.use(bodyParser.json());

searchRouter.route('/')
.get((req, res) => {
    if(!req.query){
        res.render('search')
    }

    if(req.query.ingredient){
        context = {};
        const search = req.query.ingredient;

        Models.Ingredients.searchByName({"query": search}, (err, listOfIngredients) => {
            if (err) {
            console.log("Failed to fetch Ingredients:", err);
            return next(err);  // bail out of the handler here, listOfIngredients undefined
            }
            // Got the listOfFlourIngredients.
            console.log("listOfIngredients:", listOfIngredients);
            console.log("listOfIngredients as json", listOfIngredients.map(ingredient => ingredient.toJSON()));
            context.ingredients = listOfIngredients;
            res.render('search', context);
        });
    }

    if(req.query.recipe){
        context = {};
        const search = req.query.recipe;
        
        Models.Recipes.searchByName({"query": search}, (err, listOfAllRecipes) => {
            if (err) {
              console.log("Failed to fetch Recipes:", err);
              return next(err);  // bail out of the handler here, listOfAllRecipes undefined
            }
            // Got the listOfAllRecipes.
            console.log("listOfAllRecipes:", listOfAllRecipes);
            console.log("listOfAllRecipes as json", listOfAllRecipes.map(recipe => recipe.toJSON()));
            context.recipes = listOfAllRecipes;
            res.render('search', context);
          });
    }
})

module.exports = searchRouter;