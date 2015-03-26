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
		radius: 40
    };
    this.joystickRadius = 30;
    this.joystickDiff = 2;
    this.joystickAlpha = 0.4;

    this.defineRightSideButtons();
};

FF.Controller.prototype.planeControl = function() {
    var data = {
        offset_speed: (this.joystickIniPos.y - this.joystickCurPos.y),
        offset_angle: (this.joystickCurPos.x - this.joystickIniPos.x)
    }
    FF.socket.emit('control', data);
};

FF.Controller.prototype.planeResetSpeed = function() {
    FF.socket.emit('resetSpeed');
};

FF.Controller.prototype.speedUp = function() {
    var data = {
        offset_speed: 100,
        offset_angle: 0
    }
    FF.socket.emit('control', data);
}

FF.Controller.prototype.defineRightSideButtons = function() {
    Ladda.bind('.right-control button', {
        callback: function(instance) {
            var progress = 0;
            var interval = setInterval(function() {
                progress = Math.min(progress + 0.1, 1);
                instance.setProgress(progress);
                if (progress === 1) {
                    instance.stop();
                    clearInterval(interval);
                }
            }, 200);
        }
    });
}