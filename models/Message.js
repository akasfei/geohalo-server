var manager   = require('../lib/ConnectionManager.js');
var redis_cli = require('../lib/RedisDB.js');
var util      = require('util');
var Packer    = require('../lib/BufferPacker.js');
var async     = require('async');
var logger    = require('../lib/SocketLogger.js');

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
    logger.info('[Message]', this.toID, 'is offline');
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
Message.prototype.save = function(msg, callback) {
  var unreadkey = util.format ('user:%s:msg.unread', msg.toID);
  var nextIdKey = util.format ('user:%s:msg.nextId', msg.toID);
  var msgBoxKey = util.format ('user:%s:msgbox', msg.toID);

  // if msg have no msgId. generate one.else just save it.
  if (msg.msgId == undefined) {
    redis_cli.incr (nextIdKey, function (err, nextMsgId) {
      msg.msgId = nextMsgId;

      var objstr = JSON.stringify (msg);
      var multi  = redis_cli.multi();
      multi.hset (msgBoxKey, msg.msgId, objstr);
      multi.sadd (unreadkey, msg.msgId);
      multi.exec (function (err, replies) {
        if (err)
          return logger.error('[Message]', 'insert msg error ', err);
        else 
          Message.prototype.forward.call(msg);
      });
    });
  } else { // 
    var objstr = JSON.stringify (msg);
    var multi = redis_cli.multi();
    multi.hset (msgBoxKey, msg.msgId, objstr);
    multi.sadd (unreadkey, msg.msgId);
    multi.exec (function (err, replies) {
      if (err)
        return logger.error('[Message]', 'save msg failed', err);
      else 
        return logger.info('[Message]', 'msg saved ', JSON.stringify(msg));
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

  redis_cli.smembers (skey, function (err, members) {
    if (err) {
      logger.error('[Message]','get ' + lkey + ' len error, ', err);
      return;
    } else {
      async.each (members, function(msgId, error){
          redis_cli.hget (hkey, msgId, function (err, objstr) {
            var msg = JSON.parse (objstr);
            Message.prototype.forward.call(msg);
          });
        }, 
        function(err) {
          if (err) {
          logger.error('[Message]', 'async for ech error ' + err);
          return;
        }
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
      logger.info('[Message]', 'user ' + userId + ' msgId ' + msgId + 'is read');
    }
  });
}

module.exports = Message;
