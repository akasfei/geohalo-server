var Status = require('./Status.js');
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

User.prototype.retrieveStatus = function() {
  db.find({'usrID': this.email}, 'status', {'limit': 1}, function (err, docs) {
    if (err)
      return console.log(err);
    if (typeof docs === 'undefined' || docs.length < 1)
      return;
    this.status = new Status(this.email, docs[0]);
  });
};

User.prototype.updateStatus = function(status, callback) {
  if (typeof this.status === 'undefined')
    this.status = new Status(this.email, status).store(callback);
  else
    this.status.update(status, callback);
};

User.prototype.search = function(options) {
  // body...
};

module.exports = User;