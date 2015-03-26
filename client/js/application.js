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
    socket.on('bullet-remove', function(res) {
        //console.debug(res);
        view.removeBullets(res);
    });

    FF.controller = new FF.Controller();
	var controller = FF.controller;

    joystick = new createjs.Shape();
    joystick.graphics.beginFill('red').drawCircle(0, 0, controller.joystickRadius)
		.beginFill('red').drawCircle(0, 0, (controller.joystickRadius - controller.joystickDiff))
		.beginFill('red').drawCircle(0, 0, (controller.joystickRadius - controller.joystickDiff * 2))
		.beginFill('red').drawCircle(0, 0, (controller.joystickRadius - controller.joystickDiff * 3))
		.beginFill('red').drawCircle(0, 0, (controller.joystickRadius - controller.joystickDiff * 4))
		.beginFill('red').drawCircle(0, 0, (controller.joystickRadius - controller.joystickDiff * 5))
		.beginFill('white').drawCircle(controller.joystickDiff * 6, -controller.joystickDiff * 6, 3);
	joystick.alpha = controller.joystickAlpha;
    joystick.x = controller.joystickIniPos.x;
    joystick.y = controller.joystickIniPos.y;
    controller.stage.addChild(joystick);
    controller.stage.update();

	joystick.on('pressmove', function(evt) {
		controller.controlling = true;
		var actualX = evt.stageX;
		var actualY = evt.stageY;
		var dx = actualX - controller.joystickIniPos.x;
		var dy = actualY - controller.joystickIniPos.y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > controller.joystickRange.radius) {
			actualX = controller.joystickIniPos.x + dx / dist * controller.joystickRange.radius;
			actualY = controller.joystickIniPos.y + dy / dist * controller.joystickRange.radius;
		}
		/*evt.currentTarget.x = evt.stageX;
		if (evt.currentTarget.x > (controller.joystickIniPos.x + controller.joystickRange.x)) {
			evt.currentTarget.x = (controller.joystickIniPos.x + controller.joystickRange.x);
		}
		else if (evt.currentTarget.x < (controller.joystickIniPos.x - controller.joystickRange.x)) {
			evt.currentTarget.x = (controller.joystickIniPos.x - controller.joystickRange.x);
		}
		evt.currentTarget.y = evt.stageY;
		if (evt.currentTarget.y > (controller.joystickIniPos.y + controller.joystickRange.y)) {
			evt.currentTarget.y = (controller.joystickIniPos.y + controller.joystickRange.y);
		}
		else if (evt.currentTarget.y < (controller.joystickIniPos.y - controller.joystickRange.y)) {
			evt.currentTarget.y = (controller.joystickIniPos.y - controller.joystickRange.y);
		}*/
		evt.currentTarget.x = actualX;
		evt.currentTarget.y = actualY;
		controller.joystickCurPos.x = evt.currentTarget.x;
		controller.joystickCurPos.y = evt.currentTarget.y;
		controller.stage.update();
	});
	
	joystick.on('pressup', function(evt) {
		controller.controlling = false;
		controller.joystickCurPos.x = controller.joystickIniPos.x;
		controller.joystickCurPos.y = controller.joystickIniPos.y;
		controller.stage.update();
		controller.planeResetSpeed();
		createjs.Tween.get(joystick, {loop: false})
			.to({x: controller.joystickIniPos.x, y: controller.joystickIniPos.y}, 
			500, createjs.Ease.getPowInOut(4));
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", controller.stage);
	});
	
	multiControl = 0; // 1: left, 2: up, 3: right, 4: down, 5: left-up, 6: left- down, 7: right-up, 8: right-down
	
	document.onkeydown = function(event) {
		if (event.keyCode == 37) {
			var dstX = controller.joystickIniPos.x;
			var dstY = controller.joystickIniPos.y;
			if (multiControl == 0) {
				multiControl = 1;
				dstX = (controller.joystickIniPos.x - controller.joystickRange.radius);
			}
			else if (multiControl == 2) {
				multiControl = 5;
				dstX = (controller.joystickIniPos.x - Math.sqrt(2) / 2 * controller.joystickRange.radius);
				dstY = (controller.joystickIniPos.y - Math.sqrt(2) / 2 * controller.joystickRange.radius);
			}
			else if (multiControl == 4) {
				multiControl = 6;
				dstX = (controller.joystickIniPos.x - Math.sqrt(2) / 2 * controller.joystickRange.radius);
				dstY = (controller.joystickIniPos.y + Math.sqrt(2) / 2 * controller.joystickRange.radius);
			}
			else return;
			controller.controlling = true;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: dstX, y: dstY}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = dstX;
			controller.joystickCurPos.y = dstY;
			controller.stage.update();
		}
		else if (event.keyCode == 38) {
			var dstX = controller.joystickIniPos.x;
			var dstY = controller.joystickIniPos.y;
			if (multiControl == 0) {
				multiControl = 2;
				dstY = (controller.joystickIniPos.y - controller.joystickRange.radius);
			}
			else if (multiControl == 1) {
				multiControl = 5;
				dstX = (controller.joystickIniPos.x - Math.sqrt(2) / 2 * controller.joystickRange.radius);
				dstY = (controller.joystickIniPos.y - Math.sqrt(2) / 2 * controller.joystickRange.radius);
			}
			else if (multiControl == 3) {
				multiControl = 7;
				dstX = (controller.joystickIniPos.x + Math.sqrt(2) / 2 * controller.joystickRange.radius);
				dstY = (controller.joystickIniPos.y - Math.sqrt(2) / 2 * controller.joystickRange.radius);
			}
			else return;
			controller.controlling = true;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: dstX, y: dstY}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = dstX;
			controller.joystickCurPos.y = dstY;
			controller.stage.update();
		}
		else if (event.keyCode == 39) {
			var dstX = controller.joystickIniPos.x;
			var dstY = controller.joystickIniPos.y;
			if (multiControl == 0) {
				multiControl = 3;
				dstX = (controller.joystickIniPos.x + controller.joystickRange.radius);
			}
			else if (multiControl == 2) {
				multiControl = 7;
				dstX = (controller.joystickIniPos.x + Math.sqrt(2) / 2 * controller.joystickRange.radius);
				dstY = (controller.joystickIniPos.y - Math.sqrt(2) / 2 * controller.joystickRange.radius);
			}
			else if (multiControl == 4) {
				multiControl = 8;
				dstX = (controller.joystickIniPos.x + Math.sqrt(2) / 2 * controller.joystickRange.radius);
				dstY = (controller.joystickIniPos.y + Math.sqrt(2) / 2 * controller.joystickRange.radius);
			}
			else return;
			controller.controlling = true;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: dstX, y: dstY}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = dstX;
			controller.joystickCurPos.y = dstY;
			controller.stage.update();
		}
		else if (event.keyCode == 40) {
			var dstX = controller.joystickIniPos.x;
			var dstY = controller.joystickIniPos.y;
			if (multiControl == 0) {
				multiControl = 4;
				dstY = (controller.joystickIniPos.y + controller.joystickRange.radius);
			}
			else if (multiControl == 1) {
				multiControl = 6;
				dstX = (controller.joystickIniPos.x - Math.sqrt(2) / 2 * controller.joystickRange.radius);
				dstY = (controller.joystickIniPos.y + Math.sqrt(2) / 2 * controller.joystickRange.radius);
			}
			else if (multiControl == 3) {
				multiControl = 8;
				dstX = (controller.joystickIniPos.x + Math.sqrt(2) / 2 * controller.joystickRange.radius);
				dstY = (controller.joystickIniPos.y + Math.sqrt(2) / 2 * controller.joystickRange.radius);
			}
			else return;
			controller.controlling = true;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: dstX, y: dstY}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = dstX;
			controller.joystickCurPos.y = dstY;
			controller.stage.update();
		}
	};
	
	document.onkeyup = function(event) {
		if (event.keyCode == 37) {
			var dstX = controller.joystickIniPos.x;
			var dstY = controller.joystickIniPos.y;
			if (multiControl == 1) {
				multiControl = 0;
				controller.controlling = false;
				controller.planeResetSpeed();
			}
			else if (multiControl == 5) {
				multiControl = 2;
				dstY = (controller.joystickIniPos.y - controller.joystickRange.radius);
			}
			else if (multiControl == 6) {
				multiControl = 4;
				dstY = (controller.joystickIniPos.y + controller.joystickRange.radius);
			}
			else return;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: dstX, y: dstY}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = dstX;
			controller.joystickCurPos.y = dstY;
			controller.stage.update();
		}
		if (event.keyCode == 38) {
			var dstX = controller.joystickIniPos.x;
			var dstY = controller.joystickIniPos.y;
			if (multiControl == 2) {
				multiControl = 0;
				controller.controlling = false;
				controller.planeResetSpeed();
			}
			else if (multiControl == 5) {
				multiControl = 1;
				dstX = (controller.joystickIniPos.x - controller.joystickRange.radius);
			}
			else if (multiControl == 7) {
				multiControl = 3;
				dstX = (controller.joystickIniPos.x + controller.joystickRange.radius);
			}
			else return;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: dstX, y: dstY}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = dstX;
			controller.joystickCurPos.y = dstY;
			controller.stage.update();
		}
		if (event.keyCode == 39) {
			var dstX = controller.joystickIniPos.x;
			var dstY = controller.joystickIniPos.y;
			if (multiControl == 3) {
				multiControl = 0;
				controller.controlling = false;
				controller.planeResetSpeed();
			}
			else if (multiControl == 7) {
				multiControl = 2;
				dstY = (controller.joystickIniPos.y - controller.joystickRange.radius);
			}
			else if (multiControl == 8) {
				multiControl = 4;
				dstY = (controller.joystickIniPos.y + controller.joystickRange.radius);
			}
			else return;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: dstX, y: dstY}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = dstX;
			controller.joystickCurPos.y = dstY;
			controller.stage.update();
		}
		if (event.keyCode == 40) {
			var dstX = controller.joystickIniPos.x;
			var dstY = controller.joystickIniPos.y;
			if (multiControl == 4) {
				multiControl = 0;
				controller.controlling = false;
				controller.planeResetSpeed();
			}
			else if (multiControl == 6) {
				multiControl = 1;
				dstX = (controller.joystickIniPos.x - controller.joystickRange.radius);
			}
			else if (multiControl == 8) {
				multiControl = 3;
				dstX = (controller.joystickIniPos.x + controller.joystickRange.radius);
			}
			else return;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: dstX, y: dstY}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = dstX;
			controller.joystickCurPos.y = dstY;
			controller.stage.update();
		}
	};
    var btnFire = document.getElementById('btn-fire');
    btnFire.addEventListener('click',function()
    {
        socket.emit('fire');
    })
});