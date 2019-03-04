interface Block {
    img : HTMLImageElement;
    height : number;
    width : number;
}

class Editor {
    // Elemento principale editor
    private editorEl : HTMLElement;

    private mouseIsDown : boolean = false;
    private wallTexuresSrc : string[] = [];
    private wallTextures : Block [] = [];

    private spritesSrc : string[] = [];
    private sprites : Sprite [] = [];

    private ctx : CanvasRenderingContext2D;
    private canvas : HTMLCanvasElement;
    public map : RayMap;

    private gridW : number;
    private gridH : number;
    private selectedTexture : Texture;
    private selectedSprite : Sprite;
    // false wall, true sprite
    private wallOrSprite : boolean = false;
    private fillBlock : boolean = true;
    private insPlayer : boolean = false;

    constructor ( editorEl : HTMLElement) {
        this.editorEl = editorEl;
        this.canvas = <HTMLCanvasElement> editorEl.getElementsByTagName("canvas")[0];
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        // Texture walls
        for( let i = 0; i<=55; i++ ){
            this.wallTexuresSrc[i] = "res/walls/"+(i+2)+".png";
        }
        // Texture sprites
        for( let i = 0; i<=37; i++ ){
            this.spritesSrc[i] = "res/sprites/misc/"+i+".png";
        }
        // Blocchi e Sprite speciali
        this.loadTexure( new Door1Texture({}, 0, 0) );
        this.loadTexure( new Door2Texture({}, 0, 0) );
        this.loadWallTextures();
        this.loadSprite( new GuardSprite({}) );
        this.loadSprite( new SSSprite({}) );
        this.loadSprite( new HSprite({}) );
        this.loadSprites();
        this.selectFirstSprite()

    }

    public initEditor() : void {
        this.map = new RayMap({
            width: 30,
            height: 30
        });
        this.map.initMap();
        this.canvas.width = window.innerHeight ;
        this.canvas.height = window.innerHeight ;

        this.drawBackground();
        this.gridW = this.map.width;
        this.gridH = this.map.height;
        this.drawBlocks()
        this.drawGrid()

        this.fill()
        this.blocksTab();
        this.loadMapsOptions();
        this.startClickListener()
    }
    public drawBackground() : void {
        this.ctx.save();
        this.ctx.fillStyle="#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.restore();
    }

