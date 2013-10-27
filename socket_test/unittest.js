var net = require('net');
var assert = require('assert');
var HeadBodyBuffers = require('head_body_buffers').HeadBodyBuffers;
var BufferPacker = require('../lib/BufferPacker.js');

// read packet length from stream
function bodyLength(data) {
  return data.readUInt16BE(0);
};

exports.testOnlinePacket = function(sock) {
  var client = new net.Socket();

  client.connect(8888, 'localhost', function(){
    var hbf = new HeadBodyBuffers(2, bodyLength);
    client.on ('data', function (data) {
      console.log(data.toString());
      hbf.addBuffer(data);
    });

    // handle reply packet data
    hbf.on('packet', function(data){
      BufferPacker.unpack(data, function(err, result) {
        assert.ok(!err, 'error occured when client unpack repy online packet');
        assert.ok(result, 'reply online packet result undefined');
        assert.equal(result.type, BufferPacker.S2C_PackType_replyOnline, 
            'reply online packet type is not 2');
        assert.ok(result.obj, 'reply online pack result entity is undefined');
        assert.equal(result.obj.code, 200, 'reply online result code is not 200');

        console.log('testOnlinePacket pass');
        client.end();
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

  client.connect(8888, 'localhost', function(){
    var hbf = new HeadBodyBuffers(2, bodyLength);
    var online = false;

    client.on ('data', function (data) {
      hbf.addBuffer(data);
    });

    // handle reply packet data
    hbf.on('packet', function(data){
      BufferPacker.unpack(data, function(err, result) {
        if(online) {
          assert.ok(!err, 'error occured when client unpack repy heartbeat packet');
          assert.ok(result, 'reply heartbeat packet result undefined');
          assert.equal(result.type, BufferPacker.S2C_PackType_replyHeartbeat, 
              'reply heartbeat packet type is not 0');
          assert.ok(result.obj, 'reply online pack result entity is undefined');

          console.log('testHeartbeatPacket pass');
          client.end();
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
    var obj = {};
    client.write(BufferPacker.pack(BufferPacker.C2S_PackType_Heartbeat, obj));
  });
};