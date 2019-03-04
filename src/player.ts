
class Player {
    public position = {x: -1, y: -1};
    public direction : number = Math.PI * 0.3;
    public shooted : boolean = false;

    public deadSound : HTMLAudioElement;
    public dead : boolean = false;
    public score : number = 0;
    public lives : number = 3;
    public health : number = 100;

    public weaponManager : WeaponManaager;
    public img : HTMLImageElement;

    constructor( options : { [propName: string]: any }) {
        if (options){
          for (var prop in options)
            if (this.hasOwnProperty(prop))
              this[prop] = options[prop];
        }
        this.img = new Image();
        this.img.src = "res/sprites/me/0.png"
        this.deadSound = new Audio("res/sounds/Player_Dies.wav")
        this.weaponManager = new WeaponManaager();
    }

    public rotate (angle, camera) {
      this.direction = (this.direction + angle + CIRCLE) % (CIRCLE);
      camera.direction = this.direction;
    }
    public walk (distance, map, camera) {
      var dx = Math.cos(this.direction) * distance;
      var dy = Math.sin(this.direction) * distance;
      if (map.get(this.position.x + dx, this.position.y) == 0 ) this.position.x += dx;
      if (map.get(this.position.x, this.position.y + dy) == 0 ) this.position.y += dy;
      camera.position.x = this.position.x;
      camera.position.y = this.position.y;
    }

    public update(controls, map, seconds, camera) {
      if (controls.left) this.rotate(-Math.PI * seconds, camera);
      if (controls.right) this.rotate(Math.PI * seconds, camera);
      if (controls.forward) this.walk(3 * seconds, map, camera);
      if (controls.backward) this.walk(-3 * seconds, map, camera);
      this.shooted = false;
      if( this.health <= 0 ){
         this.dead = true;
         this.health = 100;
         this.lives--;
      }
    }
}

class Sprite {
  public type : string;
  public src : string;
  public img : HTMLImageElement;
  public position : {x : number, y : number } = { x: 10, y: 10 };
  public distanceToPlayer : number;
  // E' mirato 
  public isTargeted : boolean;
  public killed : boolean = true;

  constructor ( options : { [propName: string]: any } ){
    this.type = "Sprite";
    this.distanceToPlayer = Infinity;
    if (options){
      for (var prop  in options)
        if (this.hasOwnProperty(prop) )
          this[prop] = options[prop];
        if(options.hasOwnProperty('src')){
          this.img = new Image();
          this.img.src = options.src;
          this.src = options.src;
        }
    }
  }

  public load() {
    this.img = new Image();
    this.img.src = this.src;
  }

  public setPosition ( x : number, y: number ) : void {
    this.position.x = x;
    this.position.y = y;
  }  

  public move ( cam : RayCamera, map : RayMap ) : void {
  }

  public update ( state : Controls, player : Player, map : RayMap ) : void {
  }

}

class Controls {
  private codes  = { 37: 'left', 39: 'right', 38: 'forward', 40: 'backward', 32:'space'};
  public states = { 'left': false, 'right': false, 'forward': false, 'backward': false, 'space': false };
  public mouse = { 'lastX' : 0, 'offset' : 0};

  constructor() {
    document.addEventListener('keydown', this.onKey.bind(this, true), false);
    document.addEventListener('keyup', this.onKey.bind(this, false), false);
    document.addEventListener('mousemove', this.onMove.bind(this), false);
  }
  
  private onKey ( val, e ) {
    var state = this.codes[e.keyCode];
    if (typeof state === 'undefined') return;
    this.states[state] = val;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
  }
  private onMove( e ) : void {
    this.mouse.offset += Math.abs( this.mouse.lastX - e.clientX ); 
  }

}
  

class GuardSprite extends Sprite {
    private walking : boolean;
    private shooting : boolean;

    public deadImg : HTMLImageElement [] = [];
    private deadCount : number = 0;
    public walkImg : HTMLImageElement [] = [];
    private walkCount : number = 0;
    public fireImg : HTMLImageElement;
    public restImg : HTMLImageElement;

    private gunSound : HTMLAudioElement;
    private deathSound : HTMLAudioElement;
    private minDistanceFire : number;
    private minDistanceWalk : number;

