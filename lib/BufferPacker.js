

function BufferPacker () {

};

/**
 * C2S prefix means client send to server
 * S2C prefix means server send to client
 */

/* client send to server to keep socket connection alive
 * @packet_data_len 0
 */
BufferPacker.prototype.C2S_PackType_Heartbeat = 0;

/* client send to server to auth
 * @packet_data_structure
 * {
 *    userid:    $userid,
 *    sessionid: $sessionid 
 * }
 */
BufferPacker.prototype.C2S_PackType_Online = 1;

/**
 * server reply auth result.
 * @packet_data_structure
 * {
 *    code: $result_code
 * }
 * auth success code: 200
 * auth failed  code: 401
 */
BufferPacker.prototype.S2C_PackType_replyOnline = 2;

/**
 * client send message to server
 * @packet_data_structure
 * {
 *    toID:      $toID,
 *    sendTime:  $sendTime,
 *    msgContent:$msgContent
 * }
 */
BufferPacker.prototype.C2S_PackType_Msg = 3;

/**
 * server send reply message packet to client
 * @packet_data_structure
 * {
 *    toID:      $toID,
 *    sendTime:  $sendTime
 * }
 */
BufferPacker.prototype.S2C_PackType_replyMsg = 4;

/**
 * server forward message to online client.
 * @packet_data_structure
 * {
 *    fromID:    $fromID,
 *    sendTime:  $sendTime,
 *    msgContent:$msgContent
 * }
 */
BufferPacker.prototype.S2C_PackType_Msg = 5;

/**
 * client send reply message packet to server
 * {
 *    fromID:    $fromID,
 *    sendTime:  $sendTime
 * }
 */
BufferPacker.prototype.C2S_PackType_replyMsg = 6;


/** 
 * Header byte length
 */
 BufferPacker.prototype.HeaderLength = 2;

 /** 
 * packet type byte length
 */
 BufferPacker.prototype.TypeLength = 1;

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
BufferPacker.prototype.pack = function (packType, obj) {
  if (packType == undefined) {
    throw new Error('packType param is undefined');
  }

  if (typeof(packType) != 'number') {
    throw new Error('packType param should be a number');
  }

  var str = JSON.stringify (obj);
  var len = Buffer.byteLength (str) 
                  

  var out = new Buffer (BufferPacker.HeaderLength + BufferPacker.TypeLength + len);
  out.writeUInt16BE (BufferPacker.TypeLength + len, 0);
  out.writeUInt8 (packType, BufferPacker.HeaderLength);
  out.write (str, BufferPacker.HeaderLength + BufferPacker.TypeLength, len);

  return out;
};

/*
 * unpack data from buffer
 * @return
 * {
 *   type: $type,
 *   obj : $obj
 * }
 */
BufferPacker.prototype.unpack = function (buffer) {
  // body...
};

module.exports = new BufferPacker;
