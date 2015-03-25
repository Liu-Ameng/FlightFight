FF.View = function(data) {
    var self = this;
    var minLength = Math.min(data.width, data.height);
    this.scale = data.width / FF.standardSize;
    this.stage = data.stage;
    this.controller = null;
    this.xOffset = 10;
    this.yOffset = 10;
    this.allFlyObjs = [];
    this.allFlyNames = [];
	this.id = '';
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
FF.View.prototype.remove = function(res) {
    for(var key in this.allFlyObjs)
    {
        if(this.allFlyObjs[key].name == res)
        {
            this.stage.removeChild(this.allFlyObjs[key]);
            delete(this.allFlyObjs[key]);
            break;
        }
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
			flyObj.rotation = resObj.angle * 180 / Math.PI;
            return flyObj;
        }
    }
    return this.createFlyObj(resObj);
};

FF.View.prototype.createFlyObj = function(resObj) {
    var self = this;
    var flag = true;
    if(self.allFlyNames[resObj.name] == undefined)
    {
        self.allFlyNames[resObj.name] = 1;
    }
    else
    {
        flag = false;
    }
    if(flag)
    {
        if(resObj.type === 'f') {
            var img = new Image();
            if (resObj.name === self.playerId) {
                img.src = '../img/my-flight.png';
            }
            else {
                img.src = '../img/flight.png';
            }
            img.onload = function() {
                var f = new createjs.Bitmap(img);
                f.x = resObj.x;
                f.y = resObj.y;
                f.rotation = resObj.angle * 180 / Math.PI;
                f.scaleX = 0.25;
                f.scaleY = 0.25;
                f.alpha = 0.8;
                f.name = resObj.name;
                f.type = resObj.type;
                self.stage.addChild(f);

                self.allFlyObjs.push(f);
            };
        }
    }

};

FF.View.prototype.planeControl = function(x, y, socket) {
	var data = {
		offset_speed: (40 - y),
		offset_angle: (x - 40)
	}
	socket.emit('control', data);
}

FF.View.prototype.planeResetSpeed = function(socket) {
	socket.emit('resetSpeed');
}

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
	
	circle = new createjs.Shape();
    circle.graphics.beginFill("red").drawCircle(0, 0, 20);
    //Set position of Shape instance.
    circle.x = circle.y = 40;
    //Add Shape instance to stage display list.
    view.stage.addChild(circle);
    //Update stage will render next frame
    view.stage.update();
	circle.x = circle.y = 80;
	view.stage.update();

    var socket = io();
    console.log('Get connected!');
	
	circle.on("pressmove", function(evt) {
    evt.target.x = evt.stageX;
	if (evt.target.x > 60) evt.target.x = 60;
	else if (evt.target.x < 20) evt.target.x = 20;
    evt.target.y = evt.stageY;
	if (evt.target.y > 60) evt.target.y = 60;
	else if (evt.target.y < 20) evt.target.y = 20;
	view.planeControl(evt.target.x, evt.target.y, socket);
	});
	circle.on("pressup", function(evt) { 
		circle.x = circle.y = 40;
		view.planeResetSpeed(socket);
	});

    socket.on('send-id', function(res) {
        view.playerId = res;
        //console.debug(FF.playerId);
    });

    socket.on('send-pos', function(res) {
        //console.debug(res);
        view.paint(res);
    });
    socket.on('player-leave', function(res) {
        //console.debug(res);
        view.remove(res);
    });

});