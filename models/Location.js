var Db = require('../lib/Db.js');
var db = new Db();

function Location(input, usrID) {
  this.longtitude = input.longtitude;
  this.latitude = input.latitude;
  this.usrID = usrID;
  return this;
};

// Update a user's current location
Location.prototype.update = function (input) {
  this.archive();
  this.longtitude = input.longtitude;
  this.latitude = input.latitude;
  this.store();
};

// Search for nearby users by a given radius
Location.prototype.search = function (radius) {

};

Location.prototype.store = function(callback) {
  db.update({'usrID': this.usrID}, this, 'location', {'upsert': true}, function (err) {
    if (err)
      console.log(err);
    if (callback)
      callback(err);
  });
};

// Archive this location; Store in the user's location history.
Location.prototype.archive = function (callback) {
  db.insert(this, 'location_history', {}, function (err) {
    if (err)
      console.log(err);
    if (callback)
      callback(err);
  });
};

module.exports = Location;