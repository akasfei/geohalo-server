var logger = require('./SocketLogger.js');

function BufferPacker () {
  /**
   * C2S prefix means client send to server
   * S2C prefix means server send to client
   */

  /* client send to server to keep socket connection alive
   * {
   *    keepalive:1
   * }
   */
  this.C2S_PackType_Heartbeat = 0;
  this.C2S_heartbeat_fields = ["keepalive"]
  /**
   * server send to client .confirm receive heartbeat packet.
   * {
   *    keepalive:1
   * }
   */
  this.S2C_PackType_replyHeartbeat = 0;
  this.S2C_replyHeartbeat_fields = ["keepalive"];
  /* client send to server to auth
   * @packet_data_structure
   * {
   *    userid:    $userid,
   *    sessionid: $sessionid 
   * }
   */
  this.C2S_PackType_Online = 1;
  this.C2S_Online_fields = ["userid", "sessionid"];
  /**
   * server reply auth result.
   * @packet_data_structure
   * {
   *    code: $result_code
   * }
   * auth success code: 200
   * auth failed  code: 401
   */
  this.S2C_PackType_replyOnline = 2;
  this.S2C_replyOnline_fields = ["code"];
  /**
   * client send message to server
   * @packet_data_structure
   * {
   *    toID:      $toID,
   *    sendTime:  $sendTime,
   *    msg:$msg
   * }
   */
  this.C2S_PackType_Msg = 3;
  this.C2S_Msg_fields = ["toID", "sendTime", "msg"];
  /**
   * server send reply message packet to client
   * @packet_data_structure
   * {
   *    toID:      $toID,
   *    sendTime:  $sendTime
   * }
   */
  this.S2C_PackType_replyMsg = 4;
  this.S2C_replyMsg_fields = ["toID", "sendTime"];

  /**
   * server forward message to online client.
   * @packet_data_structure
   * {
   *    fromID:    $fromID,
   *    sendTime:  $sendTime,
   *    msg:$msg
   * }
   */
  this.S2C_PackType_Msg = 5;
  this.S2C_Msg_fields = ["fromID", "sendTime", "msg"];

  /**
   * client send reply message packet to server
   * {
   *    msgId: $msgId
   * }
   */
  this.C2S_PackType_replyMsg = 6;
  this.C2S_replyMsg_fields = ["msgId"];
  /** 
   * Header byte length
   */
  this.HeaderLength = 2;

   /** 
   * packet type byte length
   */
  this.TypeLength = 1;


  // reference to BufferPacker itself.
  var self = this;

  /**
   * pack data and packtype into a buffer.
   * The buffer structure:
   *
   *   -------------------------------------------------------
   *   | 2 byte header | 1 byte pack_type | * byte pack_data |
   *   -------------------------------------------------------
   *
   * @param packType -- 
   * @param obj -- packet data obj
   * @return a buffer contain 2 byte header data
   *         1 byte packetType data
   *         * byte packet_data
   */
  this.pack = function (packType, obj) {
    if (packType == undefined) {
      throw new Error('packType param is undefined');
    }

    if (typeof(packType) != 'number') {
      throw new Error('packType param should be a number');
    }

    var str = JSON.stringify (obj);
    var len = Buffer.byteLength (str) 
    
    var out = new Buffer (this.HeaderLength + this.TypeLength + len);
    out.writeUInt16BE (this.TypeLength + len, 0);
    out.writeUInt8 (packType, this.HeaderLength);
    out.write (str, this.HeaderLength + this.TypeLength, len);

    return out;
  };

  /*
   * unpack data from buffer
   * @callback (err, result)
   * 
   * result:
   * {
   *   type: $type,
   *   obj : $obj
   * }
   */
  this.unpack = function (buffer, callback) {
    
    var type = buffer.readUInt8 (0);
    switch (type) {
      case this.C2S_PackType_Heartbeat:
        checkJsonFormatAndField(buffer, self.C2S_heartbeat_fields, callback);
        break;

      case this.C2S_PackType_Msg:
        checkJsonFormatAndField(buffer, self.C2S_Msg_fields, callback);
        break;   

      case this.C2S_PackType_Online:
        checkJsonFormatAndField(buffer, self.C2S_Online_fields, callback);
        break;   

      case this.C2S_PackType_replyMsg:
        checkJsonFormatAndField(buffer, self.C2S_replyMsg_fields, callback);
        break;

      case this.S2C_PackType_replyOnline:
        checkJsonFormatAndField(buffer, self.S2C_replyOnline_fields, callback);
        break;

      case this.S2C_PackType_replyMsg:
        checkJsonFormatAndField(buffer, self.S2C_replyMsg_fields, callback);
        break;

      case this.S2C_PackType_Msg:
        checkJsonFormatAndField(buffer, self.S2C_Msg_fields, callback);
        break;
        
      default:
        var error = new Error('unkown packet type');
        logger.fatal("BufferPacker", "unpack", "packetType", type, error);
        callback && callback(error, null);
    }
  };
};





function checkJsonFormatAndField(data, fieldArray, callback){
  var body  = data.slice(1);
  var type  = data.readUInt8(0);
  
  try{
    var obj = JSON.parse(body);
  }catch(e){
    logger.error("checkJsonFormatAndField", "parse json error", e);
    return callback && callback(e, null);
  }

  fieldArray.forEach(function(field){
    if(!obj.hasOwnProperty(field) || field === null){
      logger.error("checkJsonFormatAndField", "packet type", type, "json ", body.toString());
      return callback && callback(new Error('checkJsonFormatAndField require field ' + field), null);
    }
  });
  return callback && callback(null, {type: type, obj: obj});
}

module.exports = new BufferPacker;
