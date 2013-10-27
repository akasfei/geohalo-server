var net = require('net');
var HeadBodyBuffers = require('head_body_buffers').HeadBodyBuffers;
var manager = require('./ConnectionManager.js');
var Packer  = require('./BufferPacker.js');
var socketevent = require('./SocketEvent.js');

function packetLenght (buffer) {
  return buffer.readUInt16BE(0);
}

var socketServer = net.createServer(function (socket) {
  var hbf = new HeadBodyBuffers(2, packetLenght);
  var errors = 0;

  socket.on ('data', function(data) {
    console.log (data.toString());
    hbf.addBuffer(data);
  });

  socket.on ('close', function() {
    console.log('socket close');
    socket.removeAllListeners();
    manager.removeConnection(socket);
  });

  hbf.on ('packet', function(buffer) {
    Packer.unpack(buffer, function (err, result){
      if (err) {
        errors ++;
        console.log(err);

        // error occured too many times, 
        // close connection.
        if (err >= 3) {
          socket.emit('close');
        }

        return;
      }

      // no error, reset error counter.
      errors = 0;
      socketevent.emit('packet',result, socket);
    });
  });
});

module.exports = socketServer;

socketServer.listen(8888, 'localhost');

console.log ('socket server listen');


