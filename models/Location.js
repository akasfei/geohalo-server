var Db = require('../lib/Db.js');
var db = new Db();

function Location(loc, usrID) {
  this.loc = loc;
  this.usrID = usrID;
  return this;
};

// Update a user's current location
Location.prototype.update = function (loc) {
  this.archive();
  this.loc = loc;
  this.store();
};

// Search for nearby users by a given radius
Location.prototype.search = function (options, callback) {
  db.geoSearch(this.loc, {limit:1, maxDistance:100}, function (err, docs) {
    if (err)
      console.log(err);
    if (callback)
      callback(err, docs);
    return this;
  })
};

Location.prototype.store = function(callback) {
  db.update({'usrID': this.usrID}, this, 'location', {'upsert': true}, function (err) {
    if (err)
      console.log(err);
    if (callback)
      callback(err);
    return this;
  });
};

// Archive this location; Store in the user's location history.
Location.prototype.archive = function (callback) {
  var enrty;
  entry.loc = this.loc;
  entry.usrID = this.usrID;
  db.insert(entry, 'location_history', {}, function (err) {
    if (err)
      console.log(err);
    if (callback)
      callback(err);
    return this;
  });
};

module.exports = Location;