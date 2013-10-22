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
      throw new Error('userid param is undefined');
    }

    if (socket == undefined) {
      throw new Error('socket param is undefined');
    }

    if (typeof(userid) != 'string') {
      throw new Error('typeof userid should be string');
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
      throw new Error('param is undefined');
    }

    // param is userid
    if (typeof(param) == 'string') {
      if (this.uid_sock_map.hasOwnProperty(param)) {
        delete this.uid_sock_map[param];
        return true;
      } else {
        console.log(param + 'is not a property of uid_sock_map');
        return false;
      }
    }

    // param is a socket obj
    if (param.hasOwnProperty('userid')) {
      var userid = param.userid;
      if (this.uid_sock_map.hasOwnProperty(userid)) {
        delete this.uid_sock_map[param.userid];
        return true;
      }     
    }

    return false;
  }

  /**
   * get a socket connection by userid
   * @param useid
   * @return socket obj or undefined
   */
   this.getConByUserID = function (userid) {
    if (typeof(userid) != 'string') {
      throw new Error('typeof userid should be string');
    }
    
    return this.uid_sock_map[userid];
   }
}

// export a ConnectionManager Object
module.exports = new ConnectionManager();