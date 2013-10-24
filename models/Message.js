var manager   = require('../lib/ConnectionManager.js');
var redis_cli = require('./lib/RedisDB.js').client;
var util      = require('util');
var Packer    = require('./lib/BufferPacker.js');
var async     = require('node-async');

/**
 * Constructor of Message Model. if message is newly
 * send from client and have no msgId, just leave it
 * blank. Redis will generate a msgId for it when 
 * save.
 */
function Message (fromID, toID, sendTime, msg, msgId) {
  this.fromID   = fromID;
  this.toID     = toID;
  this.sendTime = sendTime;
  this.msg      = msg;
  this.msgId    = msgId;
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
  var unreadkey = util.format ('user:%s:msg.unread', this.toID);
  var nextIdKey = util.format ('user:%s:msg.nextId', this.toID);
  var msgBoxKey = util.format ('user:%s:msgbox', this.toID);

  // if msg have no msgId. generate one.else just save it.
  if (this.msgId == undefined) {
    redis_cli.incr (nextIdKey, function (err, nextMsgId) {
      this.msgId = nextMsgId;

      var objstr = JSON.stringify (this);
      var multi  = redis_cli.multi();
      multi.hset (msgBoxKey, this.msgId, objstr);
      multi.sadd (unreadkey, this.msgId);
      multi.exec (function (err, replies) {
        if (err)
          return console.log ('insert msg error ' + err);
        else 
          this.forward();
      });
    });
  } else { // 
    var objstr = JSON.stringify (this);
    var multi = redis_cli.multi();
    multi.hset (this.msgBoxKey, this.msgId, objstr);
    multi.sadd (unreadkey, this.msgId);
    multi.exec (function (err, replies) {
      if (err)
        return console.error ('save msg failed ' + err);
      else 
        return console.error ('msg saved ');
    });
  }
};

/**
 * send unread message to user, call when user online.
 * @param userid.
 * @return 
 */
Message.prototype.sendUnreadMsg = function (userID) {
  // body...
  var hkey  = util.format ('user:%s:msgbox', userID);
  var skey  = util.format ('user:%s:msg.unread', userID);
  var msgIdArray = new Array();

  redis_cli.smembers (skey, function (err, members) {
    if (err) {
      console.error ('get ' + lkey + ' len error, ' + err);
      return;
    } else {
      async.each (members, msgId, function(err) {
        if (err) {
          console.log ('async for ech error ' + err);
          return;
        }
        redis_cli.hget (hkey, msgId, function (err, objstr) {
          var msg = JSON.parse (objstr);
          Message.forward.call(msg);
        });
      });
    }
  });
};

/**
 * move message from unread sets to read sets.
 * @param userID, msgId (key)
 *
 */
Message.prototype.setRead = function (userId, msgId) {
  var unreadkey = util.format ('user:%s:msg.unread', userId);
  var readkey   = util.format ('user:%s:msg.read', userId);
  redis_cli.sismember(unreadkey, msgId, function (err, result) {
    if (result) {
      redis_cli.smove(unreadkey, readkey, msgId);
    } else {
      console.log ('user ' + userId + ' msgId ' + msgId + 'is read');
    }
  });
}

module.exports = Message;
