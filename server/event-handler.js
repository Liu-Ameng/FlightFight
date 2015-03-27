var util = require('util');
var async = require('async');

(function EventHandlerDefine() {

    Object.size = function(obj) {
        var size = 0,
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    var CONST = {
        sendId: 'send-id',
        getKeyPress: 'get-key-press',
        sendPos: 'send-pos',
        playerLeave: 'player-leave',
        playerDead: 'player-dead',
        enablePlaneCollision: false
    };

    var self = this;
    var flyObj = require('./fly-obj.js');
    var sockets = []; //all users <- TODO: Persistence
    this.io = null;

    /*
     * class Player
     */
    function Player(name, socket) {
        this.id = socket.id;
        this.name = name;
        this.socket = socket;
        this.flight = flyObj.createFlight(this.id, name);
        this.score = 0;
    }

    Player.prototype.sendId = function() {
        this.socket.emit(CONST.sendId, this.id);
    };

    Player.prototype.toJson = function() {
        return {
            id: this.id,
            name: this.name
        };
    };

    /*
     * class AllPlayers
     * player list and crud operations
     */
    var AllPlayers = {
        uniqueId: 1,
        players: {},
        flyings: [],

        printNumberOfPlayer: function() {
            console.log('[' + (new Date()).toString() + '] Online plyar: ' + Object.size(this.players));
        },

        playerJoin: function(socket, name) {
            var newPlayer = new Player(name, socket);
            this.players[socket.id] = newPlayer;

            console.log('[' + (new Date()).toString() + '] a user connected. ');
            this.printNumberOfPlayer();
            return newPlayer;
        },

        playerLeft: function(socket) {
            var player = this.players[socket.id];
            if (player) {
                for (var key in this.players) {
                    this.players[key].socket.emit(CONST.playerLeave, player.toJson());
                }
                delete this.players[socket.id];
                console.log('[' + (new Date()).toString() + '] player [id =' + socket.id + '] leave us.');
                this.printNumberOfPlayer();
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

        bulletFire:function(socket)
        {
            for (var key in this.players) {
                if (this.players[key] !== null && this.players[key].socket == socket) {
                    var bullet = flyObj.fire(this.players[key].flight);
                    this.flyings.push(bullet);
                    break;
                }
            }
        },

        moveOneStep: function() {
            var key, key2, key3, p;
            for (key in this.players) {
                p = this.players[key];
                if (p !== null) {
                    p.flight.move();
                    if (CONST.enablePlaneCollision) {
                        for (key2 in this.players) {
                            if (key == key2) continue;
                            p2 = this.players[key2];
                            if (p.flight.isCrash(p2.flight) === true) {
                                delete this.players[key];
                                for (key3 in this.players) {
                                    this.players[key3].socket.emit(CONST.playerDead, key);
                                }
                                console.log('[' + (new Date()).toString() + '] player [id =' + key + '] leave us.');
                                this.printNumberOfPlayer();
                                delete this.players[key2];
                                for (key3 in this.players) {
                                    this.players[key3].socket.emit(CONST.playerDead, key2);
                                }
                                console.log('[' + (new Date()).toString() + '] player [id =' + key2 + '] leave us.');
                                this.printNumberOfPlayer();
                            }
                        }
                    }
                }
            }
            key = this.flyings.length;
            var outArr = [];
            while (key--) {
                if (this.flyings[key].move() === true) {
                    outArr.push(this.flyings[key].toJson());
                    this.flyings.splice(key,1);
                    continue;
                }
                for (key2 in this.players) {
                    p = this.players[key2];
                    if (p !== null) {
                        if (this.flyings[key] && this.flyings[key].isCrash(p.flight) === true) {
                            for (key3 in this.players) {
                                this.players[key3].socket.emit(CONST.playerDead, {
                                    killer: this.players[this.flyings[key].owner].toJson(),
                                    killed: this.players[key2].toJson()
                                });
                            }
                            delete this.players[key2];
                            this.players[this.flyings[key].owner].score++;
                            console.log(this.flyings[key].owner + 'get 1 score, score = ' + this.players[this.flyings[key].owner].score);
                            console.log('[' + (new Date()).toString() + '] player [id =' + key2 + '] leave us.');
                            this.printNumberOfPlayer();
                            outArr.push(this.flyings[key].toJson());
                            this.flyings.splice(key,1);
                            continue;
                        }
                    }
                }
            }
            if(outArr.length >0)
            {
                for (key in this.players) {
                    p = this.players[key];
                    if (p !== null ) {
                        p.socket.emit('bullet-remove',outArr);
                    }
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
            if (hasPlayer === false) {
                return;
            }
            for (key = 0; key < this.flyings.length; ++key) {
                res.push(this.flyings[key].toJson());
            }
            //console.log('flying length is '+this.flyings.length);
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

            socket.on('player-join', function(name) {
                var newPlayer = AllPlayers.playerJoin(socket, name);
                newPlayer.sendId();
            });

            socket.on('control', function(data) {
                //console.log('[' + (new Date()).toString() + '] a user control. ');
                AllPlayers.playerControl(socket, data);
            });

            socket.on('resetSpeed', function() {
                AllPlayers.playerResetSpeed(socket);
            });

            socket.on('fire', function() {
                AllPlayers.bulletFire(socket);
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

    };

    var fts = 50; // frame per second
    var gameTimer; // = setInterval(gameLoop, 1000/fts);
    var sendFlg = 0;

    function gameLoop() {
        //one step movement
        AllPlayers.moveOneStep();
        //broadcast latest status
        //broadcast('message', new Date());
        if (sendFlg === 0) {
            AllPlayers.sendPos();
        }
        sendFlg = (sendFlg + 1) & 7;
        //wait a moment and do again

    }

    module.exports.gameBegin = function() {
        gameTimer = setInterval(gameLoop, 1000 / fts);
    };

    module.exports.gameOver = function() {
        gameTimer = clearInterval(gameTimer);
    };

}());