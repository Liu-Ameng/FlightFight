FF.Controller = function() {
	var self = this;
	this.stage = new createjs.Stage('move-control-canvas');
	this.controlling = false;
	this.joystickIniPos = {
		x: 80,
		y: 80
	};
	this.joystickCurPos = {
		x: 80,
		y: 80
	};
	this.joystickRange = {
		x: 40,
		y: 40,
	};
	this.joystickRadius = 20;
};

FF.Controller.prototype.planeControl = function() {
	var data = {
		offset_speed: (this.joystickIniPos.y - this.joystickCurPos.y),
		offset_angle: (this.joystickCurPos.x - this.joystickIniPos.x)
	}
	parent.socket.emit('control', data);
};

FF.Controller.prototype.planeResetSpeed = function() {
	parent.socket.emit('resetSpeed');
};

FF.Controller.prototype.speedUp = function() {
	var data = {
		offset_speed: 100,
		offset_angle: 0
	}
	parent.socket.emit('control', data);
}

