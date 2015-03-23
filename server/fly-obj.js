var util = require('util');

(function FlyOjbDefine() {

    var CONST = {
        stageSize: 700,
        flightSpeed: 2,
        bulletSpeed: 5,
        flightCrashRange: 8,
        bulletCrashRange: 2,
        flightImg: 'flight',
        bulletImg: 'bullet',
    };

    /*
     * class Velocity (speed)
     */
    function Velocity() {
        this.angle = 0; //point to X-aix
        this.speed = 0; //not moving
    }

    /*
     * class Point
     */
    function Point() {
        this.x = 0;
        this.y = 0;
    }

    Point.prototype.set = function(x, y) {
        this.x = x;
        this.y = y;
    };

    Point.prototype.move = function(velocity) {
        //caution: y的方向与笛卡尔坐标系是相反的
        this.x += velocity.speed * Math.cos(velocity.angle);
        this.y += velocity.speed * Math.cos(velocity.angle);
    };

    function getDistanceSquar(p1, p2) {
        if (p1 instanceof Point && p2 instanceof Point) {
            return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
        }
        return undefined;
    }

    /*
     * class FlyObj
     */
    function FlyObj() {
        var self = this;
        this.name = '';
        this.type = '';
        this.p = new Point(); //position
        this.v = new Velocity(); //speed
        this.img = '';
        this.crashCheckRange = 0;
        this.owner = undefined;
        this.init = function(data) {
            for (var key in data) {
                this.key = data[key];
            }
        };
    }

    FlyObj.prototype.toJson = function() {
        var data = {
            x: this.p.x,
            y: this.p.y,
            angle: this.v.angle,
            type: this.type,
            name: this.name
        };
        return data;
    };

    FlyObj.prototype.isCrash = function(other) {
        if (other instanceof FlyObj) {
            return getDistanceSquar(this.p, other.p) < this.crashCheckRange + other.crashCheckRange;
        }
        return undefined;
    };

    FlyObj.prototype.move = function() {
        this.p.move(this.v);
        if (this.isOutOfRange() === true) {
            return this.whenOutOfRange();
        }
        return false;
    };

    FlyObj.prototype.isOutOfRange = function() {
        if (this.p.x < 0 || this.p.x > CONST.stageSize ||
            this.p.y < 0 || this.p.y > CONST.stageSize) {
            return true;
        }
        return false;
    };

    //@interface
    FlyObj.prototype.whenOutOfRange = function() {
        return true;
    };

    /*
     * class Flight extends FlyObj
     */
    function Flight(owner) {
        Flight.super_.call(this);

        this.type = 'f';
        this.name = owner;
        this.v.speed = CONST.flightSpeed;
        this.v.angle = Math.random() * 2 * Math.PI;
        this.p.set(CONST.stageSize * Math.random(), CONST.stageSize * Math.random());
        this.owner = owner;
        this.img = CONST.flightImg;
        this.crashCheckRange = CONST.flightCrashRange;
    }
        //Flight.prototype.speedUp() {};

    //@override
    FlyObj.prototype.whenOutOfRange = function() {
        this.p.set(CONST.stageSize - this.p.x, CONST.stageSize - this.p.y);
        return false;
    };

    util.inherits(Flight, FlyObj);

    /*
     * class Flight extends FlyObj
     */
    function Bullet(flight) {
        Bullet.super_.call(this);

        this.v.speed = CONST.bulletSpeed;
        this.type = 'b';
        this.img = CONST.bulletImg;
        this.crashCheckRange = CONST.bulletCrashRange;
        if (flight instanceof Flight) {
            this.name = flight.name;
            this.owner = flight.owner;
            this.v.angle = flight.v.angle;
            this.p.set(flight.p.x, flight.p.y);
        }
    }
    util.inherits(Flight, FlyObj);

    module.exports.createFlight = function(id) {
        var f = new Flight(id);
        return f;
    };

    module.exports.fire = function(flight) {
    };

    module.exports.newPlayer = function() {
    };

}());