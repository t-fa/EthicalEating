// utils.js contains some "utility functions" used throughout to help prepare
// database responses to the backend client or perform common tasks like null
// checking, etc.

// buildCreateResponse checks the database response for any errors @err and calls the
// @callback function with the appropriate (err, data) response. Used for initial
// entity creation: adds the insertId to the object. If data is present, it calls the
// @callback with an instance of class of type @entity instantiated with data from @rows.
const buildCreateResponse = (err, rows, creationParams, entity, callback) => {
  if (!nullOrUndefined(err)) {
    callback(err, null);
    return;
  }
  if (nullOrUndefined(rows) || nullOrUndefined(rows.insertId)) {
    callback(null, null);
    return;
  }
  callback(null, new entity({ id: rows.insertId, ...creationParams }));
};

// buildResponse checks the database response for any errors @err and calls the
// @callback function with the appropriate (err, data) response. If data is present,
// it calls the @callback with an instance of class of type @entity instantiated
// with data from @rows.
const buildResponse = (err, rows, entity, callback) => {
  if (!nullOrUndefined(err)) {
    callback(err, null);
    return;
  }
  if (nullOrUndefined(rows) || !rows.length) {
    callback(null, null);
    return;
  }
  callback(null, entity.fromDatabaseRow(rows[0]));
};

// buildResponseList checks the database response for any errors @err and calls the
// @callback function with the appropriate (err, data) response. If data is present, it
// calls the @callback with a list of instances of class of type @entity instantiated
// with data from @rows.
const buildResponseList = (err, rows, entity, callback) => {
  if (!nullOrUndefined(err)) {
    callback(err, null);
    return;
  }
  if (nullOrUndefined(rows) || !rows.length) {
    callback(null, []);
    return;
  }
  callback(
    null,
    rows.map((row) => entity.fromDatabaseRow(row))
  );
};

// nullOrUndefined returns True if @obj is null or of type undefined, False if not.
const nullOrUndefined = (obj) => obj === null || typeof obj === "undefined";

// toJSON returns a JSON representation of all keys in object, except for any
// "private" ("_"-prefixed) keys that should not be included.
const toJSON = (obj) => {
  const publicObj = {};
  Object.keys(obj)
    .filter((key) => key.length === 0 || key[0] !== "_") // filter out empty (don't think possible...) or private ("_"-prefixed keys)
    .forEach((publicKey) => (publicObj[publicKey] = obj[publicKey])); // return the key-value pair for each public key
  return publicObj;
};

module.exports = {
  buildCreateResponse,
  buildResponse,
  buildResponseList,
  nullOrUndefined,
  toJSON,
};
