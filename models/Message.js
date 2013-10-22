var manager = require('../lib/ConnectionManager.js');
var redis_cli = require('./lib/RedisDB.js').client;

function Message (fromID, toID, sendTime, msgContent) {
  this.fromID     = fromID;
  this.toID       = toID;
  this.sendTime   = sendTime;
  this.msgContent = msgContent;
};

/**
 * forward a message to message.toID
 * @param
 * @return true if susscess, false otherwise
 */
Message.prototype.forward = function(callback) {
  // body...
};

/**
 * save message obj to redis
 * @param callback
 * @return 
 */ 
Message.prototype.save = function(callback) {
  // body...
};

/**
 * get unread message of user.
 * @param userid, callback
 * @ return 
 */
Message.prototype.getUnreadByUserID = function(userID, callback) {
  // body...
};