    public drawGrid() : void{
        this.ctx.save();
        this.ctx.strokeStyle = "#1C1C1C";
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        // il canvas è quadrato
        let spacing = this.canvas.height / this.gridH;
        for(let i = 0; i < this.gridW; i++){
          for(let j = 0; j < this.gridH; j++){
            this.ctx.moveTo(j * spacing, 0);
            this.ctx.lineTo(j * spacing, this.canvas.height);
          }
          this.ctx.moveTo(0, i * spacing);
          this.ctx.lineTo(this.canvas.height, i * spacing);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    }

    public drawBlocks() : void {
        this.ctx.save();
        // il canvas è quadrato
        let spacing = this.canvas.height / this.gridH;
        for(let i = 0; i < this.gridW; i++){
          for(let j = 0; j < this.gridH; j++){
                let wallNum : number = this.map.get(i, j);
                if( wallNum > 0 &&  this.map.wallTextures[wallNum-1] != undefined ){
                    this.ctx.drawImage( this.map.wallTextures[wallNum-1].img, i*spacing, j*spacing,spacing,spacing );
                } else if( wallNum <= 0){
                    this.ctx.fillStyle="#000000";
                    this.ctx.fillRect( i*spacing, j*spacing,spacing,spacing ); 
                }
          }
        }
        // draw sprites
        for( let i=0; i<this.map.sprites.length; i++ ){
            this.ctx.drawImage( this.map.sprites[i].img, (this.map.sprites[i].position.x)*spacing, 
                                (this.map.sprites[i].position.y)*spacing, spacing, spacing );
        } 
        // draw player
        if(this.map.player.position.x >= 0 && this.map.player.position.y >= 0)
            this.ctx.drawImage( this.map.player.img, (this.map.player.position.x)*spacing, 
                                    (this.map.player.position.y)*spacing, spacing, spacing );
        console.log( this.map.player );
        this.ctx.restore();
    }

    public loadWallTextures() : void {
        let walls : HTMLElement = document.getElementById("walls");
        for( let i=0; i < this.wallTexuresSrc.length; i++ ){
            //console.log(this.wallTexuresSrc[i]);
            let img : HTMLImageElement = new Image();
            img.src = this.wallTexuresSrc[i];
            // Carico la texture
            let texture : Texture;
            img.onload = () => {
                texture = new Texture({
                    src : img.src
                });

                this.wallTextures.push( texture );
                if( i == 0) { 
                    this.selectedTexture = texture;
                }
            }
            // Seleziono il primo elemento
            if( i == 0) { 
                img.style.borderStyle = "solid";
                img.style.borderWidth = "2px";
                img.style.borderColor = "#FAFAFA";
            }
            img.onclick = ( e ) => {
                let images = Array.prototype.slice.call( walls.getElementsByTagName("img") );
                images.map( (x) => {
                    x.style.borderWidth = "0px";
                    return x;
                });
                img.style.borderStyle = "solid";
                img.style.borderWidth = "2px";
                img.style.borderColor = "#FAFAFA";
                // Cambio la texture
                this.selectedTexture = texture;
            }

            walls.appendChild(img);
        }
    }
    public loadTexure( t : Texture ) : void {
        let walls : HTMLElement = document.getElementById("walls");
        this.wallTextures.push( t );

        let img : HTMLImageElement = new Image();
        img = t.img;
        img.onclick = ( e ) => {
            let images = Array.prototype.slice.call( walls.getElementsByTagName("img") );
            images.map( (x) => {
                x.style.borderWidth = "0px";
                return x;
            });
            img.style.borderStyle = "solid";
            img.style.borderWidth = "2px";
            img.style.borderColor = "#FAFAFA";
            this.selectedTexture = t;
        }
        walls.appendChild(img);
    }
    public selectFirstSprite(){
        let sprites : HTMLElement = document.getElementById("sprites");
        let images = Array.prototype.slice.call( sprites.getElementsByTagName("img") );
        images.map( (x) => {
            x.style.borderWidth = "0px";
            return x;
        });
        images[0].style.borderStyle = "solid";
        images[0].style.borderWidth = "2px";
        images[0].style.borderColor = "#FAFAFA";
    }

    public loadSprites() : void {
        for( let i=0; i < this.spritesSrc.length; i++ ){
            let sprite = new Sprite({ src : this.spritesSrc[i] })
            this.loadSprite( sprite );
        }
        this.selectedSprite = this.sprites[0];
    }

    public loadSprite( s : Sprite ) : void {
        let sprites : HTMLElement = document.getElementById("sprites");
        this.sprites.push( s );

        let img : HTMLImageElement = new Image();
        img = s.img;
            img.onclick = ( e ) => {
                let images = Array.prototype.slice.call( sprites.getElementsByTagName("img") );
                images.map( (x) => {
                    x.style.borderWidth = "0px";
                    return x;
                });
                img.style.borderStyle = "solid";
                img.style.borderWidth = "2px";
                img.style.borderColor = "#FAFAFA";
                this.selectedSprite = s;
                console.log(s);
            }
            sprites.appendChild(img);
    }

    public loadMapsOptions() : void {
        let container1 = document.getElementById("selectLoad");
        let container2 = document.getElementById("selectDelete");
        container1.innerHTML="";
        container2.innerHTML="";
        let obj= localStorage.getItem('levels');
        if( obj != undefined) {
            let array = JSON.parse(obj);
            for(let i=0; i<array.length; i++){
                let option1 = new Option();
                let option2 = new Option();
                option1.text =  array[i].name;
                option1.value = array[i].name;
                option2.text =  array[i].name;
                option2.value = array[i].name;
                container1.appendChild( option1 );
                container2.appendChild( option2 );
            }
        }
    }
    public loadMap( mapName : string ) : void {
        let obj= localStorage.getItem('levels');
        if( obj != undefined) {
            let array = JSON.parse(obj);
            for(let i=0; i<array.length; i++){
                if( array[i].name == mapName ){
                    this.map = <RayMap> Object.assign(new RayMap({}), array[i]);
                    this.map.loadPlayer();
                    this.map.loadSprites();
                    this.map.loadTextures();
                    this.drawBlocks();
                    this.drawGrid();
                    return;
                }
            }
        }
    }
    public deleteMap( mapName : string ) : void {
        let obj= localStorage.getItem('levels');
        if( obj != undefined) {
            let array = JSON.parse(obj);
            for(let i=0; i<array.length; i++){
                if( array[i].name == mapName ){
                    array.splice(i, 1);
                    localStorage.setItem('levels', JSON.stringify(array));
                    this.loadMapsOptions();
                    return;
                }
            }
        }
    }
    public loadSelectedMap() : void {
        let container = <HTMLSelectElement> document.getElementById("selectLoad");
        let option = <HTMLOptionElement> container[container.selectedIndex];
        this.loadMap( option.value );
    }
    public deleteSelectedMap() : void {
        let container = <HTMLSelectElement> document.getElementById("selectDelete");
        let option = <HTMLOptionElement> container[container.selectedIndex];
        if( option != undefined )
            this.deleteMap( option.value );
        else
            alert("Impossibile eliminare la mappa!");
    }
    public saveChanges() : void {
        this.map.name = (<HTMLInputElement> document.getElementById("mapName1")).value;
        this.map.skyColor =  (<HTMLInputElement> document.getElementById("sky")).value;
        this.map.floorColor =  (<HTMLInputElement> document.getElementById("floor")).value;
        if( this.map.name == "" ) {
            alert( "Inserire un nome  valido" )
            return;
        }
        if( !this.map.isSavedOnLocalStorage( this.map.name ) ){
            this.map.saveOnLocalStorage();
            this.loadMapsOptions();
            alert( "Mappa salvata con successo" )
        } else {
            alert( "Nome esistente!" )
        }
        console.log(localStorage.getItem("level"));
    }

    /**
     * Ritorna il colore predominante
     * @param img Elemento img
     */
    public getAverageRGB( img : HTMLImageElement ) {
        var context = document.createElement('canvas').getContext('2d');
        context.imageSmoothingEnabled = true;
        context.drawImage(img, 0, 0, 2, 2);
        return context.getImageData(1, 1, 1, 1).data.slice(0,3);
    }

    public startClickListener() : void {
        let container = document.getElementById("editor")
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
    }

    private blocksTab () : void {
        document.getElementById("wallsBtn").className = "tab buttonSelected";
        document.getElementById("spritesBtn").className = "tab";
        document.getElementById("walls").style.display = "block";
        document.getElementById("sprites").style.display = "none";
        this.wallOrSprite = false;
    }
    private spritesTab () : void {
        document.getElementById("wallsBtn").className = "tab";
        document.getElementById("spritesBtn").className = "tab buttonSelected";
        document.getElementById("walls").style.display = "none";
        document.getElementById("sprites").style.display = "block";
        this.wallOrSprite = true;
    }

    private fill() : void {
        this.fillBlock = true;
        this.insPlayer = false;
        document.getElementById("player").className = "Button";
        document.getElementById("fill").className = "Button buttonSelected";
        document.getElementById("delete").className = "Button ";
    }
    private erase() : void {
        this.fillBlock = false;
        this.insPlayer = false;
        document.getElementById("player").className = "Button";
        document.getElementById("fill").className = "Button ";
        document.getElementById("delete").className = "Button buttonSelected";
    }
    private insertPlayer() : void {
        this.fillBlock = true;
        this.insPlayer = true;
        document.getElementById("player").className = "Button buttonSelected";
        document.getElementById("fill").className = "Button ";
        document.getElementById("delete").className = "Button ";
    }

    public mouseDown( e ) : void {
        this.mouseIsDown = true;
        let x : number = e.offsetX;
        let y : number = e.offsetY;
        let spacing = this.canvas.height / this.gridH;
        let gridX : number = Math.floor(x / spacing);
        let gridY : number = Math.floor(y / spacing);

        if( !this.fillBlock ) {
            this.map.set( gridX, gridY, 0 );
            this.map.removeTexture( gridX, gridY);
            this.map.removeSprite( gridX, gridY);
            this.drawBlocks();
            this.drawGrid();
            return;
        }

        if( this.map.get( gridX, gridY ) > 0 || this.map.getSprite( gridX, gridY ) ||
            (this.map.player.position.x == gridX && this.map.player.position.y == gridY) )
            return;

        if( this.insPlayer ) {
            this.map.setPlayer( gridX, gridY );
            this.drawBlocks();
            this.drawGrid();
            return;
        }
        
        // Blocco selezionato
        if( !this.wallOrSprite ){
            let isIN : number= -1;
            for(let i=0; i<this.map.wallTextures.length; i++){
                if( this.selectedTexture.img.src === this.map.wallTextures[i].src ){
                    isIN = i;
                    break;
                }
            }
            // è già salvata la texture e non è una porta
            if( isIN >= 0 && !this.map.isDoor(this.selectedTexture) ){
                this.map.set(gridX, gridY, isIN+1 );
            } else { // la devo salvare
                console.log(this.selectedTexture);
                this.map.set(gridX, gridY, this.map.wallTextures.length + 1);
                let texture : Texture = this.map.copyTexture( this.selectedTexture );
                if( this.map.isDoor(texture) ) texture.setPosition( gridX, gridY );
                this.map.wallTextures.push(texture);
            }
        } else { // Sprite selezionato
            if( !this.map.getSprite( gridX, gridY )){
                let copy : Sprite = this.map.copySprite( this.selectedSprite );
                copy.setPosition( gridX, gridY);
                this.map.sprites.push( copy );
            }
        }

        this.drawBlocks();
        this.drawGrid();
    }

    public mouseMove( e ) : void {
        if( this.mouseIsDown == false ) return;
        this.mouseDown( e );
    }

    public mouseUp( e ) : void {
        this.mouseIsDown = false;
    }

    public delete() : void{
        this.canvas.onmousedown = null;
        this.canvas.onmousemove = null;
        this.canvas.onmouseup = null;
        delete this.ctx;
        delete this.canvas;
    }

    public exitEditor() : void {
        Startup.menu.show();
        Startup.game.hide();
        Startup.editor.hide();
    }
    public hide() : void {
        this.editorEl.className = "hide";
    }
    public show() : void {
        this.initEditor();
        this.loadMapsOptions();
        this.editorEl.className = "";
    }
}