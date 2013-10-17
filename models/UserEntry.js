var Db = require('../lib/Db.js');
var db = new Db();

function UserEntry (instance){
  if (typeof instance === 'undefined')
    return null;
  var hash = require('crypto').createHash('sha1');
  this.email = instance.gh_email;
  this.timestamp = new Date().getTime();
  hash.update(instance.gh_password, 'utf8');
  this.password = hash.update(this.timestamp.toString(), 'utf8').digest('base64');
  this.name = instance.gh_name;
  this.details = {
    'tel': instance.gh_tel,
    'dob': instance.gh_dob
  }
  return this;
};

UserEntry.prototype.store = function(callback) {
  var _this = this;
  db.insert(_this, 'users', {}, function (err, data) {
    callback(err, data);
    return _this;
  });
};

UserEntry.prototype.setAdmin = function () {
  this.admin = true;
  return this;
}

module.exports = UserEntry;