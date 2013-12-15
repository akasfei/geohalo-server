var net = require('net');
var ExBuffer = require('ExBuffer');
var manager = require('./ConnectionManager.js');
var Packer  = require('./BufferPacker.js');
var socketevent = require('./SocketEvent.js');
var logger = require('./SocketLogger.js');

var socketServer = net.createServer(function (socket) {
  var ebf = new ExBuffer().ushortHead().bigEndian();
  var errors = 0;

  socket.on ('data', function(data) {
    ebf.put(data);
  });

  socket.on ('close', function() {
    logger.info('socket close', 'userid', socket.userid, "sessionid", socket.sessionid);
    socket.removeAllListeners();
    manager.removeConnection(socket);
    socket.destroy();
  });

  socket.on ('end', function() {
    logger.info('socket end', 'userid', socket.userid, "sessionid", socket.sessionid);
    socket.removeAllListeners();
    manager.removeConnection(socket);
    socket.destroy();
  });

  socket.on ('error', function() {
    logger.error('socket error', 'userid', socket.userid, "sessionid", socket.sessionid);
    socket.removeAllListeners();
    manager.removeConnection(socket);
    socket.destroy();
  });

  ebf.on ('data', function(buffer) {
    Packer.unpack(buffer, function (err, result){
      if (err) {
        errors ++;
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

socketServer.listen(8888);

logger.info('socket server listen');


