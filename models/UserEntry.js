var Db = require('../lib/Db.js');
var db = new Db();

function UserEntry (instance){
  if (typeof instance === 'undefined')
    return null;
  var hash = require('crypto').createHash('sha1'),
  this.email = instance.gh_email;
  this.timestamp = new Date().getTime();
  hash.update(instance.gh_password, 'utf8');
  this.password = hash.update(timestamp.toString(), 'utf8'),digest('base64');
  this.name = instance.gh_name;
  this.details = {
    this.tel = instance.gh_tel;
    this.dob = instance.gh_dob;
  }
  return this;
};

UserEntry.prototype.store = function(callback) {
  db.insert(this, 'users', {}, function (err, data) {
    callback(err, data);
  }
};

module.exports = UserEntry;