    constructor ( options : { [propName: string]: any } ){
        super( options );
        this.type = "GuardSprite";
        this.isTargeted = false;

        for( let i=0; i<4; i++ ){
          this.deadImg[i] = new Image();
          this.deadImg[i].src = "res/sprites/mguard/1_"+i+".png";
          this.walkImg[i] = new Image();
          this.walkImg[i].src = "res/sprites/mguard/0_"+i+".png";
        } 
        this.fireImg = new Image();
        this.fireImg.src = "res/sprites/mguard/2_1.png";
        this.restImg = new Image();
        this.restImg.src = "res/sprites/mguard/2_3.png";

        this.gunSound = new Audio('res/sprites/mguard/gun.wav');
        this.deathSound = new Audio('res/sprites/mguard/death.wav');

        this.img = this.restImg;
        this.killed = false;
        this.walking = false;
        this.shooting = false;
        this.minDistanceFire = 1.5;
        this.minDistanceWalk = 4;
    }

    //@override chimata ad ogni frame
    public move (cam : RayCamera, map : RayMap ) : void {
        if ( cam === undefined || map === undefined ) return;
        if ( this.killed ) return;
        if ( ! this.walking ) return;
        let prevX = this.position.x;
        let prevY = this.position.y;
        let xInc : number = this.position.x - cam.position.x; 
        let yInc : number = this.position.y - cam.position.y;
        let Distance : number = Math.sqrt(xInc*xInc + yInc*yInc);
        let thetaTemp = Math.atan2(yInc, xInc); 
        let cost = Math.abs(Math.cos(thetaTemp));
        let sent = Math.abs(Math.sin(thetaTemp));

        let wallFlag = 0;
        if( cam.position.x > this.position.x + 1 )
          if( map.get(this.position.x + 1/40*cost, this.position.y) == 0 ) { 
            this.position.x += 1/40*cost;
          } else {
            wallFlag++;
          }
        if( cam.position.x < this.position.x - 1 ) 
          if( map.get(this.position.x - 1/40*cost, this.position.y) == 0) { 
            this.position.x -= 1/40*cost;
          }else { 
            wallFlag++;
          }
        if( cam.position.y > this.position.y + 1 )
          if( map.get(this.position.x, this.position.y + 1/40*sent) == 0 ) { 
            this.position.y += 1/40*sent;
          } else {
            wallFlag++;
          }
        if( cam.position.y < this.position.y - 1 )
          if( map.get(this.position.x, this.position.y - 1/40*sent) == 0 ) {
            this.position.y -= 1/40*sent;
          } else {
            wallFlag++;
          }

        if( Distance < this.minDistanceFire && prevX == this.position.x 
                                      && prevY == this.position.y && wallFlag == 0) 
          this.shooting = true;
    }
    
    public update ( state : Controls, player : Player, map : RayMap ) : void {
      // Appena lo vedo si muove
      if( this.distanceToPlayer < this.minDistanceWalk && !this.killed && !this.walking ) {
        this.walking = true;
        this.walk();
      }
      // sparo se sono vicino
      if( this.distanceToPlayer < this.minDistanceWalk && !this.killed && this.walking && this.shooting ) {
        this.shooting = false;
        this.shoot();
        // 1/10 di probabilità
        if( Math.floor(Math.random()*10) == 0) {
            player.health -= 1;
            player.shooted = true;
            // riproduce il suono pistola
            this.gunSound.pause();
            this.gunSound.currentTime = 0;
            this.gunSound.play();
        }
      }
      if( this.distanceToPlayer <  player.weaponManager.getWeapon().range && this.isTargeted 
        && player.weaponManager.getWeapon().firing && !this.killed ) {
        this.killed = true;
        this.walking = false;
        this.dead();
        player.score++;
        // suono morte
        this.deathSound.play();
      }
    }

    // Animazione della morte
    private dead() : void {
      if( this.deadCount > 3 ) return;
      this.img = this.deadImg[this.deadCount];
      this.deadCount++;
      setTimeout( this.dead.bind( this ), 200 );
    }
    // Animazione della camminata
    private walk() : void {
      if( ! this.walking ) return;
      this.img = this.walkImg[this.walkCount];
      this.walkCount++;
      setTimeout( this.walk.bind( this ), 300 );
      if( this.walkCount > 3 ) this.walkCount = 0;
    }
    // Animazione dello sparo
    private shoot() : void {
      this.img = this.fireImg;
    }
}
class SSSprite extends Sprite {
  private walking : boolean;
  private shooting : boolean;

