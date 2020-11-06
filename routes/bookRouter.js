const express = require('express');
const bodyParser = require('body-parser');
const Models = require('../database/index');

const bookRouter = express.Router();
bookRouter.use(bodyParser.urlencoded({ extended: false }));
bookRouter.use(bodyParser.json());

bookRouter.route('/')

// add a recipe to recipeBook using the recipeID and the user's recipeBookID
.post((req, res, next) => {
    const recipeID = req.body.recipeID
    const recipeBookID = req.body.recipeBookID
    
    Models.recipeBook.addRecipeByIDToRecipeBookWithID({ recipeID: recipeID, recipeBookID: recipeBookID }, (err, addRecipeToBook) => {
        if (err) {
            console.log("Error: RecipeID or RecipeBookID does not exist", err);
            return next(err);
          }
        
        console.log("recipeAddedToBook:", addRecipeToBook);
        
    })
})


// get all Recipes in a user's RecipeBook
.get((req, res, next) => {
    context = {}
    Models.RecipeBookRecipes.getAllRecipes((err, listOfAllUserRecipes) => {
        if (err) {
            console.log("Could not retrieve recipes", err);
            return next(err);
        }
        // If recipes were retrieved
        console.log("listOfAllUserRecipes:", listOfAllUserRecipes);
        console.log("listOfAllUserRecipes as json", listOfAllUserRecipes.map(RecipeBookRecipe => RecipeBookRecipe.toJSON()));
        context.recipes = listOfAllUserRecipes;
        res.render('book', context);
    })
})


module.exports = bookRouter;