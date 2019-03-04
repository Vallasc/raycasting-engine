var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Player = /** @class */ (function () {
    function Player(options) {
        this.position = { x: -1, y: -1 };
        this.direction = Math.PI * 0.3;
        this.shooted = false;
        this.dead = false;
        this.score = 0;
        this.lives = 3;
        this.health = 100;
        if (options) {
            for (var prop in options)
                if (this.hasOwnProperty(prop))
                    this[prop] = options[prop];
        }
        this.img = new Image();
        this.img.src = "res/sprites/me/0.png";
        this.deadSound = new Audio("res/sounds/Player_Dies.wav");
        this.weaponManager = new WeaponManaager();
    }
    Player.prototype.rotate = function (angle, camera) {
        this.direction = (this.direction + angle + CIRCLE) % (CIRCLE);
        camera.direction = this.direction;
    };
    Player.prototype.walk = function (distance, map, camera) {
        var dx = Math.cos(this.direction) * distance;
        var dy = Math.sin(this.direction) * distance;
        if (map.get(this.position.x + dx, this.position.y) == 0)
            this.position.x += dx;
        if (map.get(this.position.x, this.position.y + dy) == 0)
            this.position.y += dy;
        camera.position.x = this.position.x;
        camera.position.y = this.position.y;
    };
    Player.prototype.update = function (controls, map, seconds, camera) {
        if (controls.left)
            this.rotate(-Math.PI * seconds, camera);
        if (controls.right)
            this.rotate(Math.PI * seconds, camera);
        if (controls.forward)
            this.walk(3 * seconds, map, camera);
        if (controls.backward)
            this.walk(-3 * seconds, map, camera);
        this.shooted = false;
        if (this.health <= 0) {
            this.dead = true;
            this.health = 100;
            this.lives--;
        }
    };
    return Player;
}());
var Sprite = /** @class */ (function () {
    function Sprite(options) {
        this.position = { x: 10, y: 10 };
        this.killed = true;
        this.type = "Sprite";
        this.distanceToPlayer = Infinity;
        if (options) {
            for (var prop in options)
                if (this.hasOwnProperty(prop))
                    this[prop] = options[prop];
            if (options.hasOwnProperty('src')) {
                this.img = new Image();
                this.img.src = options.src;
                this.src = options.src;
            }
        }
    }
    Sprite.prototype.load = function () {
        this.img = new Image();
        this.img.src = this.src;
    };
    Sprite.prototype.setPosition = function (x, y) {
        this.position.x = x;
        this.position.y = y;
    };
    Sprite.prototype.move = function (cam, map) {
    };
    Sprite.prototype.update = function (state, player, map) {
    };
    return Sprite;
}());
var Controls = /** @class */ (function () {
    function Controls() {
        this.codes = { 37: 'left', 39: 'right', 38: 'forward', 40: 'backward', 32: 'space' };
        this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false, 'space': false };
        this.mouse = { 'lastX': 0, 'offset': 0 };
        document.addEventListener('keydown', this.onKey.bind(this, true), false);
        document.addEventListener('keyup', this.onKey.bind(this, false), false);
        document.addEventListener('mousemove', this.onMove.bind(this), false);
    }
    Controls.prototype.onKey = function (val, e) {
        var state = this.codes[e.keyCode];
        if (typeof state === 'undefined')
            return;
        this.states[state] = val;
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
    };
    Controls.prototype.onMove = function (e) {
        this.mouse.offset += Math.abs(this.mouse.lastX - e.clientX);
    };
    return Controls;
}());
var GuardSprite = /** @class */ (function (_super) {
    __extends(GuardSprite, _super);
    function GuardSprite(options) {
        var _this = _super.call(this, options) || this;
        _this.deadImg = [];
        _this.deadCount = 0;
        _this.walkImg = [];
        _this.walkCount = 0;
        _this.type = "GuardSprite";
        _this.isTargeted = false;
        for (var i = 0; i < 4; i++) {
            _this.deadImg[i] = new Image();
            _this.deadImg[i].src = "res/sprites/mguard/1_" + i + ".png";
            _this.walkImg[i] = new Image();
            _this.walkImg[i].src = "res/sprites/mguard/0_" + i + ".png";
        }
        _this.fireImg = new Image();
        _this.fireImg.src = "res/sprites/mguard/2_1.png";
        _this.restImg = new Image();
        _this.restImg.src = "res/sprites/mguard/2_3.png";
        _this.gunSound = new Audio('res/sprites/mguard/gun.wav');
        _this.deathSound = new Audio('res/sprites/mguard/death.wav');
        _this.img = _this.restImg;
        _this.killed = false;
        _this.walking = false;
        _this.shooting = false;
        _this.minDistanceFire = 1.5;
        _this.minDistanceWalk = 4;
        return _this;
    }
    //@override chimata ad ogni frame
    GuardSprite.prototype.move = function (cam, map) {
        if (cam === undefined || map === undefined)
            return;
        if (this.killed)
            return;
        if (!this.walking)
            return;
        var prevX = this.position.x;
        var prevY = this.position.y;
        var xInc = this.position.x - cam.position.x;
        var yInc = this.position.y - cam.position.y;
        var Distance = Math.sqrt(xInc * xInc + yInc * yInc);
        var thetaTemp = Math.atan2(yInc, xInc);
        var cost = Math.abs(Math.cos(thetaTemp));
        var sent = Math.abs(Math.sin(thetaTemp));
        var wallFlag = 0;
        if (cam.position.x > this.position.x + 1)
            if (map.get(this.position.x + 1 / 40 * cost, this.position.y) == 0) {
                this.position.x += 1 / 40 * cost;
            }
            else {
                wallFlag++;
            }
        if (cam.position.x < this.position.x - 1)
            if (map.get(this.position.x - 1 / 40 * cost, this.position.y) == 0) {
                this.position.x -= 1 / 40 * cost;
            }
            else {
                wallFlag++;
            }
        if (cam.position.y > this.position.y + 1)
            if (map.get(this.position.x, this.position.y + 1 / 40 * sent) == 0) {
                this.position.y += 1 / 40 * sent;
            }
            else {
                wallFlag++;
            }
        if (cam.position.y < this.position.y - 1)
            if (map.get(this.position.x, this.position.y - 1 / 40 * sent) == 0) {
                this.position.y -= 1 / 40 * sent;
            }
            else {
                wallFlag++;
            }
        if (Distance < this.minDistanceFire && prevX == this.position.x
            && prevY == this.position.y && wallFlag == 0)
            this.shooting = true;
    };
    GuardSprite.prototype.update = function (state, player, map) {
        // Appena lo vedo si muove
        if (this.distanceToPlayer < this.minDistanceWalk && !this.killed && !this.walking) {
            this.walking = true;
            this.walk();
        }
        // sparo se sono vicino
        if (this.distanceToPlayer < this.minDistanceWalk && !this.killed && this.walking && this.shooting) {
            this.shooting = false;
            this.shoot();
            // 1/10 di probabilità
            if (Math.floor(Math.random() * 10) == 0) {
                player.health -= 1;
                player.shooted = true;
                // riproduce il suono pistola
                this.gunSound.pause();
                this.gunSound.currentTime = 0;
                this.gunSound.play();
            }
        }
        if (this.distanceToPlayer < player.weaponManager.getWeapon().range && this.isTargeted
            && player.weaponManager.getWeapon().firing && !this.killed) {
            this.killed = true;
            this.walking = false;
            this.dead();
            player.score++;
            // suono morte
            this.deathSound.play();
        }
    };
    // Animazione della morte
    GuardSprite.prototype.dead = function () {
        if (this.deadCount > 3)
            return;
        this.img = this.deadImg[this.deadCount];
        this.deadCount++;
        setTimeout(this.dead.bind(this), 200);
    };
    // Animazione della camminata
    GuardSprite.prototype.walk = function () {
        if (!this.walking)
            return;
        this.img = this.walkImg[this.walkCount];
        this.walkCount++;
        setTimeout(this.walk.bind(this), 300);
        if (this.walkCount > 3)
            this.walkCount = 0;
    };
    // Animazione dello sparo
    GuardSprite.prototype.shoot = function () {
        this.img = this.fireImg;
    };
    return GuardSprite;
}(Sprite));
var SSSprite = /** @class */ (function (_super) {
    __extends(SSSprite, _super);
    function SSSprite(options) {
        var _this = _super.call(this, options) || this;
        _this.deadImg = [];
        _this.deadCount = 0;
        _this.walkImg = [];
        _this.walkCount = 0;
        _this.type = "SSSprite";
        _this.isTargeted = false;
        for (var i = 0; i < 4; i++) {
            _this.deadImg[i] = new Image();
            _this.deadImg[i].src = "res/sprites/mSS/1_" + i + ".png";
            _this.walkImg[i] = new Image();
            _this.walkImg[i].src = "res/sprites/mSS/0_" + i + ".png";
        }
        _this.fireImg = new Image();
        _this.fireImg.src = "res/sprites/mSS/2_1.png";
        _this.restImg = new Image();
        _this.restImg.src = "res/sprites/mSS/2_0.png";
        _this.gunSound = new Audio('res/sprites/mSS/gun.wav');
        _this.deathSound = new Audio('res/sprites/mSS/death.wav');
        _this.img = _this.restImg;
        _this.killed = false;
        _this.walking = false;
        _this.shooting = false;
        _this.minDistanceFire = 1.5;
        _this.minDistanceWalk = 5;
        return _this;
    }
    //@override chimata ad ogni frame
    SSSprite.prototype.move = function (cam, map) {
        if (cam === undefined || map === undefined)
            return;
        if (this.killed)
            return;
        if (!this.walking)
            return;
        var prevX = this.position.x;
        var prevY = this.position.y;
        var xInc = this.position.x - cam.position.x;
        var yInc = this.position.y - cam.position.y;
        var Distance = Math.sqrt(xInc * xInc + yInc * yInc);
        var thetaTemp = Math.atan2(yInc, xInc);
        var cost = Math.abs(Math.cos(thetaTemp));
        var sent = Math.abs(Math.sin(thetaTemp));
        var wallFlag = 0;
        if (cam.position.x > this.position.x + 1)
            if (map.get(this.position.x + 1 / 40 * cost, this.position.y) == 0) {
                this.position.x += 1 / 40 * cost;
            }
            else {
                wallFlag++;
            }
        if (cam.position.x < this.position.x - 1)
            if (map.get(this.position.x - 1 / 40 * cost, this.position.y) == 0) {
                this.position.x -= 1 / 40 * cost;
            }
            else {
                wallFlag++;
            }
        if (cam.position.y > this.position.y + 1)
            if (map.get(this.position.x, this.position.y + 1 / 40 * sent) == 0) {
                this.position.y += 1 / 40 * sent;
            }
            else {
                wallFlag++;
            }
        if (cam.position.y < this.position.y - 1)
            if (map.get(this.position.x, this.position.y - 1 / 40 * sent) == 0) {
                this.position.y -= 1 / 40 * sent;
            }
            else {
                wallFlag++;
            }
        if (Distance < this.minDistanceFire && prevX == this.position.x
            && prevY == this.position.y && wallFlag == 0)
            this.shooting = true;
    };
    SSSprite.prototype.update = function (state, player, map) {
        // Appena lo vedo si muove
        if (this.distanceToPlayer < this.minDistanceWalk && !this.killed && !this.walking) {
            this.walking = true;
            this.walk();
        }
        // sparo se sono vicino
        if (this.distanceToPlayer < this.minDistanceWalk && !this.killed && this.walking && this.shooting) {
            this.shooting = false;
            this.shoot();
            // 1/10 di probabilità
            if (Math.floor(Math.random() * 10) == 0) {
                player.health -= 1;
                player.shooted = true;
                // riproduce il suono pistola
                this.gunSound.pause();
                this.gunSound.currentTime = 0;
                this.gunSound.play();
            }
        }
        if (this.distanceToPlayer < player.weaponManager.getWeapon().range && this.isTargeted
            && player.weaponManager.getWeapon().firing && !this.killed) {
            this.killed = true;
            this.walking = false;
            this.dead();
            player.score++;
            // suono morte
            this.deathSound.play();
        }
    };
    // Animazione della morte
    SSSprite.prototype.dead = function () {
        if (this.deadCount > 3)
            return;
        this.img = this.deadImg[this.deadCount];
        this.deadCount++;
        setTimeout(this.dead.bind(this), 200);
    };
    // Animazione della camminata
    SSSprite.prototype.walk = function () {
        if (!this.walking)
            return;
        this.img = this.walkImg[this.walkCount];
        this.walkCount++;
        setTimeout(this.walk.bind(this), 300);
        if (this.walkCount > 3)
            this.walkCount = 0;
    };
    // Animazione dello sparo
    SSSprite.prototype.shoot = function () {
        this.img = this.fireImg;
    };
    return SSSprite;
}(Sprite));
var HSprite = /** @class */ (function (_super) {
    __extends(HSprite, _super);
    function HSprite(options) {
        var _this = _super.call(this, options) || this;
        _this.deadImg = [];
        _this.deadCount = 0;
        _this.walkImg = [];
        _this.walkCount = 0;
        _this.type = "HSprite";
        _this.isTargeted = false;
        for (var i = 0; i < 4; i++) {
            _this.deadImg[i] = new Image();
            _this.deadImg[i].src = "res/sprites/mH/1_" + i + ".png";
            _this.walkImg[i] = new Image();
            _this.walkImg[i].src = "res/sprites/mH/0_" + i + ".png";
        }
        _this.fireImg = new Image();
        _this.fireImg.src = "res/sprites/mH/2_1.png";
        _this.restImg = new Image();
        _this.restImg.src = "res/sprites/mH/2_0.png";
        _this.gunSound = new Audio('res/sprites/mH/gun.wav');
        _this.deathSound = new Audio('res/sprites/mH/death.wav');
        _this.img = _this.restImg;
        _this.killed = false;
        _this.walking = false;
        _this.shooting = false;
        _this.minDistanceFire = 1.5;
        _this.minDistanceWalk = 6;
        return _this;
    }
    //@override chimata ad ogni frame
    HSprite.prototype.move = function (cam, map) {
        if (cam === undefined || map === undefined)
            return;
        if (this.killed)
            return;
        if (!this.walking)
            return;
        var prevX = this.position.x;
        var prevY = this.position.y;
        var xInc = this.position.x - cam.position.x;
        var yInc = this.position.y - cam.position.y;
        var Distance = Math.sqrt(xInc * xInc + yInc * yInc);
        var thetaTemp = Math.atan2(yInc, xInc);
        var cost = Math.abs(Math.cos(thetaTemp));
        var sent = Math.abs(Math.sin(thetaTemp));
        var wallFlag = 0;
        if (cam.position.x > this.position.x + 1)
            if (map.get(this.position.x + 1 / 40 * cost, this.position.y) == 0) {
                this.position.x += 1 / 40 * cost;
            }
            else {
                wallFlag++;
            }
        if (cam.position.x < this.position.x - 1)
            if (map.get(this.position.x - 1 / 40 * cost, this.position.y) == 0) {
                this.position.x -= 1 / 40 * cost;
            }
            else {
                wallFlag++;
            }
        if (cam.position.y > this.position.y + 1)
            if (map.get(this.position.x, this.position.y + 1 / 40 * sent) == 0) {
                this.position.y += 1 / 40 * sent;
            }
            else {
                wallFlag++;
            }
        if (cam.position.y < this.position.y - 1)
            if (map.get(this.position.x, this.position.y - 1 / 40 * sent) == 0) {
                this.position.y -= 1 / 40 * sent;
            }
            else {
                wallFlag++;
            }
        if (Distance < this.minDistanceFire && prevX == this.position.x
            && prevY == this.position.y && wallFlag == 0)
            this.shooting = true;
    };
    HSprite.prototype.update = function (state, player, map) {
        // Appena lo vedo si muove
        if (this.distanceToPlayer < this.minDistanceWalk && !this.killed && !this.walking) {
            this.walking = true;
            this.walk();
        }
        // sparo se sono vicino
        if (this.distanceToPlayer < this.minDistanceWalk && !this.killed && this.walking && this.shooting) {
            this.shooting = false;
            this.shoot();
            // 1/10 di probabilità
            if (Math.floor(Math.random() * 10) == 0) {
                player.health -= 1;
                player.shooted = true;
                // riproduce il suono pistola
                this.gunSound.pause();
                this.gunSound.currentTime = 0;
                this.gunSound.play();
            }
        }
        if (this.distanceToPlayer < player.weaponManager.getWeapon().range && this.isTargeted
            && player.weaponManager.getWeapon().firing && !this.killed) {
            this.killed = true;
            this.walking = false;
            this.dead();
            player.score++;
            // suono morte
            this.deathSound.play();
        }
    };
    // Animazione della morte
    HSprite.prototype.dead = function () {
        if (this.deadCount > 3)
            return;
        this.img = this.deadImg[this.deadCount];
        this.deadCount++;
        setTimeout(this.dead.bind(this), 200);
    };
    // Animazione della camminata
    HSprite.prototype.walk = function () {
        if (!this.walking)
            return;
        this.img = this.walkImg[this.walkCount];
        this.walkCount++;
        setTimeout(this.walk.bind(this), 300);
        if (this.walkCount > 3)
            this.walkCount = 0;
    };
    // Animazione dello sparo
    HSprite.prototype.shoot = function () {
        this.img = this.fireImg;
    };
    return HSprite;
}(Sprite));
var Weapon = /** @class */ (function () {
    function Weapon(imgSrc, audioSrc, ammo, range) {
        this.firing = false;
        this.img = [];
        for (var i = 0; i < 3; i++) {
            this.img[i] = new Image();
            this.img[i].src = imgSrc[i];
        }
        this.sound = new Audio(audioSrc);
        this.ammo = ammo;
        this.range = range;
    }
    Weapon.prototype.isPlaying = function () {
        return (this.sound.duration > 0 && !this.sound.paused);
    };
    Weapon.prototype.fire = function () {
        if (this.ammo > 0) {
            if (this.sound.currentTime == this.sound.duration)
                this.firing = false;
            if (!this.firing) {
                this.ammo--;
                this.firing = true;
            }
            this.sound.play();
            // simulo il rinculo
            if (this.sound.currentTime > this.sound.duration / 2) {
                return this.img[2];
            }
            else {
                return this.img[1];
            }
        }
        else {
            return this.img[2];
        }
    };
    Weapon.prototype.rest = function () {
        this.firing = false;
        if (this.sound.currentTime > this.sound.duration / 2) {
            this.sound.pause();
            this.sound.currentTime = 0;
        }
        return this.img[0];
    };
    return Weapon;
}());
var WeaponManaager = /** @class */ (function () {
    function WeaponManaager() {
        this.weapons = [];
        this.index = 0;
        this.weapons[0] = new Weapon(['res/weapons/1/1.png', 'res/weapons/1/2.png',
            'res/weapons/1/3.png'], 'res/weapons/1/MachineGun.wav', 50, 2);
        this.weapons[1] = new Weapon(['res/weapons/2/1.png', 'res/weapons/2/2.png',
            'res/weapons/2/3.png'], 'res/weapons/2/GatlingGun.wav', 100, 3);
        this.weapons[2] = new Weapon(['res/weapons/3/1.png', 'res/weapons/3/2.png',
            'res/weapons/3/3.png'], 'res/weapons/3/BossGun.wav', 150, 5);
        this.keyListener();
    }
    WeaponManaager.prototype.getWeapon = function () {
        return this.weapons[this.index];
    };
    WeaponManaager.prototype.paint = function (ctx, state) {
        var h = ctx.canvas.height;
        var w = ctx.canvas.width;
        var img_h = h / 1.6;
        var img_w = h / 1.6;
        if (state.states.space) {
            var img = this.weapons[this.index].fire();
            ctx.drawImage(img, (w - img_w) / 2, h - img_h, img_w, img_h);
        }
        else {
            var img = this.weapons[this.index].rest();
            ctx.drawImage(img, (w - img_w) / 2, h - img_h, img_w, img_h);
        }
    };
    WeaponManaager.prototype.keyListener = function () {
        var _this = this;
        document.getElementsByTagName("body")[0].onkeydown = function (e) {
            switch (e.keyCode) {
                case 49:
                    _this.index = 0;
                    break;
                case 50:
                    _this.index = 1;
                    break;
                case 51:
                    _this.index = 2;
                    break;
            }
        };
    };
    return WeaponManaager;
}());
//# sourceMappingURL=player.js.map