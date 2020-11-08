const express = require('express');
const app = express();
const recipesRouter = require('./routes/recipesRouter');
const buildRecipeRouter = require('./routes/buildRecipeRouter');
const ethicalRouter = require('./routes/ethicalRouter');
const bookRouter = require('./routes/bookRouter');
const loginFunctions = require('./public/js/loginFunctions');
const handlebars = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const searchRouter = require('./routes/searchRouter');
const bcrypt = require('bcrypt');

// When deploying on a service like Heroku, the port is "ephemeral". It's not a fixed one
// that we can request. Heroku sets an environmental variable to tell our app which port
// it's allowed to listen on in process.env.PORT.
//
// If this variable is set, use the port in the variable. Otherwise, use the default (6377).
const port = process.env.PORT || 6377;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'XTCkQE&t%yRV$2dyn8ZUkt3EKP98gpHB34HX8d&&yJVuPmjMe' }));

app.engine(
	'handlebars',
	handlebars({
		defaultLayout: 'main',
		layoutsDir: __dirname + '/views/layouts/',
		partialsDir: __dirname + '/views/partials/'
	})
);

app.set('view engine', 'handlebars');

// Demo of how to create and log in a user...
const { Users, RecipeBooks } = require('./database');
const { check } = require('express-validator');
const { read } = require('fs');
const { RecipeBook } = require('./database/RecipeBooks');
const RecipeBookRecipes = require('./database/RecipeBookRecipes');
app.get('/demo', (_, res) => {
	Users.createUserWithUsernameAndPassword({ username: 'foo', password: 'bar' }, (error, user) => {
		console.log('user creation error:', error, 'newly created user:', user);
		Users.logInWithUsernameAndPassword({ username: 'foo', password: 'bar' }, (error, user) => {
			console.log('login error:', error, 'logged in user:', user);
		});
	});
	res.status(200).send('demo ok');
});

// Run this program as a parameter on any page that requires login
// See '/secret' page for example
const requireLogin = (req, res, next) => {
	if (!req.session.user_id) {
		return res.redirect('/login');
	}
	next();
};

// routes TBD
app.use('/build', buildRecipeRouter);
app.use('/', searchRouter);

// Fetch a single recipe, e.g., GET /recipes/1 fetches Recipe with ID 1.
app.use('/recipes', recipesRouter);

app.use('/ethicality', ethicalRouter);
app.use('/book', bookRouter);

app.post('/register', async (req, res) => {
	var context = {
		loginError: '',
		registerError: ''
	};
	const { password, confirmPassword, username } = req.body;
	const hash = await bcrypt.hash(password, 12);

	// check username content
	if (!(loginFunctions.onlyAlphanumerical(username) && username.length > 2)) {
		context.registerError = 'Invalid username or password';
		console.log(context);
		res.render('login', context);
	}

	// check password content
	if (!loginFunctions.validatePassword(password)) {
		context.registerError = 'Invalid username or password';
		res.render('login', context);
	}

	// check passwords match
	if (!(password == confirmPassword)) {
		context.registerError = 'Passwords do not match';
		res.render('login', context);
	}

	// if validation passes, create new user
	if (loginFunctions.onlyAlphanumerical(username) && username.length > 2) {
		if (loginFunctions.validatePassword(password)) {
			if (password == confirmPassword) {
				Users.createUserWithUsernameAndPassword(
					{
						username: username,
						password: hash
					},
					(error, user) => {
						console.log('user creation error:', error, 'newly created user:', user);
						if (!error) {
							req.session.user_id = username;
						} else {
							context.registerError = 'Username taken';
							res.render('login', context);
						}
					}
				);
			}
		}
	}
});

app.post('/login', async (req, res) => {
	var context = {
		loginError: '',
		registerError: ''
	};
	const { username, password } = req.body;

	Users.getUserByUsername({ username: username }, async (err, userObject) => {
		if (err) {
			context.loginError = 'Invalid username or password';
			return res.render('login', context);
		} else {
			// Do something with the User object.
			user = userObject;
			const validPassword = await bcrypt.compare(password, user._password);
			if (validPassword) {
				Users.logInWithUsernameAndPassword({ username: username, password: user._password }, (error, user) => {
					if (!error) {
						req.session.user_id = username;
						context.loginError = 'Logged in successfully!';
						res.render('login', context);
					} else {
						context.loginError = 'Invalid username or password';
						res.render('login', context);
					}
				});
			}
		}
	});
});


// Add a recipe to recipeBook
app.post('/addRecipe', function (req, res) {
	const recipeID = req.body.recipeID;
	console.log('recipe id:');
	console.log(recipeID);
	
	Users.getUserByUsername({ "username": req.session.user_id }, function (err, userObject) {
		if (err) { console.log(err); return; }
		console.log('recipe book id:')
		console.log(userObject.recipeBookID);
		
		RecipeBooks.addRecipeByIDToRecipeBookWithID({ 'recipeID': recipeID, 'recipeBookID': userObject.recipeBookID }, function (err, data) {
			if (err) { console.log(err); return; }
			console.log('Recipe Successfully added to your Recipe Book! Take a look.. ')
		});
	});
});


app.post('/logout', (req, res) => {
	if (req.session.user_id) {
		req.session.user_id = null;
		res.redirect('/');
	}
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.get('/', (req, res) => {
	res.render('index');
});

// Example page to show authentication. User must be logged in to visit this page
app.get('/secret', requireLogin, (req, res) => {
	res.send('This page is secret!');
});

app.get("/book", requireLogin, (req, res) => {
    res.render('book');
})

app.get("/userRecipe", (req, res) => {
    res.render('userRecipe');
})

app.get("/ingredientEthics", (req, res) => {
    res.render('ingredientEthics');
})

app.get("/publicRecipe", (req, res) => {
	res.render('publicRecipe');
})

app.get("/index", (req, res) => {
	res.render('index');
})

app.use((req,res) => {
    res.status(404);
    res.render('404');
});

app.use((req, res) => {
	res.status(500);
	res.render('500');
});

app.listen(port, () => {
	console.log(`Express started on http://flipX.engr.oregonstate.edu:${port}; press Ctrl-C to terminate.`);
});
