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

// Put the session ID into res locals so we can render the correct status in the Header
// Handlebars partial.
app.use(function(req, res, next) {
	res.locals.user_id = req.session.user_id;
	res.locals.recipeBookID = req.session.recipeBookID;
	res.locals.user_id_numeric = req.session.user_id_numeric;

	// If there's an undo action on the session, decrement its time-to-live (TTL) by 1
	// for each page navigation. If it's ttl is expired then clear the undo action --
	// this means the user will no longer be able to have the option to undo this.

	if (req.session.undo && req.session.undo.ttl !== null && typeof req.session.undo.ttl !== 'undefined') {

		req.session.undo.ttl -= 1;
		if (req.session.undo.ttl <= 0) {
			req.session.undo = null;
		}
	}
	next();
});

app.set('view engine', 'handlebars');

const { Users, RecipeBooks } = require('./database');

// Run this program as a parameter on any page that requires login
// See '/secret' page for example
const requireLogin = (req, res, next) => {
	if (!req.session.user_id) {
		return res.redirect('/login');
	}
	next();
};

// undo allows a user to undo the last action in their session, if that action is un-doable.
// actions can put themselves on the User's session after taken with an "undo" action.
app.get('/undo', async (req, res) => {

	if (req && req.session && req.session.undo && typeof req.session.undo.data !== 'undefined') {

		const { model, fn, args } = req.session.undo.data;

		// Reset the undo data on the session so that we don't process it again.
		req.session.undo = null;

		// Rather than using eval, the undo action right now defines a model, fn, and args
		// to apply -- then the undo action runs the db function. Could make a bit more
		// robust if we do a lot more un-doing.

		if (model === 'Recipes') {
			if (fn === 'replaceIngredientForRecipeID') {
				const { Recipes } = require('./database');
				Recipes.replaceIngredientForRecipeID(args, (err, data) => {
					if (err !== null) {
						console.log('Undo error:', err);
						res.status(500).json(err);
						return;
					}
					console.log('Undo successful:', data);
					return res.redirect(req.header('Referer'));

				});
			}
		}
	} else {

		console.log('No undo object found...');
		return res.status(200).json('OK');

	}
});

// routes TBD
app.use('/build', buildRecipeRouter);
app.use('/search', searchRouter);

// Fetch a single recipe, e.g., GET /recipes/1 fetches Recipe with ID 1.
app.use('/userRecipe', recipesRouter);

app.use('/ingredientEthics', ethicalRouter);
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
	var validChars = await loginFunctions.verifyPasswordCharacters(password);
	var validLength = await loginFunctions.verifyPasswordLength(password, 8);
	if (!(validChars && validLength)) {
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
		if (validChars && validLength) {
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
							res.locals.user_id = username;
							req.session.recipeBookID = user.recipeBookID;
							req.session.user_id_numeric = user.id;
							res.render('index');
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
						res.locals.user_id = req.session.user_id;
						req.session.recipeBookID = user.recipeBookID;
						req.session.user_id_numeric = user.id;
						res.render('index', context);
					} else {
						context.loginError = 'Invalid username or password';
						res.render('login', context);
					}
				});
			}
		}
	});
});

const { Recipes } = require('./database');
// Add a recipe to recipeBook
app.post('/addRecipe', function(req, res) {
	const recipeID = req.body.recipeID;
	if (!req.session.recipeBookID) {
		return res.redirect('/login');
	}
	Recipes.clone({ recipeID: recipeID, username: req.session.user_id }, function(err, newRecipeID) {
		if (err) {
			console.log('clone failed err:', err);
			return res.status(500).json({ error: err });
		}
		RecipeBooks.addRecipeByIDToRecipeBookWithID(
			{ recipeID: newRecipeID, recipeBookID: req.session.recipeBookID },
			function(err, data) {
				if (err) {
					console.log('addRecipeByIDToRecipeBookWithID failed err:', err);
					return res.status(500).json('failedToAddRecipe');
				}
				console.log('Recipe Successfully added to your Recipe Book! Take a look.. ');
				return res.status(200).json('OK');
			}
		);
	});
});

app.post('/logout', (req, res) => {
	if (req.session.user_id) {
		req.session.user_id = null;
		req.session.destroy();
		res.redirect('/');
	}
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.get('/', (req, res) => {
	res.render('index');
});


app.get('/book', requireLogin, (req, res) => {
	res.render('book');
});

app.get('/userRecipe', (req, res) => {
	res.render('userRecipe');
});

app.get('/ingredientEthics', (req, res) => {
	res.render('ingredientEthics');
});

app.get('/publicRecipe', (req, res) => {
	res.render('publicRecipe');
});

app.get('/index', (req, res) => {
	res.render('index');
});

app.use((req, res) => {
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
