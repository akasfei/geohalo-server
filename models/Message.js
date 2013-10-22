var manager   = require('../lib/ConnectionManager.js');
var redis_cli = require('./lib/RedisDB.js').client;
var util      = require('util');
var Packer    = require('./lib/BufferPacker.js');

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
  var socket = manager.getConByUserID (this.toID);

  // if toID is offline
  if (socket == undefined) {
    console.log (this.toID + ' is offline');
    return;
  }

  var buffer = Packer.pack (Packer.S2C_PackType_Msg, this);
  socket.write (buffer);
};

/**
 * save message obj to redis, then forward message.
 * @param callback
 * @return 
 */ 
Message.prototype.save = function(callback) {
  var hkey  = util.format ('user:%s:msg_box', this.toID);
  var lkey  = util.format ('user:%s:msg_unread', this.toID);

  redis_cli.hget (hkey, 'nextMsgId', function (err, nextMsgId) {
  	// the first time user receive msg.
  	if (nextMsgId == null) {
      this.msgId = 0;
  	} else {
      this.msgId = nextMsgId;
    }

  	var msgKeyPrefix  = util.format ('msg:%s:', this.msgId);
  	var fromKey       = msgKeyPrefix + 'fromID';
  	var sendTimeKey   = msgKeyPrefix + 'sendTime';
  	var msgContentKey = msgKeyPrefix + 'msgContent';

    redis_cli.hmset(hkey,
      fromKey,       this.fromID, // hahaha,
      sendTimeKey,   this.sendTime,
      msgContentKey, this.msgContent,
      function (err, result) {
        if (err == null && result == 'OK') {
          redis_cli.hincrby (hkey, 'nextMsgId', 1);
          redis_cli.lpush(lkey, this.msgId);
          this.forward();
        } else {
          console.log ('save message error');
        }
      });
  });
};

/**
 * get unread message of user.
 * @param userid, callback(err, msg_array_obj)
 * @return 
 */
Message.prototype.getUnreadByUserID = function(userID, callback) {
  // body...
  var hkey  = util.format ('user:%s:msg_box', userID);
  var lkey  = util.format ('user:%s:msg_unread', userID);
  var msgIdArray = new Array();

  // TODO
};