var config = {
  host: 'localhost',
  port: '6379',
}

var redis = require('redis');
var client = redis.createClient(config.port, config.host);

exports.client = client;
    