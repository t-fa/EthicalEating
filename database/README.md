# Database Models

Each of the files in the database folder:

* Users
* Recipes
* RecipeBooks
* RecipeBookRecipes
* Ingredients
* IngredientReplacements

models the object it is named after. These Models provide a bridge between the Database and the backend routes that deal with these different types of objects.

This bridge means that the Database doesn't have to worry about the Application, and the Application doesn't have to worry about the Database. There's a common Object and Query interface that stands between them.

We could swap out the database for a file on a hard drive, an in-memory database, whatever, and as long as we support the interface, the Application wouldn't know the difference.

For instance, a backend route involved with logging in or registering Users could require Users and use it to create a User or log a User in.

A backend route involved in Ingredient or Recipe search could require Ingredients or Recipes and use its `searchByName` method.

## Using these Models
To require any of the files that you need, simply use the require syntax and then call the methods that are exported.

For example, if I wanted to write a backend route to search for Recipes, I'd first require the object (`./database` is the path to this `database` folder -- I am assuming you are writing this code at the top level, in a file like app.js):

`const Recipes = require("./database");`

Now, I can use the `Recipes` object to run queries. To search for recipes with "cake" in the name I can just use:

```
Recipes.searchByName({"query": "cake"}, function(error, searchResults) {
    if (error) { // handle error }
    // use searchResults
});
```

The functions all take two arguments -- the first being an object with all the named parameters the function requires, and the second a callback that takes `(error, data)`, an "Error-First" callback pattern [http://fredkschott.com/post/2014/03/understanding-error-first-callbacks-in-node-js/](http://fredkschott.com/post/2014/03/understanding-error-first-callbacks-in-node-js/) common in NodeJS.

The Javascript files in Database mirror the SQL tables created in database-definitions.sql. If a table in the database schema is altered, the corresponding Javascript file should be inspected to see if any queries need to change.

If you need to write a query that's not supported yet, you can simply add it to the corresponding file in the Databases folder. Ideally we will avoid having too much raw SQL code directly in the Route handlers in app.js and similar.

If we maintain this separation of concerns, it will help us be able to change the backend routes simultaneously as we work on the schema and bridge layer -- we can break up work more easily this way, and since things are loosely coupled, changes in one area don't require many changes in the other.