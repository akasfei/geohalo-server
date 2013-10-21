var Session = require('./Session.js');
var assert = require('assert');

function SessionList () {
  this.length = 0;
  return this;
}

SessionList.prototype.new = function (user) {
  assert.ok(typeof user !== 'undefined');
  this[user.email] = new Session(user);
  this.length++;
  return this;
}

SessionList.prototype.delete = function (id) {
  assert.ok(typeof this[id] !== 'undefined');
  this[id].terminate();
  delete this[id];
  this.length--;
  return this;
}

SessionList.prototype.isOnline = function (id) {
  return (typeof this[id] !== 'undefined');
}

module.exports = SessionList;