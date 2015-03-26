var http = require('http');
var path = require('path');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(path.resolve(__dirname, 'client')));

process.env.PORT = process.env.PORT || 3000;
process.env.IP = process.env.IP || "localhost";
server.listen(process.env.PORT, function(){
  console.log('listening on ' + process.env.IP + ':' + process.env.PORT);
});


var myEventHandler = require('./server/event-handler.js');
myEventHandler.init(io);
myEventHandler.gameBegin();