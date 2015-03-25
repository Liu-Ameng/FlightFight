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

    FF.controller = new FF.Controller();
	var controller = FF.controller;

    joystick = new createjs.Shape();
    joystick.graphics.beginFill('red').drawCircle(0, 0, controller.joystickRadius)
		.beginFill('white').drawCircle(0, 0, controller.joystickRadius)
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
		evt.currentTarget.x = evt.stageX;
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
		}
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
			if (multiControl != 0 && multiControl != 2 && multiControl != 4) return;
			controller.controlling = true;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: (controller.joystickIniPos.x - controller.joystickRange.x)}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = (controller.joystickIniPos.x - controller.joystickRange.x);
			if (multiControl == 2) {
				multiControl = 5;
			}
			else if (multiControl == 4) {
				multiControl = 6;
			}
			else {
				multiControl = 1;
			}
			controller.stage.update();
		}
		else if (event.keyCode == 38) {
			if (multiControl != 0 && multiControl != 1 && multiControl != 3) return;
			controller.controlling = true;
			createjs.Tween.get(joystick, {loop: false})
				.to({y: (controller.joystickIniPos.y - controller.joystickRange.y)}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.y = (controller.joystickIniPos.y - controller.joystickRange.y);
			if (multiControl == 1) {
				multiControl = 5;
			}
			else if (multiControl == 3) {
				multiControl = 7;
			}
			else {
				multiControl = 2;
			}
			controller.stage.update();
		}
		else if (event.keyCode == 39) {
			if (multiControl != 0 && multiControl != 2 && multiControl != 4) return;
			controller.controlling = true;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: (controller.joystickIniPos.x + controller.joystickRange.x)}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = (controller.joystickIniPos.x + controller.joystickRange.x);
			if (multiControl == 2) {
				multiControl = 7;
			}
			else if (multiControl == 4) {
				multiControl = 8;
			}
			else {
				multiControl = 3;
			}
			controller.stage.update();
		}
		else if (event.keyCode == 40) {
			if (multiControl != 0 && multiControl != 1 && multiControl != 3) return;
			controller.controlling = true;
			createjs.Tween.get(joystick, {loop: false})
				.to({y: (controller.joystickIniPos.y + controller.joystickRange.y)}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.y = (controller.joystickIniPos.y + controller.joystickRange.y);
			if (multiControl == 1) {
				multiControl = 6;
			}
			else if (multiControl == 3) {
				multiControl = 8;
			}
			else {
				multiControl = 4;
			}
			controller.stage.update();
		}
	};
	
	document.onkeyup = function(event) {
		if (event.keyCode == 37) {
			if (multiControl != 5 && multiControl != 6 && multiControl != 1) return;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: controller.joystickIniPos.x}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = controller.joystickIniPos.x;
			if (multiControl == 5) {
				multiControl = 2;
			}
			else if (multiControl == 6) {
				multiControl = 4;
			}
			else {
				multiControl = 0;
			}
			controller.stage.update();
			if (multiControl == 0) {
				controller.controlling = false;
			}
		}
		if (event.keyCode == 38) {
			if (multiControl != 5 && multiControl != 7 && multiControl != 2) return;
			createjs.Tween.get(joystick, {loop: false})
				.to({y: controller.joystickIniPos.y}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.y = controller.joystickIniPos.y;
			controller.planeResetSpeed();
			if (multiControl == 5) {
				multiControl = 1;
			}
			else if (multiControl == 7) {
				multiControl = 3;
			}
			else {
				multiControl = 0;
			}
			controller.stage.update();
			if (multiControl == 0) {
				controller.controlling = false;
			}
		}
		if (event.keyCode == 39) {
			if (multiControl != 7 && multiControl != 8 && multiControl != 3) return;
			createjs.Tween.get(joystick, {loop: false})
				.to({x: controller.joystickIniPos.x}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.x = controller.joystickIniPos.x;
			if (multiControl == 7) {
				multiControl = 2;
			}
			else if (multiControl == 8) {
				multiControl = 4;
			}
			else {
				multiControl = 0;
			}
			controller.stage.update();
			if (multiControl == 0) {
				controller.controlling = false;
			}
		}
		if (event.keyCode == 40) {
			if (multiControl != 6 && multiControl != 8 && multiControl != 4) return;
			createjs.Tween.get(joystick, {loop: false})
				.to({y: controller.joystickIniPos.y}, 
				500, createjs.Ease.getPowInOut(4));
			createjs.Ticker.setFPS(60);
			createjs.Ticker.addEventListener("tick", controller.stage);
			controller.joystickCurPos.y = controller.joystickIniPos.y;
			controller.planeResetSpeed();
			if (multiControl == 6) {
				multiControl = 1;
			}
			else if (multiControl == 8) {
				multiControl = 3;
			}
			else {
				multiControl = 0;
			}
			controller.stage.update();
			if (multiControl == 0) {
				controller.controlling = false;
			}
		}
	};
});