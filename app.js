const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');

const port = 6377

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
app.get("/login", (req, res) => {
  res.render('login');
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