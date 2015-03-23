FF.View = function(data) {
    var self = this;
    var minLength = Math.min(data.width, data.height);
    this.scale = data.width / FF.standardSize;
    this.stage = data.stage;
    this.controller = null;
    this.xOffset = 10;
    this.yOffset = 10;
    this.allFlyObjs = [];
    createjs.Touch.enable(this.stage);
};

FF.View.prototype.paint = function(res) {
    var i;
    var flyObj;
    for (i = 0; i < res.length; ++i) {
        flyObj = this.updateFlyObj(res[i]);
    }
    this.stage.update();
};

FF.View.prototype.updateFlyObj = function(resObj) {
    var i, flyObj;

    for (i = 0; i < this.allFlyObjs.length; ++i) {
        flyObj = this.allFlyObjs[i];
        if (flyObj.name === resObj.name && flyObj.type === resObj.type) {
            flyObj.x = resObj.x;
            flyObj.y = resObj.y;
            return flyObj;
        }
    }
    return this.createFlyObj(resObj);
};

FF.View.prototype.createFlyObj = function(resObj) {
    var self = this;
    if(resObj.type === 'f') {
        var img = new Image();
        img.src = '../img/flight.png';
        img.onload = function() {
            var f = new createjs.Bitmap(img);
            f.x = resObj.x;
            f.y = resObj.y;
            f.scaleX = 0.25;
            f.scaleY = 0.25;
            f.alpha = 0.8;
            f.name = resObj.name;
            f.type = resObj.type;
            self.stage.addChild(f);

            self.allFlyObjs.push(f);
        };
    }
};

// Events
$(document).ready(function() {
    // initEveryThing();

    var canvas = document.getElementById('game-canvas');

    canvas.height = $(window).height() - 100;
    if (canvas.height > FF.standardSize) {
        canvas.height = FF.standardSize;
    }
    canvas.width = canvas.height;

    var view = new FF.View({
        width: canvas.width,
        height: canvas.height,
        stage: new createjs.Stage('game-canvas')
    });

    var socket = io();
    console.log('Get connected!');

    socket.on('send-id', function(res) {
        FF.playerId = res;
        console.debug(FF.playerId);
    });

    socket.on('send-pos', function(res) {
        console.debug(res);
        view.paint(res);
    });

});