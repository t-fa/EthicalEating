const express = require('express');
const bodyParser = require('body-parser');
const Models = require('../database/index');

const searchRouter = express.Router();
searchRouter.use(bodyParser.urlencoded({ extended: false }));
searchRouter.use(bodyParser.json());

/* Endpoint for searching for recipes. Returns a list of recipes matching a search term
and associated ingredients accesible in context.recipes and context.ingredients, respectively.s
*/
searchRouter.route('/')
.get((req, res, next) => {
    if(req.query.recipe_search) {
        const search = req.query.recipe_search;
            Models.Recipes.searchByName({"query": search}, (err, listOfAllRecipes) => {
                if (err) {
                  console.log("Failed to fetch Recipes:", err);
                  return next(err);  // bail out of the handler here, listOfAllRecipes undefined
                }
                // Pass along the user_id in context. TODO: find better way to pass around
                // and access "App context" from all templates that might need it.
                res.render('search', {"recipes": listOfAllRecipes, "user_id": req.session.user_id});
              });
    // user did not search for anything - return all recipes     
    } else {
        Models.Recipes.getAllRecipes((err, listOfAllRecipes) => {
            if(err) {
                console.log("Failed to fetch Recipes:", err);
                return next(err);  // bail out of the handler here, listOfAllRecipes undefined
            }
            res.render('search', {"recipes": listOfAllRecipes, "user_id": req.session.user_id})
        })
    }
});

/* Endpoint for searching for ingredients. Returns a list of ingredients matching the search term
accessible in context.ingredients.
*/
searchRouter.route('/ingredient_search')
.get((req, res, next) => {
    if(req.query.ingredient_search){
        context = {};
        const search = req.query.ingredient_search;

        Models.Ingredients.searchByName({"query": search}, (err, listOfIngredients) => {
            if (err) {
            return next(err);  // bail out of the handler here, listOfIngredients undefined
            }
            // Got the listOfIngredients.
            context.ingredients = listOfIngredients;
            res.render('ingredient_search', context);
        });
    } else {
        res.render('ingredient_search');
    }
})


module.exports = searchRouter;
