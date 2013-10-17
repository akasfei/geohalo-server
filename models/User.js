var Location = require('./Location.js');
var Db = require('../lib/Db.js');
var db = new Db();

function User (instance){
  if (typeof instance === 'undefined' || typeof instance._id === 'undefined')
    return null;
  for (prop in instance)
    this[prop] = instance[prop];
  this.password = null;
  return this;
};

User.prototype.retrieveActivity = function() {
  // body...
};

User.prototype.updateActivity = function(activity) {
  // body...
};

User.prototype.retrieveLocation = function() {
  db.find({'usrID': this._id}, 'location', {'limit': 1}, function (err, docs) {
    if (err)
      return console.log(err);
    if (typeof docs === 'undefined' || docs.length < 1)
      return;
    this.location = new Location(docs[0], this._id);
  });
};

User.prototype.updateLocation = function(location, callback) {
  if (typeof this.location === 'undefined')
    this.location = new Location(location, this._id).store(callback);
  else
    this.location.update(location, callback);
};

User.prototype.search = function(options) {
  // body...
};

module.exports = User;