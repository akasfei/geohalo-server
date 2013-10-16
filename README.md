# OPS Geohalo

> Web server for a LBS Android app that allows users to share their locations and activities with friends.

## Overview

**This project is still under development. Certain features may be unstable or unavailable.**

This project is the server-side code for project `GEOHALO`, an Android LBS app that allows users to share their locations and activities. This server will store user's current and history locations and activities, and share them in a fashion based on the user's choice. The server will also provide instant messaging service for users to chat with nearby users. Both these features will be based on a (secure) persistant TCP connection.

To test the location sharing feature, the server provides a series of HTTP interfaces which allow users to update thier location using HTTP requests. This interface will be deprecated once the location and activity sharing feature is throughly tested. The classes used to implement those features will also be refactored after the test.

## Run the server

### Start `mongodb`

Because this server uses the mongodb geohash feature, `mongodb` version >= 2.4 is required.

```

$ mongod

```

### Install dependencies

```
npm install
```

### Start the server

```
node server.js
```

## Documentation

Available in docs/