var Startup = /** @class */ (function () {
    function Startup() {
    }
    Startup.main = function () {
        console.log('Main');
        Startup.gameCanvas = document.getElementById('MainCanvas');
        // Game render
        var mainGame = document.getElementById('main-game');
        Startup.game = new Game(mainGame);
        // Editor render
        Startup.editorContainer = document.getElementById('editor');
        Startup.editor = new Editor(Startup.editorContainer);
        // Menu render
        Startup.menuContainer = document.getElementById('menu');
        Startup.menu = new Menu(Startup.menuContainer, Startup.game, Startup.editor);
        window.onresize = Startup.onWindowResized;
        Startup.resize();
        Startup.keyHandler();
        return 0;
    };
    Startup.onWindowResized = function (event) {
        Startup.resize();
        //Startup.game.resetEditor(); 
    };
    Startup.resize = function () {
        var HUD = document.getElementsByClassName("hud-container")[0];
        if (window.innerWidth > window.innerHeight * 1.35) {
            Startup.gameCanvas.width = window.innerHeight * 1.35;
            Startup.gameCanvas.height = window.innerHeight - HUD.clientHeight - 1;
        }
        else {
            var padding = window.innerHeight - window.innerWidth;
            Startup.gameCanvas.width = window.innerWidth;
            Startup.gameCanvas.height = window.innerWidth / 1.35 - HUD.clientHeight - 1;
        }
        Startup.menuContainer.style.width = Startup.gameCanvas.width + "px";
        Startup.menuContainer.style.height = Startup.gameCanvas.height + HUD.clientHeight + "px";
        if (Startup.game !== undefined)
            Startup.game.changeDim(Startup.gameCanvas.width, Startup.gameCanvas.height);
    };
    Startup.keyHandler = function () {
        document.onkeydown = function (e) {
            if (e.keyCode == 27 || e.keyCode == 81) { //esc
                Startup.menu.show();
                Startup.game.hide();
                Startup.editor.hide();
            }
            else if (e.keyCode == 38) { //up
                Startup.menu.selectPrev();
            }
            else if (e.keyCode == 40) { //down
                Startup.menu.selectNext();
            }
            else if (e.keyCode == 37) { //left
                Startup.menu.selectLeft();
            }
            else if (e.keyCode == 39) { //down
                Startup.menu.selectRight();
            }
            else if (e.keyCode == 13) { //enter
                Startup.menu.enterMenu();
            }
        };
    };
    return Startup;
}());
Startup.main();
//# sourceMappingURL=main.js.map