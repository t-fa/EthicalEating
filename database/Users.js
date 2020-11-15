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
  // Define any Error messages for the module.
  const Errors = {
    notFound: "No user with that Username exists.",
    usernameInUse: "Username is already in use.",
    invalidUsernameOrPassword: "Invalid Username or Password.",
  };

  // ======> BEGIN QUERIES <======

  // We attach all these queries to the User object which gets returned and exported from the module.
  const user = {};

  /**
    createUserWithUsernameAndPassword creates a new User with @username and @password and adds
    a RecipeBook for the User.
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
  */
  user.createUserWithUsernameAndPassword = (
    { username, password },
    callback
  ) => {
    database.execute(
      "INSERT INTO Users(username, password)  VALUES(?, ?)",
      [username, password],
      (err, userRows) => {
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
        database.execute(
          "INSERT INTO RecipeBooks(owner_id) VALUES (?)",
          [userRows.insertId],
          (err, recipeBook) => {
            if (err) {
              callback(err, null);
              return;
            }
            database.execute(
              "UPDATE Users SET recipebook_id = ? WHERE id = ?",
              [recipeBook.insertId, userRows.insertId],
              (err, userUpdate) => {
                if (err) {
                  callback(err, null);
                  return;
                }
                buildCreateResponse({
                  err,
                  rows: userRows,
                  callback,
                  entity: User,
                  creationParams: {
                    username,
                    password,
                    recipeBookID: recipeBook.insertId,
                  },
                });
              }
            );
          }
        );
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
  */
  user.logInWithUsernameAndPassword = ({ username, password }, callback) => {
    database.execute(
      "SELECT * FROM Users WHERE username = ? AND password = ?",
      [username, password],
      (err, rows) => {
        if (!rows || rows.length !== 1) {
          buildResponse({
            err: Errors.invalidUsernameOrPassword,
            rows,
            callback,
            entity: User,
          });
          return;
        }
        buildResponse({ err, rows, callback, entity: User });
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
  */
  user.getUserByUsername = ({ username }, callback) => {
    database.execute(
      "SELECT * FROM Users WHERE username = ?",
      [username],
      (err, rows) => {
        if (!rows || rows.length === 0) {
          buildResponse({ err: Errors.notFound, rows, callback, entity: User });
          return;
        }
        buildResponse({ err, rows, callback, entity: User });
      }
    );
  };

  return { ...user, Errors };
};

module.exports = { Users, User };
