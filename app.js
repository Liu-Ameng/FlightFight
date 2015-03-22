var http = require('http');
var path = require('path');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(path.resolve(__dirname, 'client')));

server.listen(3000, function(){
  console.log('listening on *:3000');
});


var myEventHandler = require('./server/event-handler.js');
myEventHandler.init(io);