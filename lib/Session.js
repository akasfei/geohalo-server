var assert = require('assert');

function Session (user) {
  assert.ok(typeof user !== 'undefined');
  this.id = user.id;
  this.user = user;
  /* Object Socket: Work in Progress */
  this.socket // = new Socket(options);
  return this;
}

Session.prototype.terminate = function () {
  return null;
};

module.exports = Session;