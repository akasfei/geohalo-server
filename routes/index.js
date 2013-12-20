var Route = require('../lib/Route.js');
var User = require('../models/User.js');
var UserEntry = require('../models/UserEntry.js');
var Db = require('../lib/Db.js');
var db = new Db();

module.exports = [
  new Route('POST', '/stats', function (req, res) {
    if (req.session.user)
      res.send({
        'active': true,
        'name': req.session.user.name,
        'email': req.session.user.email
      });
    else {
      res.status(204).send({});
    }
  }),

  new Route('POST', '/login', function (req, res) {
    var hash = require('crypto').createHash('sha1');
    hash.update(req.body.gh_password, 'utf8');
    db.find({'email': req.body.gh_email}, 'users', {'limit': 1}, function (err, docs) {
      if (err)
        return res.status(500).send(err);
      if (typeof docs === 'undefined' || docs.length < 1)
        return res.status(401).send({'err': 'Invalid email.'});
      var codehash = hash.update(docs[0].timestamp.toString(), 'utf8').digest('base64');
      if (codehash === docs[0].password){
        req.session.user = new User(docs[0]);
        return res.send({'ok': true, 'sessionid':req.sessionID});
      } else {
        return res.status(403).send({'err': 'Invalid password.'});
      }
    });
  }),

  new Route('POST', '/register', function (req, res) {
    db.find({'email': req.body.gh_email}, 'users', {'limit': 1}, function (err, docs) {
      if (err)
        return res.status(500).send(err);
      if (docs && docs.length > 0)
        return res.status(409).send({'err': 'This email address is used by another account.'});
      new UserEntry(req.body).store(function (err, data) {
        req.session.user = new User(data);
        return res.status(201).send({'ok': true, 'redirect': '/'});
      })
    })
  }),

  new Route('POST', '/update/location', function (req, res) {
    if (typeof req.session.user === 'undefined')
      return res.status(401).send({'exception': 'NoUserException', 'err': 'Please login first.'});
    req.session.user.updateLocation(req.body.loc, function (err) {
      if (err)
        return res.status(500).send(err);
      return res.status(201).send({'ok': true});
    });
  }),

  new Route('POST', '/search', function (req, res) {

  })
].concat([]);