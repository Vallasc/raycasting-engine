var CIRCLE = Math.PI * 2;
// ES2015
declare interface ObjectConstructor {
    assign(...objects: Object[]): Object;
}

class Game {
    // Ferma il gioco
    private stop : boolean = false;
    public gameShow : boolean = false;
    private gameEl : HTMLElement;
    public canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private player : Player;
    private renderer : RaycastRenderer;
    private miniMap : MiniMap;
    private camera : RayCamera;
    private map : RayMap;
    private controls : Controls;

    private music : HTMLAudioElement;

    private hud : HUD;

    private editor : Editor;
    private musicSrc : string[] = ["res/sounds/02_-_Wolfenstein_3D_-_DOS_-_Wondering_About_My_Loved_Ones.ogg",
                                "res/sounds/05_-_Wolfenstein_3D_-_DOS_-_P.O.W..ogg",
                                "res/sounds/04_-_Wolfenstein_3D_-_DOS_-_Searching_For_the_Enemy.ogg"] ;
    private lastTime = 0;
    constructor ( gameEl : HTMLElement) {
        console.log('Game');

        this.gameEl = gameEl;
        this.canvas = <HTMLCanvasElement> gameEl.getElementsByTagName("canvas")[0];
        this.ctx = this.canvas.getContext('2d');

        let savedMap = JSON.parse(localStorage.getItem("level"));
        this.map = <RayMap> Object.assign(new RayMap({}), savedMap);
        this.map.loadTextures();
        this.map.loadSprites();
        this.map.loadPlayer();


        this.camera = new RayCamera({
            spriteRange : 20,
            range : 32,
            lightRange : 20
          });

        this.player = this.map.player;
        this.camera.direction = this.player.direction;
        this.camera.position.x = this.player.position.x;
        this.camera.position.y = this.player.position.y;

        this.controls = new Controls();

        //this.map = new RayMap({});
        this.miniMap = new MiniMap({});
        this.miniMap.LoadMap(this.map);
        this.renderer = new RaycastRenderer({
            width: this.canvas.width,
            height: this.canvas.height,
            resolution: 400,
            textureSmoothing: false,
            domElement: this.canvas
          });

        this.hud = new HUD();
        //window.requestAnimationFrame((time) => this.draw( time ));
        
    }

    private draw ( time ) : void {

        let seconds = (time - this.lastTime) / 1000;
        this.lastTime = time;
        if (seconds < 0.2) {
            this.player.update(this.controls.states, this.map, seconds, this.camera); // seconds
            this.map.updateTextures( this.camera );
            this.map.moveSprites( this.camera );
            this.map.updateSprites( this.controls, this.player, this.map );
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.renderer.Render(this.camera, this.map);
            this.player.weaponManager.paint( this.ctx, this.controls );
            this.hud.update( this.player );
            // Mi hanno sparato
            this.ctx.save();
            this.ctx.fillStyle = "rgba( 255, 0, 0, 0.5)"
            if( this.player.shooted ) this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();

            this.ctx.save();
            this.ctx.translate(80, 100);
            this.ctx.rotate(-(this.player.direction - Math.PI * 0.5));
            this.miniMap.RenderRelMap(this.ctx, this.player.position);
            this.ctx.restore(); 

            if( this.player.dead ){
                this.player.dead = false;
                //setTimeout(this.dead.bind(this), 500);
                this.dead();
            }
            if( this.map.allSpritesDead() ){
                this.win();
            }
        }
        if( !this.stop )
            window.requestAnimationFrame((time) => this.draw(time));
    }

    public changeDim( newWidth : number, newHeight : number ) : void {
        this.renderer.changeDim(newWidth, newHeight );
    }

    public hide() {
        this.gameShow = false;
        if( this.music != undefined ){
            this.music.pause();
            this.music.currentTime = 0;
        }
        this.stop = true;
        this.gameEl.className = "hide";
    }

    public show() {
        if( !this.gameShow ){
            this.gameShow = true;

            let i = Math.floor((Math.random() * (this.musicSrc.length)));
            this.music = new Audio( this.musicSrc[i] );
            this.music.play();
            this.music.loop = true;
            this.stop = false;
            this.draw( 0 );
            this.gameEl.className = "";
        }
    }

