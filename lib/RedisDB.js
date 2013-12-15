var logger = require('./SocketLogger.js');

var config = {
  host: 'localhost',
  port: '6379',
}

var redis = require('redis');
var client = redis.createClient(config.port, config.host);

client.on('error', function(err) {
  logger.error('RedisDB', err);
});

client.on('ready', function(err) {
  logger.info('RedisDB is ready');
});

client.on('reconnecting', function(arg){
  logger.info('RedisDB', 'reconnecting', JSON.stringify(arg));
});

client.on('connect', function(){
  logger.info('RedisDB', 'connected');
});

exports.client = client;
    