  public deadImg : HTMLImageElement [] = [];
  private deadCount : number = 0;
  public walkImg : HTMLImageElement [] = [];
  private walkCount : number = 0;
  public fireImg : HTMLImageElement;
  public restImg : HTMLImageElement;

  private gunSound : HTMLAudioElement;
  private deathSound : HTMLAudioElement;
  private minDistanceFire : number;
  private minDistanceWalk : number;

  constructor ( options : { [propName: string]: any } ){
      super( options );
      this.type = "SSSprite";
      this.isTargeted = false;

      for( let i=0; i<4; i++ ){
        this.deadImg[i] = new Image();
        this.deadImg[i].src = "res/sprites/mSS/1_"+i+".png";
        this.walkImg[i] = new Image();
        this.walkImg[i].src = "res/sprites/mSS/0_"+i+".png";
      } 
      this.fireImg = new Image();
      this.fireImg.src = "res/sprites/mSS/2_1.png";
      this.restImg = new Image();
      this.restImg.src = "res/sprites/mSS/2_0.png";

      this.gunSound = new Audio('res/sprites/mSS/gun.wav');
      this.deathSound = new Audio('res/sprites/mSS/death.wav');

      this.img = this.restImg;
      this.killed = false;
      this.walking = false;
      this.shooting = false;
      this.minDistanceFire = 1.5;
      this.minDistanceWalk = 5;
  }

  //@override chimata ad ogni frame
  public move (cam : RayCamera, map : RayMap ) : void {
    if ( cam === undefined || map === undefined ) return;
    if ( this.killed ) return;
    if ( ! this.walking ) return;
    let prevX = this.position.x;
    let prevY = this.position.y;
    let xInc : number = this.position.x - cam.position.x; 
    let yInc : number = this.position.y - cam.position.y;
    let Distance : number = Math.sqrt(xInc*xInc + yInc*yInc);
    let thetaTemp = Math.atan2(yInc, xInc); 
    let cost = Math.abs(Math.cos(thetaTemp));
    let sent = Math.abs(Math.sin(thetaTemp));

    let wallFlag = 0;
    if( cam.position.x > this.position.x + 1 )
      if( map.get(this.position.x + 1/40*cost, this.position.y) == 0 ) { 
        this.position.x += 1/40*cost;
      } else {
        wallFlag++;
      }
    if( cam.position.x < this.position.x - 1 ) 
      if( map.get(this.position.x - 1/40*cost, this.position.y) == 0) { 
        this.position.x -= 1/40*cost;
      }else { 
        wallFlag++;
      }
    if( cam.position.y > this.position.y + 1 )
      if( map.get(this.position.x, this.position.y + 1/40*sent) == 0 ) { 
        this.position.y += 1/40*sent;
      } else {
        wallFlag++;
      }
    if( cam.position.y < this.position.y - 1 )
      if( map.get(this.position.x, this.position.y - 1/40*sent) == 0 ) {
        this.position.y -= 1/40*sent;
      } else {
        wallFlag++;
      }

    if( Distance < this.minDistanceFire && prevX == this.position.x 
                                  && prevY == this.position.y && wallFlag == 0) 
      this.shooting = true;
}
  
  public update ( state : Controls, player : Player, map : RayMap ) : void {
    // Appena lo vedo si muove
    if( this.distanceToPlayer < this.minDistanceWalk && !this.killed && !this.walking ) {
      this.walking = true;
      this.walk();
    }
    // sparo se sono vicino
    if( this.distanceToPlayer < this.minDistanceWalk && !this.killed && this.walking && this.shooting ) {
      this.shooting = false;
      this.shoot();
      // 1/10 di probabilità
      if( Math.floor(Math.random()*10) == 0) {
          player.health -= 1;
          player.shooted = true;
          // riproduce il suono pistola
          this.gunSound.pause();
          this.gunSound.currentTime = 0;
          this.gunSound.play();
      }
    }
    if( this.distanceToPlayer <  player.weaponManager.getWeapon().range && this.isTargeted 
      && player.weaponManager.getWeapon().firing && !this.killed ) {
      this.killed = true;
      this.walking = false;
      this.dead();
      player.score++;
      // suono morte
      this.deathSound.play();
    }
  }

