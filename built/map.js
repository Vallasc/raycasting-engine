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
var Texture = /** @class */ (function () {
    function Texture(options) {
        var _this = this;
        this.width = 0;
        this.height = 0;
        this.x = -1;
        this.y = -1;
        if (options) {
            for (var prop in options)
                if (this.hasOwnProperty(prop))
                    this[prop] = options[prop];
            if (options.hasOwnProperty('src')) {
                this.src = options.src;
                this.img = new Image();
                this.img.src = options.src;
                this.img.onload = function () {
                    _this.width = _this.img.naturalWidth;
                    _this.height = _this.img.naturalHeight;
                };
            }
        }
        this.type = "Wall";
    }
    Texture.prototype.update = function (cam, map) {
    };
    Texture.prototype.setPosition = function (x, y) {
        this.x = x;
        this.y = y;
    };
    return Texture;
}());
var Door1Texture = /** @class */ (function (_super) {
    __extends(Door1Texture, _super);
    function Door1Texture(options, x, y) {
        var _this = _super.call(this, options) || this;
        _this.imgs = [];
        _this.wallCode = 0;
        _this.openCount = 0;
        _this.isOpen = false;
        for (var i = 0; i <= 4; i++) {
            _this.imgs[i] = new Image();
            _this.imgs[i].src = "res/doors/0/" + i + ".png";
        }
        _this.imgs[0].onload = function () {
            _this.width = _this.img.naturalWidth;
            _this.height = _this.img.naturalHeight;
        };
        _this.img = _this.imgs[0];
        _this.sound = new Audio("res/doors/Door.wav");
        _this.sound.playbackRate = 1.5;
        _this.x = x;
        _this.y = y;
        _this.type = "door1";
        return _this;
    }
    Door1Texture.prototype.update = function (cam, map) {
        var xInc = cam.position.x - this.x;
        var yInc = cam.position.y - this.y;
        var distanceToPlayer = Math.sqrt(xInc * xInc + yInc * yInc);
        if (distanceToPlayer < 1.5 && !this.isOpen && this.openCount == 0) {
            this.map = map;
            this.wallCode = this.map.get(this.x, this.y);
            this.open();
            this.sound.play();
        }
        if (distanceToPlayer >= 2 && this.isOpen && this.openCount == 0) {
            this.close();
            this.sound.play();
        }
    };
    // Animazione apertura
    Door1Texture.prototype.open = function () {
        if (this.openCount > 4) {
            this.wallCode = this.map.set(this.x, this.y, 0);
            this.isOpen = true;
            this.openCount = 0;
            return;
        }
        this.img = this.imgs[this.openCount];
        this.openCount++;
        setTimeout(this.open.bind(this), 50);
    };
    // Animazione chiusura
    Door1Texture.prototype.close = function () {
        if (this.openCount > 4) {
            this.isOpen = false;
            this.openCount = 0;
            return;
        }
        this.map.set(this.x, this.y, this.wallCode);
        this.img = this.imgs[4 - this.openCount];
        this.openCount++;
        setTimeout(this.close.bind(this), 50);
    };
    return Door1Texture;
}(Texture));
var Door2Texture = /** @class */ (function (_super) {
    __extends(Door2Texture, _super);
    function Door2Texture(options, x, y) {
        var _this = _super.call(this, options) || this;
        _this.imgs = [];
        _this.wallCode = 0;
        _this.openCount = 0;
        _this.isOpen = false;
        for (var i = 0; i <= 4; i++) {
            _this.imgs[i] = new Image();
            _this.imgs[i].src = "res/doors/1/" + i + ".png";
        }
        _this.imgs[0].onload = function () {
            _this.width = _this.img.naturalWidth;
            _this.height = _this.img.naturalHeight;
        };
        _this.img = _this.imgs[0];
        _this.sound = new Audio("res/doors/Door.wav");
        _this.sound.playbackRate = 1.5;
        _this.x = x;
        _this.y = y;
        _this.type = "door2";
        return _this;
    }
    Door2Texture.prototype.update = function (cam, map) {
        var xInc = cam.position.x - this.x;
        var yInc = cam.position.y - this.y;
        var distanceToPlayer = Math.sqrt(xInc * xInc + yInc * yInc);
        if (distanceToPlayer < 1.5 && !this.isOpen && this.openCount == 0) {
            this.map = map;
            this.wallCode = this.map.get(this.x, this.y);
            this.open();
            this.sound.play();
        }
        if (distanceToPlayer >= 2 && this.isOpen && this.openCount == 0) {
            this.close();
            this.sound.play();
        }
    };
    // Animazione apertura
    Door2Texture.prototype.open = function () {
        if (this.openCount > 4) {
            this.wallCode = this.map.set(this.x, this.y, 0);
            this.isOpen = true;
            this.openCount = 0;
            return;
        }
        this.img = this.imgs[this.openCount];
        this.openCount++;
        setTimeout(this.open.bind(this), 50);
    };
    // Animazione chiusura
    Door2Texture.prototype.close = function () {
        if (this.openCount > 4) {
            this.isOpen = false;
            this.openCount = 0;
            return;
        }
        this.map.set(this.x, this.y, this.wallCode);
        this.img = this.imgs[4 - this.openCount];
        this.openCount++;
        setTimeout(this.close.bind(this), 50);
    };
    return Door2Texture;
}(Texture));
var RayMap = /** @class */ (function () {
    function RayMap(options) {
        this.walls = [];
        this.sprites = [];
        this.light = 2;
        this.skyBox = undefined; // img sky
        this.width = 0;
        this.height = 0;
        this.outdoors = false;
        this.wallTextures = [];
        if (options) {
            for (var prop in options)
                if (this.hasOwnProperty(prop))
                    this[prop] = options[prop];
        }
        this.player = new Player({ position: { x: -1, y: -1 } });
        this.name = Math.floor((Math.random() * 100000) + 1) + " ";
    }
    RayMap.prototype.get = function (x, y) {
        x = x | 0;
        y = y | 0;
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return -1;
        return this.walls[y * this.width + x];
    };
    RayMap.prototype.getSprite = function (x, y) {
        for (var i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i].position.x == x && this.sprites[i].position.y == y)
                return true;
        }
        return false;
    };
    RayMap.prototype.threisDoor = function (x, y) {
        for (var i = 0; i < this.wallTextures.length; i++) {
            if (this.wallTextures[i].x == x && this.wallTextures[i].y == y && this.isDoor(this.wallTextures[i]))
                return true;
        }
        return false;
    };
    RayMap.prototype.loadPlayer = function () {
        this.player = new Player({ position: { x: this.player.position.x, y: this.player.position.y } });
        return this.player;
    };
    RayMap.prototype.removeSprite = function (x, y) {
        for (var i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i].position.x == x && this.sprites[i].position.y == y) {
                this.sprites.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    RayMap.prototype.removeTexture = function (x, y) {
        for (var i = 0; i < this.wallTextures.length; i++) {
            if (this.wallTextures[i].x == x && this.wallTextures[i].y == y) {
                this.wallTextures.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    RayMap.prototype.set = function (x, y, num) {
        x = x | 0;
        y = y | 0;
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return -1;
        var prec = this.walls[y * this.width + x];
        this.walls[y * this.width + x] = num;
        return prec;
    };
    RayMap.prototype.setPlayer = function (x, y) {
        this.player = new Player({});
        this.player.position = { x: x, y: y };
    };
    RayMap.prototype.initMap = function () {
        for (var i = 0; i < this.width; i++)
            for (var j = 0; j < this.height; j++)
                if (i == 0 || j == 0 || i == this.width - 1 || j == this.height - 1)
                    this.set(i, j, -1);
                else
                    this.set(i, j, 0);
    };
    RayMap.prototype.raycast = function (point, angle, range, fullRange, layer) {
        if (fullRange === undefined)
            fullRange = false;
        if (!layer)
            layer = 'walls';
        var cells = [];
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);
        var stepX;
        var stepY;
        var nextStep = { x: point.x, y: point.y, cell: 0, distance: 0 };
        do {
            cells.push(nextStep);
            if (!fullRange && nextStep.cell > 0)
                break;
            stepX = this.step(sin, cos, nextStep.x, nextStep.y, false);
            stepY = this.step(cos, sin, nextStep.y, nextStep.x, true);
            nextStep = stepX.length2 < stepY.length2
                ? this.inspect(stepX, 1, 0, nextStep.distance, stepX.y, cos, sin, layer)
                : this.inspect(stepY, 0, 1, nextStep.distance, stepY.x, cos, sin, layer);
        } while (nextStep.distance <= range);
        return cells;
    };
    RayMap.prototype.step = function (rise, run, x, y, inverted) {
        if (run === 0)
            return {
                length2: Infinity
            };
        var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
        var dy = dx * rise / run;
        return {
            x: inverted ? y + dy : x + dx,
            y: inverted ? x + dx : y + dy,
            length2: dx * dx + dy * dy
        };
    };
    RayMap.prototype.inspect = function (step, shiftX, shiftY, distance, offset, cos, sin, layer) {
        var dx = cos < 0 ? shiftX : 0;
        var dy = sin < 0 ? shiftY : 0;
        var index = (((step.y - dy) | 0) * this.width) + ((step.x - dx) | 0);
        step.cell = (index < 0 || index >= this[layer].length) ? -1 : this[layer][index];
        step.distance = distance + Math.sqrt(step.length2);
        if (this.outdoors) {
            if (shiftX)
                step.shading = cos < 0 ? 2 : 0;
            else
                step.shading = sin < 0 ? 2 : 1;
        }
        else {
            step.shading = 0;
        }
        step.offset = offset - (offset | 0);
        return step;
    };
    RayMap.prototype.raycastSpite = function (camera, width, sprite) {
        // Try to render a sprite
        var xInc = sprite.position.x /*+ 0.5*/ - camera.position.x; // theSprites<i>.x = sprites x coordinate in game world, x = player's x coordinate in world
        var yInc = sprite.position.y + 0.5 - camera.position.y; // Same as above
        var Distance = Math.sqrt(xInc * xInc + yInc * yInc);
        var thetaTemp = Math.atan2(yInc, xInc); // Find angle between player and sprite
        thetaTemp *= 180 / Math.PI; // Convert to degrees	if (thetaTemp < 0) thetaTemp += 360;  // Make sure its in proper range
        //console.log(thetaTemp);
        if (thetaTemp < 0)
            thetaTemp += 360;
        // Wrap things around if needed
        // Angle  è in rad
        var angle = camera.direction * 180 / Math.PI;
        var fov = camera.fov * 180 / Math.PI;
        var yTmp = angle + fov / 2 - thetaTemp; // angle = angle of ray that generates leftmost collum of the screen
        //console.log(yTmp);
        if (thetaTemp > 270 && angle < 90)
            yTmp = angle + fov / 2 - thetaTemp + 360;
        if (angle > 270 && thetaTemp < 90)
            yTmp = angle + fov / 2 - thetaTemp - 360;
        // Compute the screen x coordinate
        var xTmp = yTmp * width / fov;
        //console.log(camera.direction);
        sprite.distanceToPlayer = Distance;
        return {
            screenX: width - xTmp,
            distance: Distance,
        };
    };
    RayMap.prototype.raycastSprites = function (camera, screen_width) {
        var res = [];
        for (var i = 0; i < this.sprites.length; i++) {
            var sprite = this.sprites[i];
            var val = this.raycastSpite(camera, screen_width, sprite);
            res.push({
                screenX: val.screenX,
                distance: val.distance,
                sprite: sprite
            });
        }
        return res;
    };
    RayMap.prototype.moveSprites = function (cam) {
        for (var i = 0; i < this.sprites.length; i++)
            this.sprites[i].move(cam, this);
    };
    RayMap.prototype.updateSprites = function (state, pl, map) {
        for (var i = 0; i < this.sprites.length; i++)
            this.sprites[i].update(state, pl, map);
    };
    RayMap.prototype.allSpritesDead = function () {
        for (var i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i].killed == false)
                return false;
        }
        return true;
    };
    RayMap.prototype.updateTextures = function (cam) {
        for (var i = 0; i < this.wallTextures.length; i++)
            this.wallTextures[i].update(cam, this);
    };
    RayMap.prototype.loadTextures = function () {
        for (var i = 0; i < this.wallTextures.length; i++) {
            this.wallTextures[i] = this.copyTexture(this.wallTextures[i]);
        }
    };
    RayMap.prototype.copyTexture = function (t) {
        var texture;
        switch (t.type) {
            case "Wall":
                texture = new Texture({
                    src: t.src
                });
                break;
            case "door1":
                {
                    texture = new Door1Texture({}, t.x, t.y);
                }
                break;
            case "door2":
                {
                    texture = new Door2Texture({}, t.x, t.y);
                }
                break;
        }
        return texture;
    };
    RayMap.prototype.isDoor = function (t) {
        switch (t.type) {
            case "door1":
            case "door2":
                return true;
        }
        return false;
    };
    RayMap.prototype.loadSprites = function () {
        for (var i = 0; i < this.sprites.length; i++) {
            this.sprites[i] = this.copySprite(this.sprites[i]);
        }
    };
    RayMap.prototype.copySprite = function (s) {
        var sprite;
        switch (s.type) {
            case "Sprite":
                sprite = new Sprite({
                    src: s.src,
                    position: { x: s.position.x, y: s.position.y }
                });
                break;
            case "GuardSprite":
                sprite = new GuardSprite({
                    position: { x: s.position.x, y: s.position.y }
                });
                break;
            case "SSSprite":
                sprite = new SSSprite({
                    position: { x: s.position.x, y: s.position.y }
                });
                break;
            case "HSprite":
                sprite = new HSprite({
                    position: { x: s.position.x, y: s.position.y }
                });
                break;
        }
        return sprite;
    };
    RayMap.prototype.saveOnLocalStorage = function () {
        if (this.player.position.x == -1)
            this.player = new Player({ position: { x: 2, y: 2 } });
        var obj = localStorage.getItem('levels');
        if (obj != undefined) {
            var array = JSON.parse(obj);
            array.push(this);
            localStorage.setItem('levels', JSON.stringify(array));
        }
        else {
            var array = new Array();
            array.push(this);
            localStorage.setItem('levels', JSON.stringify(array));
        }
    };
    RayMap.prototype.isSavedOnLocalStorage = function (mapName) {
        var obj = localStorage.getItem('levels');
        if (obj != undefined) {
            var array = JSON.parse(obj);
            for (var i = 0; i < array.length; i++)
                if (array[i].name == mapName)
                    return true;
        }
        return false;
    };
    return RayMap;
}());
//# sourceMappingURL=map.js.map