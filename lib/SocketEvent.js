var events  = require('events');
var util    = require('util');
var manager = require('./ConnectionManager.js');
var Packer  = require('./BufferPacker.js');
var Message = require('../models/Message.js');
var logger  = require('./SocketLogger.js');
var redisDb = require('./RedisDB.js');
var SocketConfig = require('./SocketConfig.js');

function SocketEvent () {
  // call parent constructor
  events.EventEmitter.call(this);

  // define event
  this._events = [];

  // db object. use to check session in redis.

  this._events[0] = 'heartbeat';
  this._events[1] = 'online';
  this._events[2] = 'replyOnline';
  this._events[3] = 'c2sMsg';
  this._events[4] = 's2cReplyMsg';
  this._events[5] = 's2cMsg';
  this._events[6] = 'c2sReplyMsg';

}

util.inherits(SocketEvent, events.EventEmitter);

var socketevent = new SocketEvent();

// check session
socketevent.on('packet', function(result, sock){
  // packet is not online packet and user is not login
  if (result.type != Packer.C2S_PackType_Online) {
    if(!sock.sessionid){
      //TODO send require login packet. 
      logger.warn("[ SocketEvent ]", '[ on packet ]', 
          "receive other packet before login");
      sock.end();
    } else {
      socketevent.emit(socketevent._events[result.type], result.obj, sock);
    }
  } else {
    socketevent.emit(socketevent._events[result.type], result.obj, sock);
  }
});

socketevent.on ('online', function (data, sock){
  logger.info("[ SocketEvent ]", '[ on online ]', "receive online packet");

  this.checkSession(data.userid, data.sessionid, function(result){
    if(result){
      logger.info('[ SocketEvent ]', '[ on online ]', 'check session success.');
      manager.addConnection (data.userid, sock);
      sock.sessionid = data.sessionid;
      var obj = {code: 200};
      var buffer = Packer.pack (Packer.S2C_PackType_replyOnline, obj);
      sock.write(buffer);

      // send unread msg to user
      Message.prototype.sendUnreadMsg(data.userid);
    } else {
      logger.info('[ SocketEvent ]', '[ on online ]', 'check session failed.');
      var obj = {code: 500};
      var buffer = Packer.pack (Packer.S2C_PackType_replyOnline, obj);
      sock.write(buffer);
    }
  });
});

socketevent.on ('c2sMsg', function (data, sock){

  logger.info("SocketEvent", "receive c2sMsg packet");
  
  var msg = new Message (sock.userid, data.toID, data.sendTime, data.msg);
  Message.prototype.save(msg);
  var obj = {toID: data.toID, sendTime: data.sendTime };
  var buffer = Packer.pack(Packer.S2C_PackType_replyMsg, obj);
  sock.write(buffer);
});

socketevent.on ('c2sReplyMsg', function (data, sock) {
  logger.info("SocketEvent", "receive c2sMsg packet");
  Message.setRead(sock.userid, data.msgId);
});

socketevent.on ('heartbeat', function (data, sock) {
  logger.info("SocketEvent", "receive c2s heartbeat packet");

  var obj = { keepalive: 1};
  var buffer = Packer.pack(Packer.S2C_PackType_replyHeartbeat, obj);
  sock.write(buffer);
});

SocketEvent.prototype.checkSession = function (email, sessionid, callback) {
  logger.debug('[ SocketEvent ]', '[ checkSession ]', 'email ' + email,
      'sessionid ' + sessionid);
  redisDb.get(SocketConfig.REDIS_SESSION_PREFIX + sessionid, function(err, jsondata){
    if(err)
      return logger.error('[ SocketEvent ]', '[ checkSession ]', err);
    try{
      var session = JSON.parse(jsondata);
    } catch (e) {
      logger.error('[ SocketEvent ]', '[ checkSession ]', 
                'parse json for session error');
    }

    if(session && session.user && session.user.email && session.user.email === email){
      callback && callback(true);
    } else {
      callback && callback(false);
    }
  });
}
module.exports = socketevent;
