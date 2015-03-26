FF.Controller = function() {
    'use strict';
    var self = this;
    this.stage = new createjs.Stage('move-control-canvas');
    createjs.Touch.enable(this.stage);
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

    this.defineJoystick();
    this.defineRightSideButtons();
    this.defineKeyEvent();
};

FF.Controller.prototype.planeControl = function() {
    'use strict';
    var data = {
        offset_speed: (this.joystickIniPos.y - this.joystickCurPos.y),
        offset_angle: (this.joystickCurPos.x - this.joystickIniPos.x)
    };
    FF.socket.emit('control', data);
};

FF.Controller.prototype.planeResetSpeed = function() {
    'use strict';
    FF.socket.emit('resetSpeed');
};

FF.Controller.prototype.speedUp = function() {
    'use strict';
    var data = {
        offset_speed: 100,
        offset_angle: 0
    };
    FF.socket.emit('control', data);
};

FF.Controller.prototype.defineJoystick = function() {
    'use strict';
    var controller = this;
    var joystick = new createjs.Shape();
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
        createjs.Ticker.addEventListener('tick', controller.stage);
    });

    this.joystick = joystick;
};

FF.Controller.prototype.defineRightSideButtons = function() {
    'use strict';
    Ladda.bind('.right-control button', {
        callback: function(instance) {
            var progress = 0;
            var interval = setInterval(function() {
                progress = Math.min(progress + 0.05, 1);
                instance.setProgress(progress);
                if (progress === 1) {
                    instance.stop();
                    clearInterval(interval);
                }
            }, 50);
        }
    });

    $('#btn-fire').on('click',function() {
        FF.socket.emit('fire');
    });
};

FF.Controller.prototype.defineKeyEvent = function() {
    'use strict';
    var controller = this;
    var joystick = this.joystick;
    var multiControl = 0; // 1: left, 2: up, 3: right, 4: down, 5: left-up, 6: left- down, 7: right-up, 8: right-down

    document.onkeydown = function(event) {
        var dstX,dstY;
        if (event.keyCode == 37) {
            dstX = controller.joystickIniPos.x;
            dstY = controller.joystickIniPos.y;
            if (multiControl === 0) {
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
            createjs.Ticker.addEventListener('tick', controller.stage);
            controller.joystickCurPos.x = dstX;
            controller.joystickCurPos.y = dstY;
            controller.stage.update();
        }
        else if (event.keyCode == 38) {
            dstX = controller.joystickIniPos.x;
            dstY = controller.joystickIniPos.y;
            if (multiControl === 0) {
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
            createjs.Ticker.addEventListener('tick', controller.stage);
            controller.joystickCurPos.x = dstX;
            controller.joystickCurPos.y = dstY;
            controller.stage.update();
        }
        else if (event.keyCode == 39) {
            dstX = controller.joystickIniPos.x;
            dstY = controller.joystickIniPos.y;
            if (multiControl === 0) {
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
            createjs.Ticker.addEventListener('tick', controller.stage);
            controller.joystickCurPos.x = dstX;
            controller.joystickCurPos.y = dstY;
            controller.stage.update();
        }
        else if (event.keyCode == 40) {
            dstX = controller.joystickIniPos.x;
            dstY = controller.joystickIniPos.y;
            if (multiControl === 0) {
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
            createjs.Ticker.addEventListener('tick', controller.stage);
            controller.joystickCurPos.x = dstX;
            controller.joystickCurPos.y = dstY;
            controller.stage.update();
        } else if (event.keyCode == 32) {
            var l = Ladda.create( document.querySelector('#btn-fire') );
            if(l.isLoading()===false){
                $('#btn-fire').click();
            }
        }
    };

    document.onkeyup = function(event) {
        var dstX, dstY;
        if (event.keyCode == 37) {
            dstX = controller.joystickIniPos.x;
            dstY = controller.joystickIniPos.y;
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
            createjs.Ticker.addEventListener('tick', controller.stage);
            controller.joystickCurPos.x = dstX;
            controller.joystickCurPos.y = dstY;
            controller.stage.update();
        }
        if (event.keyCode == 38) {
            dstX = controller.joystickIniPos.x;
            dstY = controller.joystickIniPos.y;
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
            createjs.Ticker.addEventListener('tick', controller.stage);
            controller.joystickCurPos.x = dstX;
            controller.joystickCurPos.y = dstY;
            controller.stage.update();
        }
        if (event.keyCode == 39) {
            dstX = controller.joystickIniPos.x;
            dstY = controller.joystickIniPos.y;
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
            createjs.Ticker.addEventListener('tick', controller.stage);
            controller.joystickCurPos.x = dstX;
            controller.joystickCurPos.y = dstY;
            controller.stage.update();
        }
        if (event.keyCode == 40) {
            dstX = controller.joystickIniPos.x;
            dstY = controller.joystickIniPos.y;
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
            createjs.Ticker.addEventListener('tick', controller.stage);
            controller.joystickCurPos.x = dstX;
            controller.joystickCurPos.y = dstY;
            controller.stage.update();
        }
    };
};