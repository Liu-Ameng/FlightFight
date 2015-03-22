var util = require('util');
var async = require('async');

(function EventHandlerDefine() {
    var self = this;
    var flyObj = require('./fly-obj.js');
    var messages = [];
    var sockets = []; //all users <- TODO: Persistence
    this.io = null;

    /*
     * class Player
     */
    function Player(id, socket) {
        this.id = id;
    }

    /*
     * class AllPlayer
     * player list and crud operations
     */
    function AllPlayer() {
        this.list = [];
        this.playerJoin = function(socket){
            var player = new Player(list.length, socket);
            list.push(player);
        };
    }

    module.exports.init = function(io) {
        this.io = io;
        io.on('connection', function(socket) {

            //socket.broadcast.emit('hi');
            sockets.push(socket);
            console.log('[' + (new Date()).toString() + '] a user connected, sokcet = ');

            socket.on('disconnect', function() {
                console.log('[' + (new Date()).toString() + '] a user left, sokcet = ');
                sockets.splice(sockets.indexOf(socket), 1);
                //updateRoster();
            });

            socket.on('message', function(msg) {
                var text = String(msg || '');
                if (!text)
                    return;

                console.log('message: ' + msg);
                io.emit('message', msg);
            });
        });

        function updateRoster() {
          async.map(
            sockets,
            function (socket, callback) {
              socket.get('name', callback);
            },
            function (err, names) {
              broadcast('roster', names);
            }
          );
        }

        function broadcast(event, data) {
          sockets.forEach(function (socket) {
            socket.emit(event, data);
          });
        }
    };

    

    var fts = 30; //30 frame per second
    //setInterval(gameLoop, 1000/fts);

    function gameLoop() {
        //one step movement
        //broadcast latest status
        //broadcast('message', new Date());
        //wait a moment and do again
    }   

    module.exports.onConnect = function() {
        ;
        //return a flight
    }

    module.exports.onFire = function(flight) {
        ;
    }

    module.exports.newPlayer = function() {
        ;
    }
}());