    public dead() {
        this.stop = true;
        this.player.deadSound.play();
        let space = 4; 
        let width = this.canvas.width/space;
        let height = this.canvas.height/space;
        let pixels = this.ctx.createImageData(width, height);
        let ctx = this.ctx;
        let flagEnd = false;

        const RAND_MASKS = [
            0x00000001, 0x00000003, 0x00000006, 0x0000000C, 0x00000014, 0x00000030,
            0x00000060, 0x000000B8, 0x00000110, 0x00000240, 0x00000500, 0x00000CA0,
            0x00001B00, 0x00003500, 0x00006000, 0x0000B400, 0x00012000, 0x00020400,
            0x00072000, 0x00090000, 0x00140000, 0x00300000, 0x00400000, 0x00D80000,
            0x01200000, 0x03880000, 0x07200000, 0x09000000, 0x14000000, 0x32800000,
            0x48000000, 0xA3000000
            ]
            
        function dissolve( ) {
            const size = width * height;
            let tmpSize = size;
            const bitWidth = getBitWidth(size);
            const mask = RAND_MASKS[bitWidth - 1];
            let seq = 1
            function run( ){
                ctx.save();
                for(let i=0; i<200; i++){
                    const x = ( seq % width) | 0
                    const y = (Math.ceil(seq / width) - 1.0) | 0
                
                    ctx.fillStyle = '#8f0000';
                    ctx.fillRect( x*space, y*space, space, space );
                
                    // iterate and ignore samples outside of our target rectangular area
                    do {
                        seq = (seq >> 1) ^ ((seq & 1) * mask)
                    } while (seq > size)
                    tmpSize--;
                }
                ctx.restore();
                if(tmpSize > 0) {
                    setTimeout(run, 7); 
                } else {
                    flagEnd = true;
                }
            }
            run();
        }
      
      function getBitWidth (n) {
        let width = 0
        while (n > 0) {
          n >>= 1
          ++width
        }
        return width
      }

      dissolve();
      var interval = setInterval(()=>{
        if( flagEnd ){
            //this.reload();
            if( this.player.lives == 0) {
                this.stop = true;
                this.ctx.save();      
                this.ctx.fillStyle = '#8f0000';
                this.ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );
                this.ctx.fillStyle = '#000000';
                this.ctx.font = '70px "Press Start 2P"'
                this.ctx.textAlign = "center"; 
                this.ctx.fillText("YOU LOSE", (this.canvas.width/2)+6, (this.canvas.height/2)+6);
        
                this.ctx.font = '70px "Press Start 2P"'
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillText("YOU LOSE", this.canvas.width/2, this.canvas.height/2);
                this.ctx.restore();
            } else { 
                this.stop = false;
                this.draw( 0 );
            }
            clearInterval(interval);
        }
      }, 500)

    }

    private win() : void {
        this.stop = true;
        if( this.music != undefined ){
            this.music.pause();
            this.music.currentTime = 0;
        }
        this.music = new Audio(  "res/sounds/21_-_Wolfenstein_3D_-_DOS_-_End_of_Level.ogg" );
        this.music.play();
        this.ctx.save();      
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '70px "Press Start 2P"'
        this.ctx.textAlign = "center"; 
        this.ctx.fillText("YOU WIN", (this.canvas.width/2)+6, (this.canvas.height/2)+6);

        this.ctx.font = '70px "Press Start 2P"'
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText("YOU WIN", this.canvas.width/2, this.canvas.height/2);
        this.ctx.restore();
    }
    public load( map : RayMap, camera : RayCamera, resolution : number, fovDeg : number ) : void {
        console.log('Game');

        this.map = <RayMap> Object.assign(new RayMap({}), map);
        this.map.loadTextures();
        this.map.loadSprites();
        this.map.loadPlayer();

        this.camera = camera;
        this.camera.fov = fovDeg*Math.PI/180;

        this.player = this.map.player;
        this.camera.direction = this.player.direction;
        this.camera.position.x = this.player.position.x;
        this.camera.position.y = this.player.position.y;

        this.controls = new Controls();

        this.miniMap = new MiniMap({});
        this.miniMap.LoadMap(this.map);
        this.renderer = new RaycastRenderer({
            width: this.canvas.width,
            height: this.canvas.height,
            resolution: resolution,
            textureSmoothing: false,
            domElement: this.canvas
        });
        this.renderer.skyColor = this.map.skyColor;
        this.renderer.floorColor = this.map.floorColor;

        this.hud = new HUD();
    } 

    public reload() : void {
        this.map.loadTextures();
        this.map.loadSprites();
        this.map.loadPlayer();
        this.player = this.map.player;
        this.camera.direction = this.player.direction;
        this.camera.position.x = this.player.position.x;
        this.camera.position.y = this.player.position.y;
        this.miniMap = new MiniMap({});
        this.miniMap.LoadMap(this.map);
    }
}

class MiniMap {
    public target = undefined;
    public ctx;
    public width = 22;
    public height = 22;
    public cellSize = 4;
    public mapPos = {x: - this.width*2, y: -this.height*2};
    
