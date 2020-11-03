// backend routes for building a recipe

const express = require('express');
const bodyParser = require('body-parser');

const buildRecipeRouter = express.Router();
buildRecipeRouter.use(bodyParser.urlencoded({ extended: false }));
buildRecipeRouter.use(bodyParser.json());

buildRecipeRouter.route('/')
.get((req, res, next) => {
    res.render('build')
})
.post((req, res, next) => {
    const name = req.body.name;
    const isPublic = req.body.isPublic;
    const ingredient = req.body.ingredient;
})

module.exports = buildRecipeRouter;