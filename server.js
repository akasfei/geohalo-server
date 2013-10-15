
/**
 * Module dependencies.
 */
console.log('[%s]\nSystem started. Initializing system parameters.', new Date()) 

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var Mongodb = require('mongodb');
var FS = require('fs');
var app = module.exports = express();
var pkg = require('./package');
var routes = require('./routes');

//parseHtml('layout');
//parseHtml('idnlayout');

app.configure(function(){
  app.set('env', 'development')
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    store: new MongoStore({
      url: app.db.mongourl
    }),
    secret: 'geohalo'
  }));
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
});
  
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
for (var i = 0; i < routes.length; i++) {
  routes[i].register(app);
}

app.listen(process.env.VCAP_APP_PORT || 80, function(){
  console.log("SFEI Systems operating on port %d in %s mode. [%s]",process.env.VCAP_APP_PORT || 80, app.settings.env, new Date());
});
