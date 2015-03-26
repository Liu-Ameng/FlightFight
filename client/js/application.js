// namespace
window.FF = {
    game: {},
    controller: {},
    view: {},
    standardSize: 700,
    socket: null,
    playerId: ''
};

// Events
$(document).ready(function() {

    var canvas = document.getElementById('game-canvas');

    canvas.height = $(window).height() - 100;
    if (canvas.height > FF.standardSize) {
        canvas.height = FF.standardSize;
    }
    canvas.width = canvas.height;

    FF.view = new FF.View({
        width: canvas.width,
        height: canvas.height,
        stage: new createjs.Stage('game-canvas')
    });
    var view = FF.view;

    FF.socket = io();
    var socket = FF.socket;
    console.log('Get connected!');

    socket.on('send-id', function(res) {
        FF.playerId = res;
        console.log("my id = " + FF.playerId);
    });

    socket.on('send-pos', function(res) {
        //console.debug(res);
        view.paint(res);
    });

    socket.on('player-leave', function(res) {
        //console.debug(res);
        view.remove(res);
    });
	
	socket.on('player-dead', function(res) {
        //console.debug(res);
        view.kill(res);
    });
	
    socket.on('bullet-remove', function(res) {
        //console.debug(res);
        view.removeBullets(res);
    });

    FF.controller = new FF.Controller();

});