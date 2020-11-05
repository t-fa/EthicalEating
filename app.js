const express = require('express');
const app = express();
const buildRecipeRouter = require('./routes/buildRecipeRouter');

const handlebars = require('express-handlebars');
const path = require('path');
const searchRouter = require('./routes/searchRouter');


// When deploying on a service like Heroku, the port is "ephemeral". It's not a fixed one
// that we can request. Heroku sets an environmental variable to tell our app which port
// it's allowed to listen on in process.env.PORT.
//
// If this variable is set, use the port in the variable. Otherwise, use the default (6377).
const port = process.env.PORT || 6377;


app.use(express.static(path.join(__dirname, 'public')));

app.engine(
    "handlebars",
    handlebars({
      defaultLayout: "main",
      layoutsDir: __dirname + "/views/layouts/",
      partialsDir: __dirname + "/views/partials/",
    })
  );

app.set('view engine', 'handlebars');

// Demo of how to create and log in a user...
const { Users } = require("./database");
app.get("/demo", (_, res) => {
  Users.createUserWithUsernameAndPassword({"username": "foo", "password": "bar"}, (error, user) => {
    console.log("user creation error:", error, "newly created user:", user);
      Users.logInWithUsernameAndPassword({"username": "foo", "password": "bar"}, (error, user) => {
        console.log("login error:", error, "logged in user:", user);
      });
  });
  res.status(200).send("demo ok");
})

// routes TBD
app.use('/build', buildRecipeRouter);
app.use('/search', searchRouter);

app.get("/login", (req, res) => {
  res.render('login');
})


app.use('/search', require('./routes/search_router.js'));


app.get("/ingredient_search", (req, res) => {
  res.render('ingredient_search');
})

app.get("/", (req, res) => {
  res.render('index');
})

app.use((req,res) => {
    res.status(404);
    res.render('404');
});

app.use((req,res) => {
  res.status(500);
  res.render('500');
});

app.listen(port, () => {
    console.log(`Express started on http://flipX.engr.oregonstate.edu:${port}; press Ctrl-C to terminate.`);
  });
