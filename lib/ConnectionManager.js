var logger = require('./SocketLogger.js');

function ConnectionManager () {
  /**
   * key-value map
   * key: userid
   * value: socket object
   */
  this.uid_sock_map = {};

  /**
   * add a socket connection to uid_sock_map
   * @return  undefined
   */
  this.addConnection = function (userid, socket) {
    if (userid == undefined) {
      var err = new Error('userid param is undefined');
      logger.error("ConnectionManager", err);
    }

    if (socket == undefined) {
      var err = new Error('socket param is undefined');
      logger.error("ConnectionManager", err);
    }

    if (typeof(userid) != 'string') {
      var err = new Error('typeof userid should be string');
      logger.error("ConnectionManager", err);
    } 
      
    this.uid_sock_map[userid] = socket;
    socket.userid = userid;
  }

  /**
   * remove a socket connection from uid_sock_map
   * @param userid or socket
   * @return true if success, false otherwise.
   */
  this.removeConnection = function (param) {

    if (param == undefined) {
      var err = new Error('param is undefined');
      logger.error("ConnectionManager", err);
    }

    // param is userid
    if (typeof(param) == 'string') {
      if (this.uid_sock_map.hasOwnProperty(param)) {
        delete this.uid_sock_map[param];
        logger.debug("ConnectionManager",  'remove user connection ' + param);
        return true;
      } else {
        logger.warn("ConnectionManager",  param + 'is not a property of uid_sock_map');
        return false;
      }
    }

    // param is a socket obj
    if (param.hasOwnProperty('userid')) {
      var userid = param.userid;
      if (this.uid_sock_map.hasOwnProperty(userid)) {
        delete this.uid_sock_map[param.userid];
        logger.debug("ConnectionManager",  'remove user connection ' + param.userid);
        return true;
      }     
    }

    logger.fatal("ConnectionManager", "unknown param type");
    return false;
  }

  /**
   * get a socket connection by userid
   * @param useid
   * @return socket obj or undefined
   */
   this.getConByUserID = function (userid) {
    if (typeof(userid) != 'string') {
      var err = new Error('typeof userid should be string');
      logger.error("ConnectionManager", err);
    }
    
    return this.uid_sock_map[userid];
   }
}

// export a ConnectionManager Object
module.exports = new ConnectionManager();
