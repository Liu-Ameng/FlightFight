// namespace
window.FF = {
    game: {},
    controller: {},
    view: {},
    standardSize: 700,
    socket: null,
    playerId: '',
    killList: [],
    killedBy: ''
};

// Events
$(document).ready(function() {
	
	createjs.Ticker.setFPS(60);

    var canvas = document.getElementById('game-canvas');

    canvas.height = $(window).height() - 100;
    if (canvas.height > FF.standardSize) {
        canvas.height = FF.standardSize;
    }
    canvas.width = canvas.height;

    FF.socket = io();
    var socket = FF.socket;

    FF.message = new FF.MessageController();

    FF.view = new FF.View({
        width: canvas.width,
        height: canvas.height,
        stage: new createjs.Stage('game-canvas')
    });   
    var view = FF.view;
	createjs.Ticker.addEventListener('tick', FF.view.stage);

    console.log('Get connected!');

    FF.controller = new FF.Controller();
	
	createjs.Ticker.addEventListener('tick', FF.controller.stage);

    socket.emit('player-join', localStorage.getItem('playerName'));

    socket.on('send-id', function(res) {
        FF.playerId = res;
        FF.message.append('You join the game!', 'success');
    });

    socket.on('send-pos', function(res) {
        //console.debug(res);
        view.paint(res);
    });

    socket.on('player-leave', function(res) {
        FF.message.append(res.name + ' left game...', 'warning');
        view.remove(res);
    });
	
	socket.on('player-dead', function(res) {
        FF.message.append(res.killer.name + ' killed ' + res.killed.name + '!!', 'danger');
        view.kill(res);
    });
	
    socket.on('bullet-remove', function(res) {
        //console.debug(res);
        view.removeBullets(res);
    });

});