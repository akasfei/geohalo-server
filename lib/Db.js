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
    return;
  console.log(err);
}

Db.prototype.insert = function (data, coll, options, callback) {
  this.client.connect(this.mongourl, function (err, db) {
    if (err)
      return this.error(err);
    if (db == null)
      return console.log('Failed to establish Mongodb connection.');

    db.collection(coll).update(data, options, function (err, data) {
      if (err) {
        this.error(err);
      }
      db.close();
      return callback(err, data);
    });
  });
}

Db.prototype.remove = function (query, coll, options, callback) {
  this.client.connect(this.mongourl, function (err, db) {
    if (err)
      return this.error(err);
    if (db == null)
      return console.log('Failed to establish Mongodb connection.');

    db.collection(coll).remove(query, options, function (err, data) {
      if (err) {
        this.error(err);
      }
      db.close();
      return callback(err, data);
    });
  });
}

Db.prototype.update = function (query, data, coll, options, callback) {
  this.client.connect(this.mongourl, function (err, db) {
    if (err)
      return this.error(err);
    if (db == null)
      return console.log('Failed to establish Mongodb connection.');

    db.collection(coll).update(query, data, options, function (err, data) {
      if (err) {
        this.error(err);
      }
      db.close();
      return callback(err, data);
    });
  });
}

Db.prototype.find = function (query, coll, options, callback) {
  this.client.connect(this.mongourl, function (err, db) {
    if (err)
      return this.error(err);
    if (db == null)
      return console.log('Failed to establish Mongodb connection.');

    db.collection(coll).find(query, options).toArray(function (err, docs) {
      if (err) {
        this.error(err);
      }
      db.close();
      return callback(err, docs);
    });
  });
}

module.exports = Db;