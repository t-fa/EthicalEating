const express = require('express');
const bodyParser = require('body-parser');
const Models = require('../database/index');
const { Recipes } = require('../database');

const search_recipe_router = express.Router();

search_recipe_router.use(bodyParser.urlencoded({ extended: false }));
search_recipe_router.use(bodyParser.json());

search_recipe_router.route('/')
.get((req, res) => {
    context = {}
    Models.Recipes.getAllRecipes((err, Recipe_List) => {
        if (err) {
            console.log("Failed to fetch Ingredients:", err);
            return next(err); 
          } else{
          // Got the list of Recipes.
          console.log("Recipes:", Recipe_List);
          console.log("Recipe_List JSON Object", Recipe_List.map(recipes => recipes.toJSON()));
          context.recipes = Recipe_List;
          res.render('search', context);
          }
    })
})

module.exports = search_recipe_router;
