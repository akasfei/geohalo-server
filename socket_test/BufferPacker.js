

function BufferPacker () {
  /**
   * C2S prefix means client send to server
   * S2C prefix means server send to client
   */

  /* client send to server to keep socket connection alive
   * {
   *    tik:1
   * }
   */
  this.C2S_PackType_Heartbeat = 0;

  /**
   * server send to client .confirm receive heartbeat packet.
   * {
   *    tik:1
   * }
   */
  this.S2C_PackType_replyHeartbeat = 0;

  /* client send to server to auth
   * @packet_data_structure
   * {
   *    userid:    $userid,
   *    sessionid: $sessionid 
   * }
   */
  this.C2S_PackType_Online = 1;

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

  /**
   * server send reply message packet to client
   * @packet_data_structure
   * {
   *    toID:      $toID,
   *    sendTime:  $sendTime
   * }
   */
  this.S2C_PackType_replyMsg = 4;

  /**
   * server forward message to online client.
   * @packet_data_structure
   * {
   *    fromID:    $fromID,
   *    sendTime:  $sendTime,
   *    msgContent:$msg
   * }
   */
  this.S2C_PackType_Msg = 5;

  /**
   * client send reply message packet to server
   * {
   *    msgId: $msgId
   * }
   */
  this.C2S_PackType_replyMsg = 6;

  /** 
   * Header byte length
   */
   this.HeaderLength = 2;

   /** 
   * packet type byte length
   */
   this.TypeLength = 1;

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
    if (typeof(callback) != 'function') {
      callback = function () {};
    }

    var type = buffer.readUInt8 (0);
    switch (type) {
      case this.C2S_PackType_Heartbeat:
        checkJsonFormatAndField(buffer, ['tik'], callback);
        break;

      case this.C2S_PackType_Msg:
        checkJsonFormatAndField(buffer, ['fromID', 'toID', 'sendTime', 'msg'], callback);
        break;   

      case this.C2S_PackType_Online:
        checkJsonFormatAndField(buffer, ['sessionid', 'userid'], callback);
        break;   

      case this.C2S_PackType_replyMsg:
        checkJsonFormatAndField(buffer, ['msgId'], callback);
        break;

      case this.S2C_PackType_replyOnline:
        checkJsonFormatAndField(buffer, ['code'], callback);
        break;

      default:
        var error = new Error('unkown packet type');
        callback (error, null);
    }
  };
};





function checkJsonFormatAndField(data, fieldArray, callback){
  var body  = data.slice(1);
  var type  = data.readUInt8(0);
  try{
    var obj = JSON.parse(body);
  }catch(e){
    console.log(e+":json解析失败，packet type:"+type+";body:"+body.toString());
    return callback(e, null);
  }
  for(var field in fieldArray){
    if(!obj.hasOwnProperty(fieldArray[field])){
      var error = new Error("json缺少字段:"+fieldArray[field]+"，packet type:"+type+";body:"+body.toString());
      console.log(error);
      return callback(error, null);
    }
  }
  return callback(null, {type: type, obj: obj});
}

module.exports = new BufferPacker;
