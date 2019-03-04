// The Camera
var RayCamera = /** @class */ (function () {
    function RayCamera(options) {
        this.fov = Math.PI * 0.4;
        this.range = 14;
        this.spriteRange = 14;
        this.lightRange = 5;
        this.position = { x: 0, y: 0 };
        this.direction = Math.PI * 0.5;
        if (options) {
            for (var prop in options)
                if (this.hasOwnProperty(prop))
                    this[prop] = options[prop];
        }
    }
    RayCamera.prototype.Rotate = function (angle) {
        this.direction = (this.direction + angle + CIRCLE) % (CIRCLE);
    };
    return RayCamera;
}());
// The Render Engine
var RaycastRenderer = /** @class */ (function () {
    function RaycastRenderer(options) {
        this.width = 600;
        this.height = 600;
        this.resolution = 320;
        this.textureSmoothing = false;
        this.domElement = document.createElement('canvas');
        this.skyColor = "#383838";
        this.floorColor = "#747474";
        if (options) {
            for (var prop in options)
                if (this.hasOwnProperty(prop))
                    this[prop] = options[prop];
        }
        this.domElement.width = this.width;
        this.domElement.height = this.height;
        this.ctx = this.domElement.getContext('2d');
        this.spacing = this.width / this.resolution;
    }
    RaycastRenderer.prototype.changeDim = function (width, height) {
        this.width = width;
        this.height = height;
        this.spacing = this.width / this.resolution;
    };
    RaycastRenderer.prototype.changeRes = function (res) {
        this.resolution = res;
        this.spacing = this.width / this.resolution;
    };
    RaycastRenderer.prototype.project = function (height, angle, distance) {
        var z = distance * Math.cos(angle);
        var wallHeight = this.height * height / z;
        var bottom = this.height / 2 * (1 + 1 / z);
        return {
            top: bottom - wallHeight,
            height: wallHeight
        };
    };
    RaycastRenderer.prototype.drawSky = function (camera, map) {
        if (map.skyBox && map.skyBox.img) {
            var width = this.width * (CIRCLE / camera.fov);
            var left = -width * camera.direction / CIRCLE;
            this.ctx.save();
            this.ctx.drawImage(map.skyBox.img, left, 0, width, this.height);
            if (left < width - this.width)
                this.ctx.drawImage(map.skyBox.img, left + width, 0, width, this.height);
            if (map.light > 0) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.globalAlpha = map.light * 0.1;
                this.ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);
            }
            this.ctx.restore();
        }
    };
    RaycastRenderer.prototype.drawSkyAndFloor = function () {
        this.ctx.save();
        this.ctx.fillStyle = this.skyColor;
        this.ctx.fillRect(0, 0, this.width, Math.ceil(this.height * 0.5));
        this.ctx.fillStyle = this.floorColor;
        this.ctx.fillRect(0, Math.floor(this.height * 0.5), this.width, Math.ceil(this.height * 0.5));
        this.ctx.restore();
    };
    RaycastRenderer.prototype.drawColumn = function (column, ray, angle, camera, textures) {
        var left = Math.floor(column * this.spacing);
        var width = Math.ceil(this.spacing);
        var texture;
        var textureX = 0;
        var step = ray;
        //muro fittizio
        if (step.cell == -1) {
            var wall_1 = this.project(1, angle, step.distance);
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(left, wall_1.top, width, wall_1.height);
            return;
        }
        texture = textures[step.cell > textures.length ? 0 : step.cell - 1];
        //console.log(step.cell);
        textureX = (texture.width * step.offset) | 0;
        var wall = this.project(1, angle, step.distance);
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(texture.img, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
        //this.ctx.drawImage(texture.img, textureX, 0, 1, texture.height, left, wall.top-wall.height, width, wall.height);
        //this.ctx.drawImage(texture.img, textureX, 0, 1, texture.height, left, wall.top-2*wall.height, width, wall.height);
        this.ctx.fillStyle = '#000000';
        this.ctx.globalAlpha = Math.max((step.distance + step.shading) / camera.lightRange, 0);
        this.textureSmoothing ?
            this.ctx.fillRect(left, wall.top, width, wall.height)
            : this.ctx.fillRect(left | 0, wall.top | 0, width, wall.height + 1);
    };
    RaycastRenderer.prototype.drawColumns = function (camera, map) {
        var repeat;
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = this.textureSmoothing;
        var rays = [];
        for (var col = 0; col < this.resolution; col++) {
            var angle = camera.fov * (col / this.resolution - 0.5);
            var ray = map.raycast(camera.position, camera.direction + angle, camera.range, false, "walls");
            var hit = -1;
            while (++hit < ray.length && ray[hit].cell == 0)
                ;
            if (hit < ray.length) {
                rays.push({ ray: ray[hit], col: col, angle: angle });
            }
        }
        // Sprite con le relative distanze dal giocatore
        var xsprite = map.raycastSprites(camera, this.width);
        // Devo ordinare in base alle distanze cosi posso disegnare alla giusta 
        // profondità gli sprite
        rays.sort(function (a, b) { return b.ray.distance - a.ray.distance; });
        var drx = camera.range;
        var dry = camera.range;
        if (rays[0] != undefined) {
            drx = Math.abs(camera.position.x - rays[0].ray.x) /*+ 0.5*/;
            dry = Math.abs(camera.position.y - rays[0].ray.y) + 0.5;
        }
        xsprite.sort(function (a, b) { return b.distance - a.distance; });
        var done = xsprite.length;
        var j = 0; // Scorro gli sprite
        // Disegno i raggi e gli sprite
        repeat = true;
        for (var i = 0; i < rays.length; i++) {
            // disegno le colonne dei muri
            if (repeat)
                this.drawColumn(rays[i].col, rays[i].ray, rays[i].angle, camera, map.wallTextures);
            // disegno gli sprites
            if ((j < done) && (rays[i].ray.distance <= xsprite[j].distance || i == rays.length - 1)) {
                // calcolo le proporzioni
                var h = this.project(1, 0, xsprite[j].distance);
                var dx = Math.abs(camera.position.x - xsprite[j].sprite.position.x);
                var dy = Math.abs(camera.position.y - xsprite[j].sprite.position.y);
                if ((dx < drx && dy < dry) &&
                    (xsprite[j].screenX > -h.height && xsprite[j].screenX < this.width + h.height) &&
                    (xsprite[j].distance < camera.spriteRange)) {
                    this.ctx.save();
                    this.ctx.globalAlpha = 1;
                    this.ctx.drawImage(xsprite[j].sprite.img, xsprite[j].screenX, this.height / 2 - h.height / 2, h.height, h.height);
                    this.ctx.restore();
                }
                else {
                    //xsprite[j].sprite.distanceToPlayer = Infinity;
                }
                // Lo sto mirando
                if (this.width / 2 - h.height * 0.8 < xsprite[j].screenX && xsprite[j].screenX < this.width / 2 - h.height * 0.2) {
                    xsprite[j].sprite.isTargeted = true;
                }
                else {
                    xsprite[j].sprite.isTargeted = false;
                }
                j++;
            }
            // Per stampare gli tutti gli sprite se siamo arrivati alla fine dell'array
            if (j < done && i == rays.length - 1) {
                i--;
                repeat = false;
            }
        }
        this.ctx.restore();
    };
    RaycastRenderer.prototype.Render = function (camera, map) {
        //this.drawSky(camera, map);
        this.drawSkyAndFloor();
        if (map.wallTextures.length > 0)
            this.drawColumns(camera, map);
    };
    return RaycastRenderer;
}());
//# sourceMappingURL=engine.js.map