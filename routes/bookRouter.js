const express = require('express');
const bodyParser = require('body-parser');
const Models = require('../database/index');

const bookRouter = express.Router();
bookRouter.use(bodyParser.urlencoded({ extended: false }));
bookRouter.use(bodyParser.json());


bookRouter.route('/')
// get all Recipes in a user's RecipeBook & calculate ethical score
.get(async (req, res, next) => {
    context = {}
    console.log(req.session.user_id);

    if (!req.session.user_id) {
		return res.redirect('/login');
    }

    Models.RecipeBookRecipes.getAllRecipes({ "recipeBookID": req.session.recipeBookID }, async function (err, recipeBookList) {

        if (err) { console.log(err); return; }
        console.log(recipeBookList);

        for (i = 0; recipe = recipeBookList[i]; i++) {
            try {
                id = parseInt(recipe.id)
                const ethicalRating = await Models.Recipes.getByIDWithIngredientsAndReplacementsAsync({ "recipeID": id });
           
                    var ingInfo = Object.values(ethicalRating.ingredients)

                    // ingLength is the number of ingredients in any given recipe
                    var ingLength = ingInfo.length

                    // ethicalCount tracks the number of ingredients that have no replacements, ie. are 'ethical'
                    var ethicalCount = 0;
                    for (j = 0; j < ingInfo.length; j++) {

                        var rep = ingInfo[j].replacements
                        if (rep.length === 0) {
                            ethicalCount++;
                        }
                    }
            } catch (err){
                console.log('something went wrong');
            }

            ethicalRating = ((ethicalCount / ingLength) * 10)
            ethicalRating = ethicalRating.toFixed(1)
                
            recipeBookList[i].ethicalScore = ethicalRating;
        };
        res.render('book', { recipes: recipeBookList });
    });

});


bookRouter.route('/:id/:public')
// update privacy/publicity to opposite of current state
.get((req, res, next) => {
    context = {};
    const recipeID = Number(req.params.id);
    const currentIsPublic = String(req.params.public)

    var resultantPublicity = '';

    // determine which state to switch to
    if (currentIsPublic === 'false') {
        resultantPublicity = true;
    } else {
        resultantPublicity = false;
    };

    Models.Recipes.togglePublicPrivate({ resultantPublicity, recipeID }, function (err, _) {
        if (err) { console.log(err); return; }
        res.redirect('..');
    })
});


module.exports = bookRouter;