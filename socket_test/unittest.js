var net = require('net');
var assert = require('assert');
var BufferPacker = require('../lib/BufferPacker.js');
var ExBuffer = require('ExBuffer');

// read packet length from stream
function bodyLength(data) {
  return data.readUInt16BE(0);
};

exports.testOnlinePacket = function(sock) {
  var client = new net.Socket();

  client.connect(8888, 'localhost', function(){
    var ebf = new ExBuffer().ushortHead().bigEndian();
    client.on ('data', function (data) {
      ebf.put(data);
    });

    // handle reply packet data
    ebf.on('data', function(data){
      BufferPacker.unpack(data, function(err, result) {
        assert.ok(!err, 'error occured when client unpack repy online packet');
        assert.ok(result, 'reply online packet result undefined');
        assert.equal(result.type, BufferPacker.S2C_PackType_replyOnline, 
            'reply online packet type is not 2');
        assert.ok(result.obj, 'reply online pack result entity is undefined');
        assert.equal(result.obj.code, 200, 'reply online result code is not 200');

        console.log('testOnlinePacket pass');
        client.destroy();
      });
    });

    // send online packet data
    var obj = {};
    obj.userid = 'online_user';
    obj.sessionid = 'online_session';
    client.write(BufferPacker.pack(BufferPacker.C2S_PackType_Online, obj));
  });
};

exports.testHeartbeatPacket = function() {
  var client = new net.Socket();
  var ebf = new ExBuffer().ushortHead().bigEndian();
  client.connect(8888, 'localhost', function(){
    var online = false;



    client.on ('data', function (data) {
      ebf.put(data);
    });

    // handle reply packet data
    ebf.on('data', function(data){
      BufferPacker.unpack(data, function(err, result) {
        if(online) {
          assert.ok(!err, 'error occured when client unpack repy heartbeat packet');
          assert.ok(result, 'reply heartbeat packet result undefined');
          assert.equal(result.type, BufferPacker.S2C_PackType_replyHeartbeat, 
              'reply heartbeat packet type is not 0');
          assert.ok(result.obj, 'reply online pack result entity is undefined');

          console.log('testHeartbeatPacket pass');
          client.end();
          client.destroy();
        } else {
          online = true;
        }
      });
    });

    // send online packet data
    var obj = {};
    obj.userid = 'online_user';
    obj.sessionid = 'online_session';
    client.write(BufferPacker.pack(BufferPacker.C2S_PackType_Online, obj));

    // send heartbeat packet data
    var obj1 = {};
    obj1.tik = '1';
    client.write(BufferPacker.pack(BufferPacker.C2S_PackType_Heartbeat, obj1));
  });
};

var sendMsgObj = {};
sendMsgObj.toID = 'recv_id';
sendMsgObj.sendTime = new Date().getTime().toString();
sendMsgObj.msg = 'this is a very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long msg';
exports.testSendMsgPacket = function() {
  var client = new net.Socket();

  client.connect(8888, 'localhost', function(){
    var hbf = new ExBuffer().ushortHead().bigEndian();
    var online = false;

    client.on ('data', function (data) {
      hbf.put(data);
    });

    // handle reply packet data
    hbf.on('data', function(data){
      BufferPacker.unpack(data, function(err, result) {
        if(online) {
          if (err) 
            console.log(err);
          assert.ok(!err, 'error occured when client unpack s2c repy msg packet');
          assert.ok(result, 's2c reply msg packet result undefined');
          assert.equal(result.type, BufferPacker.S2C_PackType_replyMsg, 
              's2c reply msg packet type is not 4');
          assert.ok(result.obj, 's2c reply msg pack result entity is undefined');
          assert.equal(result.obj.toID, sendMsgObj.toID, 's2c reply msg pack toID is not correct');
          assert.equal(result.obj.sendTime, sendMsgObj.sendTime, 's2c reply msg pack sendTime is not correct');
          console.log('testSendMsg pass');
          client.end();
        } else {
          online = true;
        }
      });
    });

    // send online packet data
    var obj = {};
    obj.userid = 'send_id';
    obj.sessionid = 'send_id_session';
    client.write(BufferPacker.pack(BufferPacker.C2S_PackType_Online, obj));

    // send heartbeat packet data
    client.write(BufferPacker.pack(BufferPacker.C2S_PackType_Msg, sendMsgObj));
  });
};

exports.testRecvMsgPacket = function() {
  var client = new net.Socket();

  client.connect(8888, 'localhost', function(){
    var hbf = new ExBuffer().ushortHead().bigEndian();
    var online = false;

    client.on ('data', function (data) {
      hbf.put(data);
    });

    // handle reply packet data
    hbf.on('data', function(data){
      BufferPacker.unpack(data, function(err, result) {
        if(online) {
          if(err) {
            console.log(err);
          }

          assert.ok(!err, 'error occured when client unpack s2c msg packet');
          assert.ok(result, 's2c msg packet result undefined');
          assert.equal(result.type, BufferPacker.S2C_PackType_Msg, 
              's2c msg packet type is not 4');
          assert.ok(result.obj, 's2c msg pack result entity is undefined');
          assert.equal(result.obj.fromID, 'send_id', 's2c msg pack fromID is not correct');
          //assert.equal(result.obj.sendTime, sendMsgObj.sendTime, 's2c msg pack sendTime is not correct');
          assert.equal(result.obj.msg, sendMsgObj.msg, 's2c msg pack msg is not correct');
          console.log('testRecvMsg pass');
          client.end();
        } else {
          online = true;
        }
      });
    });

    // send online packet data
    var obj = {};
    obj.userid = 'recv_id';
    obj.sessionid = 'recv_id_session';
    client.write(BufferPacker.pack(BufferPacker.C2S_PackType_Online, obj));
  });
};