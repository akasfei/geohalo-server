var net = require('net');
var ExBuffer = require('ExBuffer');
var manager = require('./ConnectionManager.js');
var Packer  = require('./BufferPacker.js');
var socketevent = require('./SocketEvent.js');

var socketServer = net.createServer(function (socket) {
  var ebf = new ExBuffer().ushortHead().bigEndian();
  var errors = 0;

  socket.on ('data', function(data) {
    ebf.put(data);
  });

  socket.on ('close', function() {
    console.log('socket close');
    socket.removeAllListeners();
    manager.removeConnection(socket);
    socket.destroy();
  });

  socket.on ('end', function() {
    console.log('socket end');
    socket.removeAllListeners();
    manager.removeConnection(socket);
    socket.destroy();
  });

  socket.on ('error', function() {
    console.log('socket on error');
    socket.removeAllListeners();
    manager.removeConnection(socket);
    socket.destroy();
  });

  ebf.on ('data', function(buffer) {
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


