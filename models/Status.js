var Db = require('../lib/Db.js');
var db = new Db();
var assert = require('assert');

function Status(usrID, status) {
  if (typeof usrID === 'undefined')
    return null;
  this.usrID = usrID;
  this.timestamp = new Date().getTime();
  if (typeof status !== 'undefined' && typeof status.loc !== 'undefined') {
    assert.ok(status.loc instanceof Array && status.loc.length == 2);
    this.loc = status.loc;
  }
  if (typeof status !== 'undefined' && typeof status.act === 'string')
    this.act = status.act;
  return this;
};

/* Update a user's current Status 
 * location: [longtitude, latitude]
 * activity: '<ActivityName>'
 */
Status.prototype.update = function (status) {
  if (typeof status !== 'undefined') {
    this.archive(function (err) {assert.equal(null, err)});
    this.timestamp = new Date().getTime();
    if (typeof status.loc !== 'undefined')
      this.loc = status.loc;
    if (typeof status.act !== 'undefined')
      this.act = status.act;
    this.store(function (err) {assert.equal(null, err)});
  }
  return this;
};

/* Search for nearby users by given options
 * options: {limit: <Number>, search: {<query>}, distance: <Number>}
 * callback: function(err, docs[])
 */
Status.prototype.search = function (options, callback) {
  db.geoSearch(this.loc, options, function (err, docs) {
    if (err)
      console.log(err);
    if (callback)
      callback(err, docs);
    return this;
  })
};

Status.prototype.store = function(callback) {
  db.update({'usrID': this.usrID}, this, 'status', {'upsert': true}, function (err) {
    if (err)
      console.log(err);
    if (callback)
      callback(err);
    return this;
  });
};

// Archive this Status; Store in the user's Status history.
Status.prototype.archive = function (callback) {
  var enrty;
  entry.loc = this.loc;
  entry.act = this.act;
  entry.usrID = this.usrID;
  entry.timestamp = this.timestamp;
  db.insert(entry, 'status_history', {}, function (err) {
    if (err)
      console.log(err);
    if (callback)
      callback(err);
    return this;
  });
};

module.exports = Status;