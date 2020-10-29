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