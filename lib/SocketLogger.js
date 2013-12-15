/**
 * logger for socket server.
 */

var log4js = require('log4js');

log4js.configure({
  appenders:[
    { type: 'console', catagory: 'socketserver'},
// production env only.
//    { type: 'file', filename: 'logs/socketserver.log'}
  ]
});

module.exports = log4js.getLogger();