  // Animazione della morte
  private dead() : void {
    if( this.deadCount > 3 ) return;
    this.img = this.deadImg[this.deadCount];
    this.deadCount++;
    setTimeout( this.dead.bind( this ), 200 );
  }
  // Animazione della camminata
  private walk() : void {
    if( ! this.walking ) return;
    this.img = this.walkImg[this.walkCount];
    this.walkCount++;
    setTimeout( this.walk.bind( this ), 300 );
    if( this.walkCount > 3 ) this.walkCount = 0;
  }
  // Animazione dello sparo
  private shoot() : void {
    this.img = this.fireImg;
  }
}
class HSprite extends Sprite {
  private walking : boolean;
  private shooting : boolean;

  public deadImg : HTMLImageElement [] = [];
  private deadCount : number = 0;
  public walkImg : HTMLImageElement [] = [];
  private walkCount : number = 0;
  public fireImg : HTMLImageElement;
  public restImg : HTMLImageElement;

  private gunSound : HTMLAudioElement;
  private deathSound : HTMLAudioElement;
  private minDistanceFire : number;
  private minDistanceWalk : number;

  constructor ( options : { [propName: string]: any } ){
      super( options );
      this.type = "HSprite";
      this.isTargeted = false;

      for( let i=0; i<4; i++ ){
        this.deadImg[i] = new Image();
        this.deadImg[i].src = "res/sprites/mH/1_"+i+".png";
        this.walkImg[i] = new Image();
        this.walkImg[i].src = "res/sprites/mH/0_"+i+".png";
      } 
      this.fireImg = new Image();
      this.fireImg.src = "res/sprites/mH/2_1.png";
      this.restImg = new Image();
      this.restImg.src = "res/sprites/mH/2_0.png";

      this.gunSound = new Audio('res/sprites/mH/gun.wav');
      this.deathSound = new Audio('res/sprites/mH/death.wav');

      this.img = this.restImg;
      this.killed = false;
      this.walking = false;
      this.shooting = false;
      this.minDistanceFire = 1.5;
      this.minDistanceWalk = 6;
  }

  //@override chimata ad ogni frame
  public move (cam : RayCamera, map : RayMap ) : void {
    if ( cam === undefined || map === undefined ) return;
    if ( this.killed ) return;
    if ( ! this.walking ) return;
    let prevX = this.position.x;
    let prevY = this.position.y;
    let xInc : number = this.position.x - cam.position.x; 
    let yInc : number = this.position.y - cam.position.y;
    let Distance : number = Math.sqrt(xInc*xInc + yInc*yInc);
    let thetaTemp = Math.atan2(yInc, xInc); 
    let cost = Math.abs(Math.cos(thetaTemp));
    let sent = Math.abs(Math.sin(thetaTemp));

    let wallFlag = 0;
    if( cam.position.x > this.position.x + 1 )
      if( map.get(this.position.x + 1/40*cost, this.position.y) == 0 ) { 
        this.position.x += 1/40*cost;
      } else {
        wallFlag++;
      }
    if( cam.position.x < this.position.x - 1 ) 
      if( map.get(this.position.x - 1/40*cost, this.position.y) == 0) { 
        this.position.x -= 1/40*cost;
      }else { 
        wallFlag++;
      }
    if( cam.position.y > this.position.y + 1 )
      if( map.get(this.position.x, this.position.y + 1/40*sent) == 0 ) { 
        this.position.y += 1/40*sent;
      } else {
        wallFlag++;
      }
    if( cam.position.y < this.position.y - 1 )
      if( map.get(this.position.x, this.position.y - 1/40*sent) == 0 ) {
        this.position.y -= 1/40*sent;
      } else {
        wallFlag++;
      }

    if( Distance < this.minDistanceFire && prevX == this.position.x 
                                  && prevY == this.position.y && wallFlag == 0) 
      this.shooting = true;

  }
  
