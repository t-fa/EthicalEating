const { buildResponse, buildCreateResponse, toJSON } = require("./utils");

/*
User represents a User of the system. Users have a username, password, and
recipebook_id that maps to a RecipeBook. Every User has a unique username.
*/

// User class. A database query for User returns instances of this User class.
class User {
  constructor({ id, username, password, recipeBookID } = {}) {
    this.id = id;
    this.username = username;
    this._password = password;
    this.recipeBookID = Number.isInteger(recipeBookID) ? recipeBookID : -1;
  }

  // fromDatabaseRow returns an instance of the class, populating data from database row @dbRow.
  static fromDatabaseRow(dbRow) {
    return new User({
      id: dbRow.id,
      username: dbRow.username,
      password: dbRow.password,
      recipeBookID: dbRow.recipebook_id,
    });
  }

  // getID returns the ID of the User.
  getID() {
    return this.id;
  }

  // getRecipeBookID returns the User's RecipeBook ID.
  // If ID == -1 it means the User has no RecipeBook ID yet.
  getRecipeBookID() {
    return this.recipeBookID;
  }

  // toJSON returns a JSON representation of the entity with private ("_"-prefixed) fields removed.
  toJSON() {
    return toJSON(this);
  }
}

// Users defines queries for Users. Instantiated with @database, a
// reference to the mysql connection pool to be used for queries.
const Users = (database) => {
  // Define any Error messages or Data Validator functions for the module.
  const Errors = {
    notFound: "No user with that Username exists.",
    usernameInUse: "Username is already in use.",
    invalidUsernameOrPassword: "Invalid Username or Password.",
  };

  // TODO update these to do REAL validation that we want for our usernames and passwords.
  const Validators = {
    // returns True if username is valid, False if not.
    // Note: "valid" does not mean "in use". See: Users.Errors.usernameInUse.
    usernameIsValid: (username) => username.length > 2,
    // returns True if password is valid, False if not.
    passwordIsValid: (password) => password.length > 2,
  };

  // ======> BEGIN QUERIES <======

  // We attach all these queries to the User object which gets returned and exported from the module.
  const user = {};

  /**
    createUserWithUsernameAndPassword creates a new User with @username and @password.
    => Receives:
      + username (string)
      + password (string)
      + callback function(error, data)
    => Returns: by calling @callback with:
      + (null, Instance of the created User object) if no user with @username exists.
      + (Users.Errors.usernameInUse, null) if the @username is already in use by another user.
      + (Error, null) if another error occurs.
    => Notes:
      TODO: of course for a production system, you should hash the password and
      store the hash, not the password in plaintext. For dev and testing, this
      has been omitted but is crucial if you're storing real user data.
    => Code Example:
      Users.createUserWithUsernameAndPassword({"username": "foo", "password": "bar"}, (err, newUserObject) => {
        if (err) {
          if (err === Users.Errors.usernameInUse) {
            // Inform the user they must pick a different username. newUserObject is null.
            console.log(err);
            return; // bail out of the handler here, newUserObject undefined
          }
          // Another error occurred.
          console.log(err); // bail out of the handler here, newUserObject undefined
        }
        // User created successfully.
        console.log("newUserObject:", newUserObject, "user JSON:", newUserObject.toJSON());
      });
  */
  user.createUserWithUsernameAndPassword = (
    { username, password },
    callback
  ) => {
    database.execute(
      "INSERT INTO Users(username, password)  VALUES(?, ?)",
      [username, password],
      (err, rows) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            // mysql returns this code if a CONSTRAINT UNIQUE(username) is violated.
            // TODO: ensure this error code is consistent when we deploy the app: if
            // not, simply do a query in a transaction to check for prior existence.
            callback(Errors.usernameInUse, null);
            return;
          }
          callback(err, null);
          return;
        }
        buildCreateResponse(err, rows, { username, password }, User, callback);
      }
    );
  };

  /**
    logInWithUsernameAndPassword fetches a User having username @username and password @password.
    => Receives:
      + username (string)
      + password (string)
      + callback function(error, data)
    => Returns: by calling @callback with:
      + (null, Instance of the User object) if the user successfully authenticated.
      + (Users.Errors.invalidUsernameOrPassword, null) if the @username or @password are invalid.
      + (Error, null) if another error occurs.
    => Code Example:
      // Attempt to log in user with @username "foo" and @password "bar"
      Users.logInWithUsernameAndPassword(
        { username: "foo", password: "bar" },
        (err, userObject) => {
          if (err === Users.Errors.invalidUsernameOrPassword) {
            // Let the user know they entered the wrong username or password...
            console.log(err);
            return; // bail out of the handler here, userObject undefined
          }
          // Now we have the User object. Probably set up a session here on the server
          // and give the user a cookie to send back and send on future requests.
          console.log("User object:", userObject, "user JSON": userObject.toJSON());
        }
      );
  */
  user.logInWithUsernameAndPassword = ({ username, password }, callback) => {
    database.execute(
      "SELECT * FROM Users WHERE username = ? AND password = ?",
      [username, password],
      (err, rows) => {
        if (!rows || rows.length !== 1) {
          buildResponse(Errors.invalidUsernameOrPassword, rows, User, callback);
          return;
        }
        buildResponse(err, rows, User, callback);
      }
    );
  };

  /**
    getUserByUsername fetches a User with username @username.
    => Receives:
      + username (string)
      + callback function(error, data)
    => Returns: by calling @callback with:
      + (null, Instance of the User object) if such a User exists
      + (Users.Errors.notFound, null) if no such User with @username can be found.
      + (Error, null) if another error occurs.
    => Code Example:
      // Fetch a User by username foo, if user exists.
      Users.getUserByUsername({ username: "foo" }, (err, userObject) => {
        if (err) {
          console.log("Couldn't fetch user. Error:", err);
          return; // bail out of the handler here, userObject undefined
        }
        // Do something with the User object.
        console.log("userObject:", userObject, "json:", userObject.toJSON());
      });
  */
  user.getUserByUsername = ({ username }, callback) => {
    database.execute(
      "SELECT * FROM Users WHERE username = ?",
      [username],
      (err, rows) => {
        if (!rows || rows.length === 0) {
          buildResponse(Errors.notFound, rows, User, callback);
          return;
        }
        buildResponse(err, rows, User, callback);
      }
    );
  };

  return { ...user, Errors, Validators };
};

module.exports = { Users, User };
