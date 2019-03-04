var Menu = /** @class */ (function () {
    function Menu(menuEl, game, editor) {
        this.camera = {
            maxSpriteRange: 30,
            minSpriteRange: 4,
            spriteRange: 20,
            maxFov: 100,
            minFov: 30,
            fov: 70,
            maxRange: 30,
            minRange: 4,
            range: 20,
            maxLightRange: 30,
            minLightRange: 4,
            lightRange: 20,
            maxRes: 500,
            minRes: 100,
            res: 350
        };
        this.game = game;
        this.editor = editor;
        this.menu = menuEl;
        this.initMainMenu();
    }
    Menu.prototype.addButton = function (text, container, callback, selected) {
        if (selected === void 0) { selected = false; }
        var div = document.createElement("div");
        if (selected) {
            div.className = "menu-item selected";
        }
        else {
            div.className = "menu-item";
        }
        div.innerText = text;
        container.appendChild(div);
        div.onclick = function () {
            if (div.className === "menu-item selected") {
                callback();
                return;
            }
            var divs = container.getElementsByTagName("div");
            for (var i = 0; i < divs.length; i++) {
                divs[i].className = "menu-item";
            }
            div.className = "menu-item selected";
        };
        return div;
    };
    Menu.prototype.addOption = function (text, value, container, data, selected) {
        if (selected === void 0) { selected = false; }
        var div0 = document.createElement("div");
        var div1 = document.createElement("div");
        var div2 = document.createElement("div");
        div0.style.fontSize = "4vh";
        div1.style.fontSize = "4vh";
        if (selected) {
            div0.className = "menu-item-option ";
            div1.className = "menu-item selected";
        }
        else {
            div0.className = "menu-item-option";
            div1.className = "menu-item";
        }
        div1.id = data;
        div0.innerText = text;
        div2.appendChild(div0);
        div1.innerText = "< " + value + " >";
        div2.appendChild(div1);
        div2.style.display = "flex";
        div2.style.justifyContent = "space-between";
        container.appendChild(div2);
        return div2;
    };
    Menu.prototype.initMainMenu = function () {
        var container = this.menu.getElementsByClassName("main-menu")[0];
        // tolgo hide
        container.innerText = "";
        this.addButton("Play", container, this.playMenu.bind(this), true);
        this.addButton("Options", container, this.optionsMenu.bind(this));
        this.addButton("Level editor", container, this.drawEditor.bind(this));
    };
    Menu.prototype.playMenu = function () {
        var container = this.menu.getElementsByClassName("main-menu")[0];
        // tolgo hide
        container.innerText = "";
        var preloaded = new Preloaded();
        // Livelli predefiniti
        for (var i = 0; i < preloaded.maps.length; i++) {
            this.addButton(preloaded.maps[i].name, container, this.playGame.bind(this, preloaded.maps[i]), i == 0);
        }
        var obj = localStorage.getItem('levels');
        if (obj != undefined) {
            var array = JSON.parse(obj);
            for (var i = 0; i < array.length; i++) {
                this.addButton(array[i].name, container, this.playGame.bind(this, array[i]), false);
            }
        }
    };
    Menu.prototype.optionsMenu = function () {
        var container = this.menu.getElementsByClassName("main-menu")[0];
        // tolgo hide
        container.innerText = "";
        this.addOption("FOV", this.camera.fov, container, "fov", true);
        this.addOption("Rendering range", this.camera.range, container, "renderRange");
        this.addOption("Lightning range", this.camera.lightRange, container, "lightRange");
        this.addOption("Sprites range", this.camera.spriteRange, container, "spriteRange");
        this.addOption("Resolution", this.camera.res, container, "resolution");
    };
    Menu.prototype.drawEditor = function () {
        this.editor.show();
        this.hide();
    };
    Menu.prototype.playGame = function (map) {
        console.log(map);
        var camera = new RayCamera({
            spriteRange: this.camera.spriteRange,
            range: this.camera.range,
            lightRange: this.camera.lightRange
        });
        if (!this.game.gameShow) {
            this.game.load(map, camera, this.camera.res, this.camera.fov);
            this.game.show();
            this.menu.className = "hide";
            Startup.resize();
        }
    };
    Menu.prototype.selectPrev = function () {
        var container = this.menu.getElementsByClassName("main-menu")[0];
        var parent = this.menu.getElementsByClassName("menu-container")[0];
        var buttons = container.getElementsByClassName("menu-item");
        var offset;
        for (var i = 0; i < buttons.length; i++) {
            if (i == 0)
                offset = buttons[i].offsetTop;
            if (buttons[i].className === "menu-item selected") {
                buttons[i].className = "menu-item";
                // Strano modo per fare il modulo negativo
                i = ((i - 1) % buttons.length + buttons.length) % buttons.length;
                buttons[i].className = "menu-item selected";
                parent.scrollTop = buttons[i].offsetTop - offset;
                return;
            }
        }
    };
    Menu.prototype.selectNext = function () {
        var container = this.menu.getElementsByClassName("main-menu")[0];
        var parent = this.menu.getElementsByClassName("menu-container")[0];
        var buttons = container.getElementsByClassName("menu-item");
        var offset;
        for (var i = 0; i < buttons.length; i++) {
            if (i == 0)
                offset = buttons[i].offsetTop;
            if (buttons[i].className === "menu-item selected") {
                buttons[i].className = "menu-item";
                i = (i + 1) % buttons.length;
                buttons[i].className = "menu-item selected";
                parent.scrollTop = buttons[i].offsetTop - offset;
                return;
            }
        }
    };
    Menu.prototype.selectLeft = function () {
        var container = this.menu.getElementsByClassName("main-menu")[0];
        var buttons = container.getElementsByClassName("menu-item");
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].className === "menu-item selected" && buttons[i].id != "") {
                var value = this.modVar(buttons[i].id, false);
                var btn = buttons[i];
                btn.innerText = "< " + value + " >";
                return;
            }
        }
    };
    Menu.prototype.selectRight = function () {
        var container = this.menu.getElementsByClassName("main-menu")[0];
        var buttons = container.getElementsByClassName("menu-item");
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].className === "menu-item selected" && buttons[i].id != "") {
                var value = this.modVar(buttons[i].id, true);
                var btn = buttons[i];
                btn.innerText = "< " + value + " >";
                return;
            }
        }
    };
    Menu.prototype.modVar = function (variable, increase) {
        switch (variable) {
            case "fov":
                if (increase && this.camera.fov < this.camera.maxFov)
                    this.camera.fov++;
                if (!increase && this.camera.fov > this.camera.minFov)
                    this.camera.fov--;
                return this.camera.fov;
            case "renderRange":
                if (increase && this.camera.range < this.camera.maxRange)
                    this.camera.range++;
                if (!increase && this.camera.range > this.camera.minRange)
                    this.camera.range--;
                return this.camera.range;
            case "lightRange":
                if (increase && this.camera.lightRange < this.camera.maxLightRange)
                    this.camera.lightRange++;
                if (!increase && this.camera.lightRange > this.camera.minLightRange)
                    this.camera.lightRange--;
                return this.camera.lightRange;
            case "spriteRange":
                if (increase && this.camera.spriteRange < this.camera.maxSpriteRange)
                    this.camera.spriteRange++;
                if (!increase && this.camera.spriteRange > this.camera.minSpriteRange)
                    this.camera.spriteRange--;
                return this.camera.spriteRange;
            case "resolution":
                if (increase && this.camera.res < this.camera.maxRes)
                    this.camera.res++;
                if (!increase && this.camera.res > this.camera.minRes)
                    this.camera.res--;
                return this.camera.res;
        }
    };
    Menu.prototype.enterMenu = function () {
        var container = this.menu.getElementsByClassName("main-menu")[0];
        var buttons = container.getElementsByClassName("menu-item");
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].className === "menu-item selected") {
                console.log();
                var div = buttons[i];
                div.click();
                return;
            }
        }
    };
    Menu.prototype.hide = function () {
        this.menu.className = "hide";
    };
    Menu.prototype.show = function () {
        var init = document.getElementsByClassName("init");
        // Elimino la splash screen 
        var len = init.length;
        for (var i = 0; i < len; i++)
            init[0].remove();
        this.menu.className = "";
        this.initMainMenu();
    };
    return Menu;
}());
//# sourceMappingURL=menu.js.map