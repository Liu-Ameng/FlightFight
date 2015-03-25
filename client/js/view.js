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
    createjs.Touch.enable(this.stage);
};

FF.View.prototype.paint = function(res) {
    for (var i = 0; i < res.length; ++i) {
        this.updateFlyObj(res[i]);
    }
    this.stage.update();
    if (FF.controller.controlling) {
        FF.controller.planeControl();
    }
};

FF.View.prototype.remove = function(res) {
    for (var i = this.allFlyObjs.length - 1; i >= 0; --i) {
        if (this.allFlyObjs[i].id === res) {
            //因为子弹和其所属飞机的id是一样的，这一步就可以同时删除飞机和子弹
            this.stage.removeChild(this.allFlyObjs[i]);
            this.allFlyObjs.splice(i, 1);
        }
    }
    this.stage.update();
};

FF.View.prototype.updateFlyObj = function(resObj) {
    var i, flyObj;
    for (i = 0; i < this.allFlyObjs.length; ++i) {
        flyObj = this.allFlyObjs[i];
        if (flyObj.id === resObj.id && flyObj.type === resObj.type) {
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
    if (self.allFlyNames[resObj.id] === undefined) {
        self.allFlyNames[resObj.id] = 1;
    } else {
        flag = false;
    }
    if (flag) {
        if (resObj.type === 'f') {
            var img = new Image();
            if (resObj.id === FF.playerId) {
                img.src = '../img/my-flight.png';
            } else {
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
                f.id = resObj.id;
                f.name = resObj.name;
                f.type = resObj.type;
                self.stage.addChild(f);
                self.allFlyObjs.push(f);
            };
        }
    }
};