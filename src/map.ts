class Texture {
    public width : number = 0;
    public height : number = 0;
    public x : number = -1;
    public y : number = -1;
    public img : HTMLImageElement;
    public src : string;
    public type : string;
    
    constructor ( options : { [propName: string]: any } ){
        if (options){
            for (var prop  in options)
              if (this.hasOwnProperty(prop) )
                this[prop] = options[prop];
              if(options.hasOwnProperty('src')){
                this.src = options.src ;
                this.img = new Image();
                this.img.src = options.src;
                this.img.onload = () => {
                    this.width = this.img.naturalWidth;
                    this.height = this.img.naturalHeight;
                }
              }
          }
          this.type = "Wall";
    }
    public update ( cam : RayCamera, map :RayMap ) : void {
    }
    public setPosition ( x : number, y: number ) : void {
        this.x = x;
        this.y = y;
    } 

}
class Door1Texture extends Texture {
    public imgs : HTMLImageElement [] = [];
    public map : RayMap;
    public wallCode : number = 0;
    private sound : HTMLAudioElement;
    private openCount : number = 0;
    private isOpen : boolean = false;

    constructor ( options : { [propName: string]: any }, x : number, y : number ) {
        super( options );
        for( let i=0; i<=4; i++ ){
            this.imgs[i] = new Image();
            this.imgs[i].src = "res/doors/0/"+i+".png";
        } 
        this.imgs[0].onload = () => {
            this.width = this.img.naturalWidth;
            this.height = this.img.naturalHeight;
        }
        this.img = this.imgs[0];
        this.sound = new Audio("res/doors/Door.wav");
        this.sound.playbackRate = 1.5;
        this.x = x;
        this.y = y;
        this.type = "door1";
    }
    public update ( cam : RayCamera, map :RayMap ) : void {
        let xInc : number = cam.position.x - this.x;  
        let yInc : number = cam.position.y - this.y;  
        let distanceToPlayer : number = Math.sqrt(xInc*xInc + yInc*yInc);
        if( distanceToPlayer < 1.5 && !this.isOpen && this.openCount == 0 ) { 
            this.map = map;
            this.wallCode = this.map.get( this.x, this.y);
            this.open();
            this.sound.play();
        } 
        if( distanceToPlayer >= 2 && this.isOpen && this.openCount == 0 ) { 
            this.close();
            this.sound.play();
        }
    }
    // Animazione apertura
    private open() : void {
        if( this.openCount > 4 ){
            this.wallCode = this.map.set( this.x, this.y, 0 );
            this.isOpen = true;
            this.openCount = 0;
            return;
        }
        this.img = this.imgs[this.openCount];
        this.openCount++;
        setTimeout( this.open.bind( this ), 50 );
    }
    // Animazione chiusura
    private close() : void {
        if( this.openCount > 4 ){
            this.isOpen = false;
            this.openCount = 0;
            return;
        }
        this.map.set( this.x, this.y, this.wallCode );
        this.img = this.imgs[ 4-this.openCount ];
        this.openCount++;
        setTimeout( this.close.bind( this ), 50 );
    }

}
class Door2Texture extends Texture {
    public imgs : HTMLImageElement [] = [];
    public map : RayMap;
    public wallCode : number = 0;

    private openCount : number = 0;
    private isOpen : boolean = false;
    private sound : HTMLAudioElement;
    constructor ( options : { [propName: string]: any }, x : number, y : number ) {
        super( options );
        for( let i=0; i<=4; i++ ){
            this.imgs[i] = new Image();
            this.imgs[i].src = "res/doors/1/"+i+".png";
        } 
        this.imgs[0].onload = () => {
            this.width = this.img.naturalWidth;
            this.height = this.img.naturalHeight;
        }
        this.img = this.imgs[0];
        this.sound = new Audio("res/doors/Door.wav");
        this.sound.playbackRate = 1.5;
        this.x = x;
        this.y = y;
        this.type = "door2";
    }

    public update ( cam : RayCamera, map :RayMap ) : void {
        let xInc : number = cam.position.x - this.x;  
        let yInc : number = cam.position.y - this.y;  
        let distanceToPlayer : number = Math.sqrt(xInc*xInc + yInc*yInc);
        if( distanceToPlayer < 1.5 && !this.isOpen && this.openCount == 0 ) { 
            this.map = map;
            this.wallCode = this.map.get( this.x, this.y);
            this.open();
            this.sound.play();
        } 
        if( distanceToPlayer >= 2 && this.isOpen && this.openCount == 0 ) { 
            this.close();
            this.sound.play();
        }
    }
    // Animazione apertura
    private open() : void {
        if( this.openCount > 4 ){
            this.wallCode = this.map.set( this.x, this.y, 0 );
            this.isOpen = true;
            this.openCount = 0;
            return;
        }
        this.img = this.imgs[this.openCount];
        this.openCount++;
        setTimeout( this.open.bind( this ), 50 );
    }
    // Animazione chiusura
    private close() : void {
        if( this.openCount > 4 ){
            this.isOpen = false;
            this.openCount = 0;
            return;
        }
        this.map.set( this.x, this.y, this.wallCode );
        this.img = this.imgs[ 4-this.openCount ];
        this.openCount++;
        setTimeout( this.close.bind( this ), 50 );
    }

}
interface Step {
    x? : number;
    y? : number;
    length2? : number;
    cell? : number;
    distance? : number;
    shading? : number;
    offset? : number;
}
class RayMap {
    public name : string;
    public walls : number[] = [];
    public sprites : Sprite[] = [];
    public player : Player;
    public light = 2;
    public skyBox = undefined; // img sky
    public width = 0;
    public height = 0;
    public outdoors = false;
    public wallTextures : Texture []= [];
    public skyColor : string;
    public floorColor : string;

