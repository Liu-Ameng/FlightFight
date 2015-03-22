

FF.View = function(data) {
    var self = this;
    var minLength = Math.min(data.width, data.height);
    this.scale = data.width / FF.standardSize;
    this.stage = data.stage;
    this.controller = null;
    this.xOffset = 10;
    this.yOffset = 10;
    createjs.Touch.enable(this.stage);
};

FF.View.prototype.paint = function() {
    
};

// Events
$(document).ready(function() {
    // initEveryThing();

    var canvas = document.getElementById('game-canvas');

    canvas.height = $(window).height() - 100;
    if(canvas.height > FF.standardSize){
        canvas.height = FF.standardSize;
    }
    canvas.width = canvas.height;

    var view = new FF.View({
        width : canvas.width,
        height : canvas.height,
        stage : new createjs.Stage('game-canvas')
    });

    var socket = io();
    
    socket.on('repaint', function(res){
        view.paint(res);
    });

});