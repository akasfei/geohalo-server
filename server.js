
/**
 * Module dependencies.
 */
console.log('[%s]\nSystem started. Initializing system parameters.', new Date()) 

var express = require('express');
var RedisStore = require('connect-redis')(express);
var Db = require('./lib/Db.js');
var FS = require('fs');
var app = module.exports = express();
var pkg = require('./package');
var routes = require('./routes');

app.db = new Db();
app.db.init();

//parseHtml('layout');
//parseHtml('idnlayout');

app.configure(function(){
  app.set('env', 'development')
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    store: new RedisStore({prefix: "geohalo_session:", db:2}),
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

app.listen(process.env.VCAP_APP_PORT || 8080, function(){
  console.log("[%s]\nSFEI Systems operating on port %d in %s mode. ", new Date(), process.env.VCAP_APP_PORT || 8080, app.settings.env);
});
