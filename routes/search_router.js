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
    // Search term that is passed to the database query
    var search_term = req.query.recipe_search;
    console.log("Search Term Is", search_term)
    
	if (search_term != undefined)  {
    Models.Recipes.searchByName({"query":search_term},(err, Recipe_List) => {
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
    })}
    else{res.render('search');}
})

module.exports = search_recipe_router;
