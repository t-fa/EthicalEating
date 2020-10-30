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

// routes TBD
app.get("/login", (req, res) => {
  res.render('login');
})

app.get("/", (req, res) => {
  res.render('index');
})

// Little database demo: visit http://localhost:6377/database-test and check logs.
const { describeTables } = require("./database/client");
app.get("/database-test", (_, res) => {
  describeTables();
  res.status(200).send("OK");
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