  public update ( state : Controls, player : Player, map : RayMap ) : void {
    // Appena lo vedo si muove
    if( this.distanceToPlayer < this.minDistanceWalk && !this.killed && !this.walking ) {
      this.walking = true;
      this.walk();
    }
    // sparo se sono vicino
    if( this.distanceToPlayer < this.minDistanceWalk && !this.killed && this.walking && this.shooting ) {
      this.shooting = false;
      this.shoot();
      // 1/10 di probabilità
      if( Math.floor(Math.random()*10) == 0) {
          player.health -= 1;
          player.shooted = true;
          // riproduce il suono pistola
          this.gunSound.pause();
          this.gunSound.currentTime = 0;
          this.gunSound.play();
      }
    }
    if( this.distanceToPlayer <  player.weaponManager.getWeapon().range && this.isTargeted 
      && player.weaponManager.getWeapon().firing && !this.killed ) {
      this.killed = true;
      this.walking = false;
      this.dead();
      player.score++;
      // suono morte
      this.deathSound.play();
    }
  }

  // Animazione della morte
  private dead() : void {
    if( this.deadCount > 3 ) return;
    this.img = this.deadImg[this.deadCount];
    this.deadCount++;
    setTimeout( this.dead.bind( this ), 200 );
  }
  // Animazione della camminata
  private walk() : void {
    if( ! this.walking ) return;
    this.img = this.walkImg[this.walkCount];
    this.walkCount++;
    setTimeout( this.walk.bind( this ), 300 );
    if( this.walkCount > 3 ) this.walkCount = 0;
  }
  // Animazione dello sparo
  private shoot() : void {
    this.img = this.fireImg;
  }
}
class Weapon {
  public firing : boolean = false;
  public img : HTMLImageElement[] = [];
  private sound : HTMLAudioElement;
  public ammo : number;
  public range : number;

  constructor ( imgSrc : string[], audioSrc : string, ammo : number, range : number ) {
    for(let i=0; i<3; i++ ){
      this.img[i] = new Image();
      this.img[i].src = imgSrc[i];
    }
    this.sound = new Audio(audioSrc);
    this.ammo = ammo;
    this.range = range;
  }

  public isPlaying() : boolean {
    return (this.sound.duration > 0 && !this.sound.paused);
  }

  public fire() : HTMLImageElement {
    if( this.ammo > 0 ){
      if( this.sound.currentTime == this.sound.duration)
        this.firing = false;
      if( !this.firing ) {
        this.ammo--;
        this.firing = true;
      }
      this.sound.play();
      // simulo il rinculo
      if( this.sound.currentTime > this.sound.duration/2 ) {
        return this.img[2];
      } else {
        return this.img[1];
      }
    } else {
      return this.img[2];
    }
  }

  public rest() : HTMLImageElement {
    this.firing = false;
    if( this.sound.currentTime > this.sound.duration/2 ) {
      this.sound.pause();
      this.sound.currentTime = 0;
    }
    return this.img[0];
  }

}

class WeaponManaager {
  public weapons : Weapon [] = [];
  public index : number = 0;

  constructor () {
    this.weapons[0] = new Weapon(['res/weapons/1/1.png','res/weapons/1/2.png',
                                'res/weapons/1/3.png'],'res/weapons/1/MachineGun.wav', 50, 2);
    this.weapons[1] = new Weapon(['res/weapons/2/1.png','res/weapons/2/2.png',
                                'res/weapons/2/3.png'],'res/weapons/2/GatlingGun.wav', 100, 3);
    this.weapons[2] = new Weapon(['res/weapons/3/1.png','res/weapons/3/2.png',
                                'res/weapons/3/3.png'],'res/weapons/3/BossGun.wav', 150, 5);
    this.keyListener();
  } 

  public getWeapon() : Weapon {
    return this.weapons[this.index];
  }
  public paint( ctx : CanvasRenderingContext2D, state : Controls ) {
    let h = ctx.canvas.height;
    let w = ctx.canvas.width;
    let img_h = h/1.6;
    let img_w = h/1.6;
    if( state.states.space ){
      let img : HTMLImageElement = this.weapons[this.index].fire();
      ctx.drawImage( img, (w-img_w)/2, h-img_h, img_w, img_h );
    } else {
      let img : HTMLImageElement = this.weapons[this.index].rest();
      ctx.drawImage( img, (w-img_w)/2, h-img_h, img_w, img_h );
    }
  }

  private keyListener() {
    document.getElementsByTagName("body")[0].onkeydown = ( e ) => {
      switch( e.keyCode) {
        case 49 :
          this.index = 0;
          break;
        case 50 :
          this.index = 1;
          break;
        case 51 :
          this.index = 2;
          break;
      }
    }
  }

}