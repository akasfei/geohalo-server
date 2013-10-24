var events  = require('events');
var util    = require('util');
var manager = require('./ConnectionManager.js');
var Packer  = require('./BufferPacker.js');

function SocketEvent () {
  // call parent constructor
  events.EventEmitter.call(this);

  // define event
  this._envents = [];

  this._envents[0] = 'heartbeat';
  this._envents[1] = 'online';
  this._envents[2] = 'replyOnline';
  this._envents[3] = 'c2sMsg';
  this._envents[4] = 's2cReplyMsg';
  this._envents[5] = 's2cMsg';
  this._envents[6] = 'c2sReplyMsg';

}

util.inherits(SocketEvent, events.EventEmitter);

var socketevent = new SocketEvent();

socketevent.on ('online', function (data, sock){
  // check session and binding user.
  manager.addConnection (data.userid, sock);
  var obj = {code: 200};
  var buffer = Packer.pack (Packer.S2C_PackType_replyOnline, obj);
  sock.write(buffer);
});

socketevent.on ('c2sMsg', function (data, sock){
  // TODO
  // check session
  var msg = new Message (sock.userid, data.toID, data.sendTime, data.msg);
  msg.save();
  var obj = {toID: data.toID, sendTime: data.sendTime };
  var buffer = Packer.pack(Packer.S2C_PackType_replyMsg, obj);
  sock.write(buffer);
});

socketevent.on ('c2sReplyMsg', function (data, sock) {
  Message.setRead(sock.userid, data.msgId);
});

module.exports = socketevent;