    constructor ( options : { [propName: string]: any } ) {
        if (options){
            for (var prop in options)
                if (this.hasOwnProperty(prop))
                    this[prop] = options[prop];
        }
        this.player = new Player( { position : { x : -1, y : -1}});
        this.name = Math.floor((Math.random() * 100000) + 1) +" ";
    }

    public get ( x : number, y : number) : number {
        x = x | 0;
        y = y | 0;
        if(x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
        return this.walls[y * this.width + x];
    }
    public getSprite ( x : number, y : number) : boolean {
        for( let i=0; i<this.sprites.length; i++){
            if( this.sprites[i].position.x == x && this.sprites[i].position.y == y  )
                return true;
        } 
        return false;
    }
    public threisDoor ( x : number, y : number) : boolean {
        for( let i=0; i<this.wallTextures.length; i++){
            if( this.wallTextures[i].x == x && this.wallTextures[i].y == y && this.isDoor(this.wallTextures[i]) )
                return true;
        } 
        return false;
    }
    public loadPlayer () : Player {
        this.player = new Player( { position : { x : this.player.position.x, y : this.player.position.y}});
        return this.player;
    }
    public removeSprite ( x : number, y : number) : boolean {
        for( let i=0; i<this.sprites.length; i++){
            if( this.sprites[i].position.x == x && this.sprites[i].position.y == y  ){
                this.sprites.splice(i,1);
                return true;
            }
        } 
        return false;
    }
    public removeTexture ( x : number, y : number) : boolean {
        for( let i=0; i<this.wallTextures.length; i++){
            if( this.wallTextures[i].x == x && this.wallTextures[i].y == y  ){
                this.wallTextures.splice(i,1);
                return true;
            }
        } 
        return false;
    }
    
    public set ( x : number, y : number, num : number) : number {
        x = x | 0;
        y = y | 0;
        if(x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
        let prec : number = this.walls[y * this.width + x];
        this.walls[y * this.width + x] = num;
        return prec;
    }
    public setPlayer( x : number, y : number ) {
        this.player = new Player({});
        this.player.position = { x : x, y : y };
    }

    public initMap() : void {
        for( let i=0; i<this.width; i++ )
            for( let j=0; j<this.height; j++ )
                if( i == 0 || j == 0 || i == this.width-1 || j == this.height-1 )
                    this.set( i, j, -1 );
                else
                    this.set( i, j, 0 );

    }
    public raycast (point : { x : number, y : number }, angle : number, 
                    range : number, fullRange : boolean, layer : string) : Step [] {
        if(fullRange === undefined)
            fullRange = false;
        if(!layer)
            layer = 'walls';
        let cells : Step [] = [];
        let sin : number = Math.sin(angle);
        let cos : number = Math.cos(angle);
        
        let stepX : Step;
        let stepY : Step;
        let nextStep : Step = { x: point.x, y: point.y, cell: 0, distance: 0 };
        do{
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
    }
    public step (rise : number, run : number, x : number, y : number, inverted : boolean) : Step {
      if (run === 0) 
        return { 
            length2: Infinity 
        };
      let dx : number = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
      let dy : number = dx * rise / run;
      return {
        x: inverted ? y + dy : x + dx,
        y: inverted ? x + dx : y + dy,
        length2: dx * dx + dy * dy
      };
    }
    
    public inspect (step : Step, shiftX : number, shiftY : number, distance : number, 
                                        offset : number, cos : number, sin : number, layer : string) : Step {
        let dx : number = cos < 0 ? shiftX : 0;
        let dy : number = sin < 0 ? shiftY : 0;
        let index = (((step.y - dy) | 0) * this.width) + ((step.x - dx) | 0);
        step.cell = (index < 0 || index >= this[layer].length) ? -1 : this[layer][index];
        
        step.distance = distance + Math.sqrt(step.length2);
        if( this.outdoors ){
            if (shiftX) 
                step.shading = cos < 0 ? 2 : 0;
            else 
                step.shading = sin < 0 ? 2 : 1;
        } else {
            step.shading = 0;
        }
        step.offset = offset - (offset | 0);
        return step;
    }
    public raycastSpite (camera : RayCamera, width : number, sprite : Sprite ): { screenX : number, distance : number } {
      // Try to render a sprite
      let xInc : number = sprite.position.x /*+ 0.5*/ - camera.position.x;  // theSprites<i>.x = sprites x coordinate in game world, x = player's x coordinate in world
      let yInc : number = sprite.position.y + 0.5 - camera.position.y;  // Same as above
      let Distance : number = Math.sqrt(xInc*xInc + yInc*yInc);
      let thetaTemp = Math.atan2(yInc, xInc);  // Find angle between player and sprite
      thetaTemp *= 180/Math.PI;  // Convert to degrees	if (thetaTemp < 0) thetaTemp += 360;  // Make sure its in proper range
      //console.log(thetaTemp);
      if (thetaTemp < 0) thetaTemp += 360; 
      // Wrap things around if needed
      // Angle  è in rad
      let angle = camera.direction * 180/Math.PI;
      let fov = camera.fov * 180/Math.PI;

      let yTmp = angle + fov/2 - thetaTemp;  // angle = angle of ray that generates leftmost collum of the screen
      //console.log(yTmp);
      if (thetaTemp > 270 && angle < 90) yTmp = angle + fov/2 - thetaTemp + 360;
      if (angle > 270 && thetaTemp < 90) yTmp = angle + fov/2 - thetaTemp - 360;
    
      // Compute the screen x coordinate
      let xTmp = yTmp * width / fov;
      //console.log(camera.direction);
      sprite.distanceToPlayer = Distance;
      return {
        screenX : width - xTmp,
        distance : Distance,
      }
    }

    public raycastSprites( camera : RayCamera, screen_width : number ) : 
                                { screenX : number, distance : number, sprite : Sprite } [] {
      let res : { screenX : number, distance : number, sprite : Sprite } [] = [];
      for(let i=0; i<this.sprites.length; i++){
        let sprite : Sprite = this.sprites[i]
        let val = this.raycastSpite (camera, screen_width, sprite );
        res.push({
          screenX : val.screenX,
          distance : val.distance,
          sprite : sprite
        });
      }
      return res;
    }

    public moveSprites( cam : RayCamera ) {
      for( let i=0; i<this.sprites.length; i++ )
        this.sprites[i].move( cam, this );
    }
    public updateSprites( state : Controls, pl : Player, map : RayMap ) {
        for( let i=0; i<this.sprites.length; i++ )
          this.sprites[i].update( state, pl, map );
    }

    public allSpritesDead( ) : boolean {
        for( let i=0; i<this.sprites.length; i++ ) {
          if( this.sprites[i].killed == false )
            return false;
        }
        return true;

    }

    public updateTextures( cam : RayCamera ) {
        for( let i=0; i<this.wallTextures.length; i++ )
            this.wallTextures[i].update( cam , this );
    }

    public loadTextures() : void {
        for(let i=0; i<this.wallTextures.length; i++){
            this.wallTextures[i] = this.copyTexture( this.wallTextures[i] );
        }
    }
    public copyTexture( t : Texture ) : Texture {
        let texture : Texture;
        switch ( t.type ) {
            case "Wall":
                texture = new Texture( {
                    src : t.src
                });
                break;
            case "door1": {
               texture = new Door1Texture( {}, t.x, t.y );
            }  break;
            case "door2": {
                texture = new Door2Texture( {}, t.x, t.y );
             }  break;
        }
        return texture;
    }
    public isDoor( t : Texture ) : boolean {
        switch ( t.type ) {
            case "door1":
            case "door2":
               return true;
        }
        return false;
    }

    public loadSprites() : void {
        for(let i=0; i<this.sprites.length; i++){
            this.sprites[i] = this.copySprite( this.sprites[i] );
        }
    }
    public copySprite( s : Sprite ) : Sprite {
        let sprite : Sprite;
        switch ( s.type ) {
            case "Sprite":
                sprite = new Sprite( {
                    src : s.src,
                    position : { x : s.position.x, y : s.position.y }
                });
                break;
            case "GuardSprite":
                sprite = new GuardSprite( {
                    position : { x : s.position.x, y : s.position.y }
                });
                break;
            case "SSSprite":
                sprite = new SSSprite( {
                    position : { x : s.position.x, y : s.position.y }
                });
                break;
            case "HSprite":
                sprite = new HSprite( {
                    position : { x : s.position.x, y : s.position.y }
                });
                break;
        }
        return sprite;
    }

    public saveOnLocalStorage() : void {
        if( this.player.position.x == -1 )
            this.player = new Player( { position : { x : 2, y : 2}});

        let obj= localStorage.getItem('levels');
        if( obj != undefined) {
            let array = JSON.parse(obj);
            array.push(this);
            localStorage.setItem('levels', JSON.stringify(array));
        } else {
            let array = new Array();
            array.push(this);
            localStorage.setItem('levels', JSON.stringify(array));
        }
        
    }
    public isSavedOnLocalStorage( mapName : string ) : boolean {
        let obj= localStorage.getItem('levels');
        if( obj != undefined) {
            let array = JSON.parse(obj);
            for( let i=0; i<array.length; i++)
                if( array[i].name == mapName )
                    return true;
        }
        return false;
        
    }
}