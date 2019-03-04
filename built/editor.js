var Editor = /** @class */ (function () {
    function Editor(editorEl) {
        this.mouseIsDown = false;
        this.wallTexuresSrc = [];
        this.wallTextures = [];
        this.spritesSrc = [];
        this.sprites = [];
        // false wall, true sprite
        this.wallOrSprite = false;
        this.fillBlock = true;
        this.insPlayer = false;
        this.editorEl = editorEl;
        this.canvas = editorEl.getElementsByTagName("canvas")[0];
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        // Texture walls
        for (var i = 0; i <= 55; i++) {
            this.wallTexuresSrc[i] = "res/walls/" + (i + 2) + ".png";
        }
        // Texture sprites
        for (var i = 0; i <= 37; i++) {
            this.spritesSrc[i] = "res/sprites/misc/" + i + ".png";
        }
        // Blocchi e Sprite speciali
        this.loadTexure(new Door1Texture({}, 0, 0));
        this.loadTexure(new Door2Texture({}, 0, 0));
        this.loadWallTextures();
        this.loadSprite(new GuardSprite({}));
        this.loadSprite(new SSSprite({}));
        this.loadSprite(new HSprite({}));
        this.loadSprites();
        this.selectFirstSprite();
    }
    Editor.prototype.initEditor = function () {
        this.map = new RayMap({
            width: 30,
            height: 30
        });
        this.map.initMap();
        this.canvas.width = window.innerHeight;
        this.canvas.height = window.innerHeight;
        this.drawBackground();
        this.gridW = this.map.width;
        this.gridH = this.map.height;
        this.drawBlocks();
        this.drawGrid();
        this.fill();
        this.blocksTab();
        this.loadMapsOptions();
        this.startClickListener();
    };
    Editor.prototype.drawBackground = function () {
        this.ctx.save();
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    };
    Editor.prototype.drawGrid = function () {
        this.ctx.save();
        this.ctx.strokeStyle = "#1C1C1C";
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        // il canvas è quadrato
        var spacing = this.canvas.height / this.gridH;
        for (var i = 0; i < this.gridW; i++) {
            for (var j = 0; j < this.gridH; j++) {
                this.ctx.moveTo(j * spacing, 0);
                this.ctx.lineTo(j * spacing, this.canvas.height);
            }
            this.ctx.moveTo(0, i * spacing);
            this.ctx.lineTo(this.canvas.height, i * spacing);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    };
    Editor.prototype.drawBlocks = function () {
        this.ctx.save();
        // il canvas è quadrato
        var spacing = this.canvas.height / this.gridH;
        for (var i = 0; i < this.gridW; i++) {
            for (var j = 0; j < this.gridH; j++) {
                var wallNum = this.map.get(i, j);
                if (wallNum > 0 && this.map.wallTextures[wallNum - 1] != undefined) {
                    this.ctx.drawImage(this.map.wallTextures[wallNum - 1].img, i * spacing, j * spacing, spacing, spacing);
                }
                else if (wallNum <= 0) {
                    this.ctx.fillStyle = "#000000";
                    this.ctx.fillRect(i * spacing, j * spacing, spacing, spacing);
                }
            }
        }
        // draw sprites
        for (var i = 0; i < this.map.sprites.length; i++) {
            this.ctx.drawImage(this.map.sprites[i].img, (this.map.sprites[i].position.x) * spacing, (this.map.sprites[i].position.y) * spacing, spacing, spacing);
        }
        // draw player
        if (this.map.player.position.x >= 0 && this.map.player.position.y >= 0)
            this.ctx.drawImage(this.map.player.img, (this.map.player.position.x) * spacing, (this.map.player.position.y) * spacing, spacing, spacing);
        console.log(this.map.player);
        this.ctx.restore();
    };
    Editor.prototype.loadWallTextures = function () {
        var _this = this;
        var walls = document.getElementById("walls");
        var _loop_1 = function (i) {
            //console.log(this.wallTexuresSrc[i]);
            var img = new Image();
            img.src = this_1.wallTexuresSrc[i];
            // Carico la texture
            var texture;
            img.onload = function () {
                texture = new Texture({
                    src: img.src
                });
                _this.wallTextures.push(texture);
                if (i == 0) {
                    _this.selectedTexture = texture;
                }
            };
            // Seleziono il primo elemento
            if (i == 0) {
                img.style.borderStyle = "solid";
                img.style.borderWidth = "2px";
                img.style.borderColor = "#FAFAFA";
            }
            img.onclick = function (e) {
                var images = Array.prototype.slice.call(walls.getElementsByTagName("img"));
                images.map(function (x) {
                    x.style.borderWidth = "0px";
                    return x;
                });
                img.style.borderStyle = "solid";
                img.style.borderWidth = "2px";
                img.style.borderColor = "#FAFAFA";
                // Cambio la texture
                _this.selectedTexture = texture;
            };
            walls.appendChild(img);
        };
        var this_1 = this;
        for (var i = 0; i < this.wallTexuresSrc.length; i++) {
            _loop_1(i);
        }
    };
    Editor.prototype.loadTexure = function (t) {
        var _this = this;
        var walls = document.getElementById("walls");
        this.wallTextures.push(t);
        var img = new Image();
        img = t.img;
        img.onclick = function (e) {
            var images = Array.prototype.slice.call(walls.getElementsByTagName("img"));
            images.map(function (x) {
                x.style.borderWidth = "0px";
                return x;
            });
            img.style.borderStyle = "solid";
            img.style.borderWidth = "2px";
            img.style.borderColor = "#FAFAFA";
            _this.selectedTexture = t;
        };
        walls.appendChild(img);
    };
    Editor.prototype.selectFirstSprite = function () {
        var sprites = document.getElementById("sprites");
        var images = Array.prototype.slice.call(sprites.getElementsByTagName("img"));
        images.map(function (x) {
            x.style.borderWidth = "0px";
            return x;
        });
        images[0].style.borderStyle = "solid";
        images[0].style.borderWidth = "2px";
        images[0].style.borderColor = "#FAFAFA";
    };
    Editor.prototype.loadSprites = function () {
        for (var i = 0; i < this.spritesSrc.length; i++) {
            var sprite = new Sprite({ src: this.spritesSrc[i] });
            this.loadSprite(sprite);
        }
        this.selectedSprite = this.sprites[0];
    };
    Editor.prototype.loadSprite = function (s) {
        var _this = this;
        var sprites = document.getElementById("sprites");
        this.sprites.push(s);
        var img = new Image();
        img = s.img;
        img.onclick = function (e) {
            var images = Array.prototype.slice.call(sprites.getElementsByTagName("img"));
            images.map(function (x) {
                x.style.borderWidth = "0px";
                return x;
            });
            img.style.borderStyle = "solid";
            img.style.borderWidth = "2px";
            img.style.borderColor = "#FAFAFA";
            _this.selectedSprite = s;
            console.log(s);
        };
        sprites.appendChild(img);
    };
    Editor.prototype.loadMapsOptions = function () {
        var container1 = document.getElementById("selectLoad");
        var container2 = document.getElementById("selectDelete");
        container1.innerHTML = "";
        container2.innerHTML = "";
        var obj = localStorage.getItem('levels');
        if (obj != undefined) {
            var array = JSON.parse(obj);
            for (var i = 0; i < array.length; i++) {
                var option1 = new Option();
                var option2 = new Option();
                option1.text = array[i].name;
                option1.value = array[i].name;
                option2.text = array[i].name;
                option2.value = array[i].name;
                container1.appendChild(option1);
                container2.appendChild(option2);
            }
        }
    };
    Editor.prototype.loadMap = function (mapName) {
        var obj = localStorage.getItem('levels');
        if (obj != undefined) {
            var array = JSON.parse(obj);
            for (var i = 0; i < array.length; i++) {
                if (array[i].name == mapName) {
                    this.map = Object.assign(new RayMap({}), array[i]);
                    this.map.loadPlayer();
                    this.map.loadSprites();
                    this.map.loadTextures();
                    this.drawBlocks();
                    this.drawGrid();
                    return;
                }
            }
        }
    };
    Editor.prototype.deleteMap = function (mapName) {
        var obj = localStorage.getItem('levels');
        if (obj != undefined) {
            var array = JSON.parse(obj);
            for (var i = 0; i < array.length; i++) {
                if (array[i].name == mapName) {
                    array.splice(i, 1);
                    localStorage.setItem('levels', JSON.stringify(array));
                    this.loadMapsOptions();
                    return;
                }
            }
        }
    };
    Editor.prototype.loadSelectedMap = function () {
        var container = document.getElementById("selectLoad");
        var option = container[container.selectedIndex];
        this.loadMap(option.value);
    };
    Editor.prototype.deleteSelectedMap = function () {
        var container = document.getElementById("selectDelete");
        var option = container[container.selectedIndex];
        if (option != undefined)
            this.deleteMap(option.value);
        else
            alert("Impossibile eliminare la mappa!");
    };
    Editor.prototype.saveChanges = function () {
        this.map.name = document.getElementById("mapName1").value;
        this.map.skyColor = document.getElementById("sky").value;
        this.map.floorColor = document.getElementById("floor").value;
        if (this.map.name == "") {
            alert("Inserire un nome  valido");
            return;
        }
        if (!this.map.isSavedOnLocalStorage(this.map.name)) {
            this.map.saveOnLocalStorage();
            this.loadMapsOptions();
            alert("Mappa salvata con successo");
        }
        else {
            alert("Nome esistente!");
        }
        console.log(localStorage.getItem("level"));
    };
    /**
     * Ritorna il colore predominante
     * @param img Elemento img
     */
    Editor.prototype.getAverageRGB = function (img) {
        var context = document.createElement('canvas').getContext('2d');
        context.imageSmoothingEnabled = true;
        context.drawImage(img, 0, 0, 2, 2);
        return context.getImageData(1, 1, 1, 1).data.slice(0, 3);
    };
    Editor.prototype.startClickListener = function () {
        var container = document.getElementById("editor");
        this.canvas.onmousedown = this.mouseDown.bind(this);
        this.canvas.onmousemove = this.mouseMove.bind(this);
        container.onmouseup = this.mouseUp.bind(this);
        document.getElementById("wallsBtn").onclick = this.blocksTab.bind(this);
        document.getElementById("spritesBtn").onclick = this.spritesTab.bind(this);
        document.getElementById("fill").onclick = this.fill.bind(this);
        document.getElementById("delete").onclick = this.erase.bind(this);
        document.getElementById("player").onclick = this.insertPlayer.bind(this);
        document.getElementById("save").onclick = this.saveChanges.bind(this);
        document.getElementById("load").onclick = this.loadSelectedMap.bind(this);
        document.getElementById("deleteMap").onclick = this.deleteSelectedMap.bind(this);
        document.getElementById("new").onclick = this.show.bind(this);
        document.getElementById("exit").onclick = this.exitEditor.bind(this);
    };
    Editor.prototype.blocksTab = function () {
        document.getElementById("wallsBtn").className = "tab buttonSelected";
        document.getElementById("spritesBtn").className = "tab";
        document.getElementById("walls").style.display = "block";
        document.getElementById("sprites").style.display = "none";
        this.wallOrSprite = false;
    };
    Editor.prototype.spritesTab = function () {
        document.getElementById("wallsBtn").className = "tab";
        document.getElementById("spritesBtn").className = "tab buttonSelected";
        document.getElementById("walls").style.display = "none";
        document.getElementById("sprites").style.display = "block";
        this.wallOrSprite = true;
    };
    Editor.prototype.fill = function () {
        this.fillBlock = true;
        this.insPlayer = false;
        document.getElementById("player").className = "Button";
        document.getElementById("fill").className = "Button buttonSelected";
        document.getElementById("delete").className = "Button ";
    };
    Editor.prototype.erase = function () {
        this.fillBlock = false;
        this.insPlayer = false;
        document.getElementById("player").className = "Button";
        document.getElementById("fill").className = "Button ";
        document.getElementById("delete").className = "Button buttonSelected";
    };
    Editor.prototype.insertPlayer = function () {
        this.fillBlock = true;
        this.insPlayer = true;
        document.getElementById("player").className = "Button buttonSelected";
        document.getElementById("fill").className = "Button ";
        document.getElementById("delete").className = "Button ";
    };
    Editor.prototype.mouseDown = function (e) {
        this.mouseIsDown = true;
        var x = e.offsetX;
        var y = e.offsetY;
        var spacing = this.canvas.height / this.gridH;
        var gridX = Math.floor(x / spacing);
        var gridY = Math.floor(y / spacing);
        if (!this.fillBlock) {
            this.map.set(gridX, gridY, 0);
            this.map.removeTexture(gridX, gridY);
            this.map.removeSprite(gridX, gridY);
            this.drawBlocks();
            this.drawGrid();
            return;
        }
        if (this.map.get(gridX, gridY) > 0 || this.map.getSprite(gridX, gridY) ||
            (this.map.player.position.x == gridX && this.map.player.position.y == gridY))
            return;
        if (this.insPlayer) {
            this.map.setPlayer(gridX, gridY);
            this.drawBlocks();
            this.drawGrid();
            return;
        }
        // Blocco selezionato
        if (!this.wallOrSprite) {
            var isIN = -1;
            for (var i = 0; i < this.map.wallTextures.length; i++) {
                if (this.selectedTexture.img.src === this.map.wallTextures[i].src) {
                    isIN = i;
                    break;
                }
            }
            // è già salvata la texture e non è una porta
            if (isIN >= 0 && !this.map.isDoor(this.selectedTexture)) {
                this.map.set(gridX, gridY, isIN + 1);
            }
            else { // la devo salvare
                console.log(this.selectedTexture);
                this.map.set(gridX, gridY, this.map.wallTextures.length + 1);
                var texture = this.map.copyTexture(this.selectedTexture);
                if (this.map.isDoor(texture))
                    texture.setPosition(gridX, gridY);
                this.map.wallTextures.push(texture);
            }
        }
        else { // Sprite selezionato
            if (!this.map.getSprite(gridX, gridY)) {
                var copy = this.map.copySprite(this.selectedSprite);
                copy.setPosition(gridX, gridY);
                this.map.sprites.push(copy);
            }
        }
        this.drawBlocks();
        this.drawGrid();
    };
    Editor.prototype.mouseMove = function (e) {
        if (this.mouseIsDown == false)
            return;
        this.mouseDown(e);
    };
    Editor.prototype.mouseUp = function (e) {
        this.mouseIsDown = false;
    };
    Editor.prototype.delete = function () {
        this.canvas.onmousedown = null;
        this.canvas.onmousemove = null;
        this.canvas.onmouseup = null;
        delete this.ctx;
        delete this.canvas;
    };
    Editor.prototype.exitEditor = function () {
        Startup.menu.show();
        Startup.game.hide();
        Startup.editor.hide();
    };
    Editor.prototype.hide = function () {
        this.editorEl.className = "hide";
    };
    Editor.prototype.show = function () {
        this.initEditor();
        this.loadMapsOptions();
        this.editorEl.className = "";
    };
    return Editor;
}());
//# sourceMappingURL=editor.js.map