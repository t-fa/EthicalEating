const express = require('express');
const bodyParser = require('body-parser');
const Models = require('../database/index');

const bookRouter = express.Router();
bookRouter.use(bodyParser.urlencoded({ extended: false }));
bookRouter.use(bodyParser.json());


bookRouter.route('/')
// get all Recipes in a user's RecipeBook
.get((req, res, next) => {
    context = {}
    console.log(req.session.user_id);
    if (!req.session.user_id) {
		return res.redirect('/login');
    }
    Models.RecipeBookRecipes.getAllRecipes({ "recipeBookID": req.session.recipeBookID }, function (err, recipeBookList) {
        if (err) { console.log(err); return; }
        console.log(recipeBookList);
        res.render('book', { recipes: recipeBookList });
    });
});

module.exports = bookRouter;