    constructor( options : { [propName: string]: any }) {
        if (options){
          for (var prop in options)
            if (this.hasOwnProperty(prop))
              this[prop] = options[prop];
        }
        if(this.target === undefined) {
            this.target = document.createElement('canvas');
            this.target.width = this.width * this.cellSize;
            this.target.height = this.height * this.cellSize;
            this.ctx = this.target.getContext('2d');
        }
    }
  
    public LoadMap ( map : RayMap) {
      if(this.width != map.width){
        this.width = map.width;
        this.target.width = this.width * this.cellSize;
      }
      if(this.height != map.height){
        this.height = map.height;
        this.target.height = this.height * this.cellSize;
      }
      this.mapPos = {x: - this.width*2, y: -this.height*2};
      this.ctx.fillStyle = '#00dcd3';

      for(let y = 0; y < this.height; y++){
        for(let x = 0; x < this.width; x++){
            let block = map.walls[(this.height - y - 1)*map.width + (this.width - x - 1)];
            let px = this.width - x  - 1;
            let py = this.height - y - 1;
            if( block == 0 || map.threisDoor( px, py ) )
                this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }
    
    public RenderRelPlayer (ctx, playerPos){
      let pX = (this.width - (playerPos.x | 0) - 1) * this.cellSize;
      let pY = (this.height - (playerPos.y | 0) - 1) * this.cellSize;
      ctx.drawImage(this.target, -pX, -pY, this.target.width, this.target.height);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, this.cellSize, this.cellSize);
    }
    
    public RenderRelMap (ctx, playerPos){
      let pX = (this.width - (playerPos.x | 0) - 1) * this.cellSize;
      let pY = (this.height - (playerPos.y | 0) - 1) * this.cellSize;
      ctx.drawImage(this.target, this.mapPos.x, this.mapPos.y, this.target.width, this.target.height);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect( this.mapPos.x + pX, this.mapPos.y + pY, this.cellSize, this.cellSize);
    }
}

class HUD {
    private score : HTMLElement;
    private lives : HTMLElement;
    private health : HTMLElement;
    private ammo : HTMLElement;
    private arms : HTMLElement;
    private avatar : HTMLElement;
    private imgsSrc = ["res/hud/head1_1.png", "res/hud/head1_2.png", "res/hud/head1_3.png",
                    "res/hud/head2_1.png", "res/hud/head2_2.png", "res/hud/head2_3.png",
                    "res/hud/head3_1.png", "res/hud/head3_2.png", "res/hud/head3_3.png",
                    "res/hud/head4_1.png", "res/hud/head4_2.png", "res/hud/head4_3.png"];
    private imgs = [];
    private img;
    private headState : number = 1;
    private index : number = 0;
    private timeout = -1;

    constructor() {
        this.score = document.getElementById("score");
        this.lives = document.getElementById("lives");
        this.health = document.getElementById("health");
        this.ammo = document.getElementById("ammo");
        this.arms = document.getElementById("arms");
        this.avatar = document.getElementById("avatar");
        for( let i=0; i< this.imgsSrc.length; i++ ){
            this.imgs[i] = new Image();
            this.imgs[i].src = this.imgsSrc[i];
            this.imgs[i].width = 65;
            this.imgs[i].height = 70;
        }
        this.img = this.imgs[1];
    }

    public update( p : Player ) : void {
        this.avatar.innerHTML = "";
        this.checkHealth( p );
        this.printHead();
        this.avatar.appendChild( this.img );

        this.score.innerHTML =  p.score.toString();
        this.lives.innerHTML = p.lives.toString();
        this.health.innerHTML = p.health.toString() + "%";
        this.ammo.innerHTML = p.weaponManager.getWeapon().ammo + "";
        let buttons = this.arms.getElementsByTagName("button");
        for(let i=0; i < buttons.length; i++){
            if( i == p.weaponManager.index ){
                buttons[i].style.backgroundColor = "#8a00009e"
            } else {
                buttons[i].style.backgroundColor = "#00000000"
            }
        }
        if( this.timeout == -1 ){
            this.timeout = setTimeout(this.moveHead.bind(this), 1000);
        }
    }

    private printHead() : void {
        switch( this.index ){
            case 0:
                this.img = this.imgs[ 0 + this.headState ];
                break;
            case 1:
                this.img = this.imgs[ 3 + this.headState ];
                break;
            case 2:
                this.img = this.imgs[ 6 + this.headState ];
                break;
            case 3:
                this.img = this.imgs[ 9 + this.headState ];
                break;
        }
    }
    private checkHealth( p : Player ) : void {
        if( p.health <= 20 ) this.index = 3;
        else if( p.health <= 40 ) this.index = 2;
        else if( p.health <= 70 ) this.index = 1;
        else if( p.health <= 100 ) this.index = 0;
    }
    private moveHead() : void {
        this.headState = Math.floor(Math.random() * 3);
        this.timeout = -1;
    }
}