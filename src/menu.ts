class Menu {
    private game : Game;
    private menu : HTMLElement;
    private editor : Editor;
    private tmpMap : RayMap;

    private camera = {
        maxSpriteRange : 30,
        minSpriteRange : 4,
        spriteRange : 20,

        maxFov : 100,
        minFov : 30,
        fov : 70,

        maxRange : 30,
        minRange : 4,
        range : 20,

        maxLightRange : 30,
        minLightRange : 4,
        lightRange : 20,

        maxRes : 500,
        minRes : 100,
        res : 350

      };

    constructor( menuEl : HTMLElement, game : Game, editor : Editor) {
        this.game = game;
        this.editor = editor;

        this.menu = menuEl;
        this.initMainMenu();
    }

    private addButton( text : string, container : HTMLElement, callback : Function, selected  : boolean = false) : HTMLElement {
        let div = document.createElement("div"); 
        if( selected ) {
            div.className = "menu-item selected";
        } else {
            div.className = "menu-item";
        }

        div.innerText = text;
        container.appendChild(div); 
        div.onclick = () =>{
            if( div.className === "menu-item selected" ){
                callback();
                return;
            }

            let divs = container.getElementsByTagName("div");
            for( let i=0; i<divs.length; i++){
                    divs[i].className = "menu-item";
            }
            div.className = "menu-item selected";
        }
        return div;
    }
    private addOption( text : string, value : number, container : HTMLElement, data : string, selected  : boolean = false) : HTMLElement {
        let div0 = document.createElement("div"); 
        let div1 = document.createElement("div"); 
        let div2 = document.createElement("div");
        div0.style.fontSize = "4vh";
        div1.style.fontSize = "4vh";
        if( selected ) {
            div0.className = "menu-item-option ";
            div1.className = "menu-item selected";
        } else {
            div0.className = "menu-item-option";
            div1.className = "menu-item";
        }
        div1.id = data;
        div0.innerText = text;
        div2.appendChild(div0); 
        div1.innerText = "< "+value+" >";
        div2.appendChild(div1); 
        div2.style.display = "flex";
        div2.style.justifyContent = "space-between";
        container.appendChild(div2); 
        return div2;
    }

    public initMainMenu() : void{
        let container : HTMLElement = <HTMLElement> this.menu.getElementsByClassName("main-menu")[0];
        // tolgo hide
        container.innerText = "";
        
        this.addButton("Play", container, this.playMenu.bind(this) , true);
        this.addButton("Options", container, this.optionsMenu.bind(this));
        this.addButton("Level editor", container, this.drawEditor.bind(this));

    }

    public playMenu() : void{
        let container : HTMLElement = <HTMLElement> this.menu.getElementsByClassName("main-menu")[0];
        // tolgo hide
        container.innerText = "";
        let preloaded = new Preloaded();
        // Livelli predefiniti
        for(let i=0; i<preloaded.maps.length; i++){
            this.addButton( preloaded.maps[i].name, container, this.playGame.bind(this, preloaded.maps[i]), i==0 );
        }

        let obj= localStorage.getItem('levels');
        if( obj != undefined) {
            let array = JSON.parse(obj);
            for(let i=0; i<array.length; i++){
                this.addButton( array[i].name, container, this.playGame.bind(this, array[i]), false );
            }
        }
    }

    public optionsMenu() : void{
        let container : HTMLElement = <HTMLElement> this.menu.getElementsByClassName("main-menu")[0];
        // tolgo hide
        container.innerText = "";
        
        this.addOption("FOV", this.camera.fov, container, "fov", true);
        this.addOption("Rendering range", this.camera.range, container, "renderRange");
        this.addOption("Lightning range", this.camera.lightRange, container, "lightRange");
        this.addOption("Sprites range", this.camera.spriteRange, container, "spriteRange");
        this.addOption("Resolution", this.camera.res, container, "resolution");

    }

    public drawEditor() : void {
        this.editor.show();
        this.hide();
    }

    public playGame( map : RayMap ) :void {
        console.log(map);
        let camera = new RayCamera({
            spriteRange : this.camera.spriteRange,
            range : this.camera.range,
            lightRange : this.camera.lightRange
          });
        if( !this.game.gameShow ){
            this.game.load( map, camera, this.camera.res, this.camera.fov );
            this.game.show();
            this.menu.className = "hide";
            Startup.resize();
        }
    }

    public selectPrev() : void {
        let container : HTMLElement = <HTMLElement> this.menu.getElementsByClassName("main-menu")[0];
        let parent : HTMLElement = <HTMLElement> this.menu.getElementsByClassName("menu-container")[0];
        let buttons = container.getElementsByClassName("menu-item");
        let offset : number;
        for( let i=0; i<buttons.length; i++){
            if( i == 0) offset = (<HTMLElement> buttons[i]).offsetTop;
            if( buttons[i].className === "menu-item selected" ){
                buttons[i].className = "menu-item";
                // Strano modo per fare il modulo negativo
                i = ((i -1) %  buttons.length + buttons.length ) % buttons.length;
                buttons[i].className = "menu-item selected";
                parent.scrollTop = (<HTMLElement> buttons[i]).offsetTop - offset;
                return;
            }
        }
    }

    public selectNext() : void {
        let container : HTMLElement = <HTMLElement> this.menu.getElementsByClassName("main-menu")[0];
        let parent : HTMLElement = <HTMLElement> this.menu.getElementsByClassName("menu-container")[0];
        let buttons  = container.getElementsByClassName("menu-item");
        let offset : number;
        for( let i=0; i<buttons.length; i++){
            if( i == 0) offset = (<HTMLElement> buttons[i]).offsetTop;
            if( buttons[i].className === "menu-item selected" ){
                buttons[i].className = "menu-item";
                i = (i + 1) %  buttons.length;

                buttons[i].className = "menu-item selected";
                parent.scrollTop = (<HTMLElement> buttons[i]).offsetTop - offset;
                return;
            }
        }
    }
    public selectLeft() : void {
        let container : HTMLElement = <HTMLElement> this.menu.getElementsByClassName("main-menu")[0];
        let buttons = container.getElementsByClassName("menu-item");
        for( let i=0; i<buttons.length; i++){
            if(  buttons[i].className === "menu-item selected" && buttons[i].id != "" ) {
                let value = this.modVar( buttons[i].id, false );
                let btn = <HTMLElement> buttons[i];
                btn.innerText = "< "+value+" >";
                return;
            }

        }
    }
    public selectRight() : void {
        let container : HTMLElement = <HTMLElement> this.menu.getElementsByClassName("main-menu")[0];
        let buttons = container.getElementsByClassName("menu-item");
        for( let i=0; i<buttons.length; i++){
            if(  buttons[i].className === "menu-item selected" && buttons[i].id != "" ) {
                let value = this.modVar( buttons[i].id, true );
                let btn = <HTMLElement> buttons[i];
                btn.innerText = "< "+value+" >";
                return;
            }

        }
    }
    public modVar( variable : string, increase : boolean ) : number {
        switch( variable ){
            case "fov":
                if( increase &&  this.camera.fov < this.camera.maxFov )
                    this.camera.fov++;
            
                if( !increase &&  this.camera.fov > this.camera.minFov )
                    this.camera.fov--;
            
                return this.camera.fov;
            case "renderRange":
                if( increase &&  this.camera.range < this.camera.maxRange )
                    this.camera.range++;
            
                if( !increase &&  this.camera.range > this.camera.minRange )
                    this.camera.range--;
            
                return this.camera.range;
            case "lightRange":
                if( increase &&  this.camera.lightRange < this.camera.maxLightRange )
                    this.camera.lightRange++;
            
                if( !increase &&  this.camera.lightRange > this.camera.minLightRange )
                    this.camera.lightRange--;
            
                return this.camera.lightRange;
            case "spriteRange":
                if( increase &&  this.camera.spriteRange < this.camera.maxSpriteRange )
                    this.camera.spriteRange++;
            
                if( !increase &&  this.camera.spriteRange > this.camera.minSpriteRange )
                    this.camera.spriteRange--;

                return this.camera.spriteRange;
            case "resolution":
                if( increase &&  this.camera.res < this.camera.maxRes )
                    this.camera.res++;
                
                if( !increase &&  this.camera.res > this.camera.minRes )
                    this.camera.res--;
                
                return this.camera.res;
        }

    }

    public enterMenu() : void {
        let container : HTMLElement = <HTMLElement> this.menu.getElementsByClassName("main-menu")[0];
        let buttons = container.getElementsByClassName("menu-item");
        for( let i=0; i<buttons.length; i++){
            if( buttons[i].className === "menu-item selected" ){
                console.log()
                let div : HTMLElement = <HTMLElement> buttons[i];
                div.click();
                return;
            }
        }
    }

    public hide() : void {
        this.menu.className = "hide";
    }

    public show() : void {
        let init = document.getElementsByClassName("init");
        // Elimino la splash screen 
        let len = init.length;
        for (let i=0; i<len; i++) init[0].remove();

        this.menu.className = "";
        this.initMainMenu();
    }

}