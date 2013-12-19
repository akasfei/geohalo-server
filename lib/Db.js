var assert = require('assert');

function Db () {
  //var Server = this.mongodb.Server;
  this.mongourl = "mongodb://" + this.params.hostname + ":" + this.params.port + "/" + this.params.db;
  this.client = this.mongodb.MongoClient;
  return this;
}

Db.prototype.mongodb = require('mongodb');

Db.prototype.params = {
  "hostname":"localhost",
  "port":27017,
  "username":"",
  "password":"",
  "name":"",
  "db":"geohalo"
};

Db.prototype.error = function (err) {
  if (typeof err === 'undefined')
    return this;
  console.log(err);
  return this;
}

Db.prototype.insert = function (data, coll, options, callback) {
  this.client.connect(this.mongourl, function (err, db) {
    if (err)
      return this.error(err);
    if (db == null) {
      console.log('Failed to establish Mongodb connection.');
      return this;
    }

    db.collection(coll).insert(data, options, function (err, data) {
      if (err) {
        this.error(err);
      }
      db.close();
      return callback(err, data);
    });
  });
}

Db.prototype.remove = function (query, coll, options, callback) {
  var _this = this;
  this.client.connect(this.mongourl, function (err, db) {
    if (err)
      return _this.error(err);
    if (db == null) {
      console.log('Failed to establish Mongodb connection.');
      return _this;
    }

    db.collection(coll).remove(query, options, function (err, data) {
      if (err) {
        _this.error(err);
      }
      db.close();
      return callback(err, data);
    });
  });
}

Db.prototype.update = function (query, data, coll, options, callback) {
  var _this = this;
  this.client.connect(this.mongourl, function (err, db) {
    if (err)
      return _this.error(err);
    if (db == null) {
      console.log('Failed to establish Mongodb connection.');
      return _this;
    }

    db.collection(coll).update(query, data, options, function (err, data) {
      if (err) {
        _this.error(err);
      }
      db.close();
      return callback(err, data);
    });
  });
}

Db.prototype.find = function (query, coll, options, callback) {
  var _this = this;
  this.client.connect(this.mongourl, function (err, db) {
    if (err)
      return _this.error(err);
    if (db == null) {
      console.log('Failed to establish Mongodb connection.');
      return _this;
    }

    db.collection(coll).find(query, options).toArray(function (err, docs) {
      if (err) {
        _this.error(err);
      }
      db.close();
      return callback(err, docs);
    });
  });
}

Db.prototype.geoSearch = function(loc, coll, options, callback) {
  var _this = this;
  this.client.connect(this.mongourl, function (err, db) {
    if (err)
      return _this.error(err);
    if (db == null) {
      console.log('Failed to establish Mongodb connection.');
      return _this;
    }

    db.collection(coll).geoHaystackSearch(loc[0], loc[1], options, function (err, docs) {
      if (err) {
        _this.error(err);
      }
      db.close();
      return callback(err, docs);
    });
  });
}

Db.prototype.init = function () {
  var _this = this;
  this.client.connect(this.mongourl, function (err, db) {
    assert.equal(null, err);
    assert.ok(db != null);
    _this.initUser(db, function () {
      _this.initLocation(db, function () {
        db.close();
        return _this;
      });
    })
  });
}

Db.prototype.initUser = function (db, callback) {
  var _this = this;
  db.collection('users').find({'name': 'super_ops', 'admin': true}).toArray(function (err, docs) {
    var UserEntry = require('../models/UserEntry.js');
    if (err)
      _this.error(err);
    if (docs.length < 1) {
      console.log('Default admin account not found.')
      new UserEntry({
        'gh_email': 'super-ops@ssiops.org',
        'gh_password': 'SSI_SUPER_OPS',
        'gh_name': 'super_ops'
      }).setAdmin().store(function (err) {
        assert.equal(null, err);
        db.collection('users').ensureIndex({'email': 1}, {unique:true, background:true, dropDups:true, w:1}, function (err, indexName) {
          assert.equal(null, err);
          return callback();
        });
      });
    } else {
      return callback();
    }
  });
}

Db.prototype.initLocation = function (db, callback) {
  db.collection('location').ensureIndex({'loc': 'geoHaystack', 'type': 1}, {background:true, bucketSize: 1}, function (err, indexName) {
    assert.equal(null, err);
    db.collection('location_history').ensureIndex({'loc': 'geoHaystack', 'type': 1}, {background:true, bucketSize: 1}, function (err, indexName) {
      assert.equal(null, err);
      return callback();
    });
  });
}

module.exports = Db;
