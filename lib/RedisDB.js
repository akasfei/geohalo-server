var config = {
  host: 'localhost',
  port: '6379',
  auth_pass : 'root'
}

var redis = require('redis');
var client = redis.createClient(config.port, config.host, config);

export.client = client;