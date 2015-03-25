var util = require('util');
var async = require('async');

(function EventHandlerDefine() {

    var CONST = {
        sendId: 'send-id',
        getKeyPress: 'get-key-press',
        sendPos: 'send-pos',

        stageSize: 700,
        flightSpeed: 5,
        bulletSpeed: 20,
        flightCrashRange: 8,
        bulletCrashRange: 2,
        flightImg: 'flight',
        bulletImg: 'bullet',
    };

    var self = this;
    var flyObj = require('./fly-obj.js');
    var messages = [];
    var sockets = []; //all users <- TODO: Persistence
    this.io = null;

    /*
     * class Player
     */
    function Player(id, socket) {
        this.id = socket.id;
        this.name = id.toString();
        this.socket = socket;
        this.flight = flyObj.createFlight(socket.id);
        this.score = 0;
    }

    Player.prototype.sendId = function() {
        this.socket.emit(CONST.sendId, this.id.toString());
    };

    /*
     * class AllPlayers
     * player list and crud operations
     */
    var AllPlayers = {
        uniqueId: 1,
        players: {},
        flyings: [],

        playerJoin: function(socket) {
            var newPlayer = new Player(this.uniqueId++, socket);
            this.players[newPlayer.name] = newPlayer;
            return newPlayer;
        },

        playerLeft: function(socket) {
            for (var key in this.players) {
                if (this.players[key] !== null && this.players[key].socket == socket) {
                    this.players[key] = null;
                    break;
                }
            }
        },
		
		playerControl: function(socket, data) {
			for (var key in this.players) {
                if (this.players[key] !== null && this.players[key].socket == socket) {
					this.players[key].flight.control(data);
                    break;
                }
            }
		},
		
		playerResetSpeed: function(socket) {
			for (var key in this.players) {
                if (this.players[key] !== null && this.players[key].socket == socket) {
					this.players[key].flight.resetSpeed();
                    break;
                }
            }
		},

        queryPlayer: function(id) {
            return this.players[id.toString()];
        },

        moveOneStep: function() {
            var key, p;
            for (key in this.players) {
                p = this.players[key];
                if (p !== null) {
                    p.flight.move();
                }
            }
            key = this.flyings.length;
            while (key--) {
                if (this.flyings[key].move() === true) {
                    this.flyings.slice(key, 1);
                }
            }
        },

        sendPos: function() {
            var key, p, res = [];
            var hasPlayer = false;
            for (key in this.players) {
                p = this.players[key];
                if (p !== null) {
                    hasPlayer = true;
                    res.push(p.flight.toJson());
                }
            }
            if(hasPlayer === false){
                return;
            }
            for (key = 0; key < this.flyings.length; ++key) {
                res.push(this.flyings[key].toJson());
            }
            for (key in this.players) {
                p = this.players[key];
                if (p !== null) {
                    p.socket.emit(CONST.sendPos, res);
                }
            }
        }
    };

    module.exports.init = function(io) {
        this.io = io;
        io.on('connection', function(socket) {

            console.log('[' + (new Date()).toString() + '] a user connected. ');
            var newPlayer = AllPlayers.playerJoin(socket);
            newPlayer.sendId();
			
			socket.on('control', function(data) {
				AllPlayers.playerControl(socket, data);
			});
			
			socket.on('resetSpeed', function() {
				AllPlayers.playerResetSpeed(socket);
			});

            socket.on('disconnect', function() {
                console.log('[' + (new Date()).toString() + '] a user left. ');
                AllPlayers.playerLeft(socket);
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
                function(socket, callback) {
                    socket.get('name', callback);
                },
                function(err, names) {
                    broadcast('roster', names);
                }
            );
        }
    };



    var fts = 16; // frame per second
    var gameTimer; // = setInterval(gameLoop, 1000/fts);

    function gameLoop() {
        //one step movement
        AllPlayers.moveOneStep();
        //broadcast latest status
        //broadcast('message', new Date());
        AllPlayers.sendPos();
        //wait a moment and do again

    }

    module.exports.gameBegin = function() {
        gameTimer = setInterval(gameLoop, 1000 / fts);
    };

    module.exports.gameOver = function() {
        gameTimer = clearInterval(gameTimer);
    };

}());