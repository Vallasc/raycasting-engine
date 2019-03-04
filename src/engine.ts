// The Camera
class RayCamera {
  public fov : number = Math.PI * 0.4;
  public range : number = 14;
  public spriteRange : number = 14;
  public lightRange : number = 5;
  public position : {x : number, y : number } = { x: 0, y: 0 };
  public direction : number = Math.PI * 0.5;

  constructor( options : { [propName: string]: any }) {
    if (options){
      for (var prop in options)
        if (this.hasOwnProperty(prop))
          this[prop] = options[prop];
    }

  }
  public Rotate( angle : number ) {
    this.direction = (this.direction + angle + CIRCLE) % (CIRCLE);
  }
}

// The Render Engine
class RaycastRenderer {
  public width : number = 600;
  public height : number = 600;
  public resolution : number = 320;
  public textureSmoothing : boolean = false;
  public domElement : HTMLCanvasElement = document.createElement('canvas');
  public spacing : number;
  public ctx : CanvasRenderingContext2D;
  public skyColor : string = "#383838";
  public floorColor : string = "#747474";

  constructor ( options : { [propName: string]: any } ) {
    if (options){
      for (var prop in options)
        if (this.hasOwnProperty(prop))
          this[prop] = options[prop];
    }

    this.domElement.width = this.width;
    this.domElement.height = this.height;
    this.ctx = this.domElement.getContext('2d');
    this.spacing = this.width / this.resolution;
  }

  public changeDim(width : number, height : number ) : void {
    this.width = width;
    this.height = height;
    this.spacing = this.width / this.resolution;
  }

  public changeRes(res : number ) : void {
    this.resolution = res;
    this.spacing = this.width / this.resolution;
  }

  public project( height : number, angle : number, distance : number ) : { top : number, height : number } {
    let z : number = distance * Math.cos(angle);
    let wallHeight : number = this.height * height / z;
    let bottom : number = this.height / 2 * (1 + 1/z);
    return {
      top: bottom - wallHeight,
      height: wallHeight
    };
  }
  
  public drawSky(camera : RayCamera, map : RayMap) : void {
    if(map.skyBox && map.skyBox.img){
      let width : number = this.width * (CIRCLE / camera.fov);
      let left : number = -width * camera.direction / CIRCLE;
      
      this.ctx.save();
      this.ctx.drawImage(map.skyBox.img, left, 0, width, this.height);
      
      if (left < width - this.width)
        this.ctx.drawImage(map.skyBox.img, left + width, 0, width, this.height);
      
      if (map.light > 0){
        this.ctx.fillStyle = '#ffffff';
        this.ctx.globalAlpha = map.light * 0.1;
        this.ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);
      }
      
      this.ctx.restore();
    }
  }
  public drawSkyAndFloor() : void {
    this.ctx.save();
    this.ctx.fillStyle = this.skyColor;
    this.ctx.fillRect(0, 0, this.width, Math.ceil(this.height * 0.5) );
    this.ctx.fillStyle = this.floorColor;
    this.ctx.fillRect(0, Math.floor(this.height * 0.5), this.width, Math.ceil(this.height * 0.5));  
    this.ctx.restore();
  }
  
  public drawColumn(column : number, ray : Step , angle : number, camera : RayCamera, textures : Texture[]) : void {
    let left : number = Math.floor(column * this.spacing);
    let width :number = Math.ceil(this.spacing);

    let texture : Texture;
    let textureX :number = 0;
    let step : Step = ray;

    //muro fittizio
    if( step.cell == -1 ){
      let wall : { top : number, height : number } = this.project(1, angle, step.distance);
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect( left, wall.top, width, wall.height);
      return;
    }

    texture = textures[step.cell > textures.length ? 0 : step.cell - 1];
    //console.log(step.cell);
    textureX = (texture.width * step.offset) | 0;
    let wall : { top : number, height : number } = this.project(1, angle, step.distance);
    this.ctx.globalAlpha = 1;
    this.ctx.drawImage(texture.img, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
    //this.ctx.drawImage(texture.img, textureX, 0, 1, texture.height, left, wall.top-wall.height, width, wall.height);
    //this.ctx.drawImage(texture.img, textureX, 0, 1, texture.height, left, wall.top-2*wall.height, width, wall.height);
    this.ctx.fillStyle = '#000000';
    this.ctx.globalAlpha = Math.max((step.distance + step.shading) / camera.lightRange, 0);
    this.textureSmoothing ?
        this.ctx.fillRect(left, wall.top, width, wall.height)
      : this.ctx.fillRect(left | 0, wall.top | 0, width, wall.height + 1);
  }
  
  public drawColumns(camera : RayCamera, map : RayMap) : void {
    let repeat : boolean;
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = this.textureSmoothing;

    let rays = [];
    for(let col = 0; col < this.resolution; col++){
      let angle = camera.fov * (col / this.resolution - 0.5);
      let ray = map.raycast(camera.position, camera.direction + angle, camera.range, false, "walls");

      let hit : number = -1;
      while(++hit < ray.length && ray[hit].cell == 0);
      if(hit < ray.length){
        rays.push({ray : ray[hit], col : col, angle : angle});
      }
    }
    // Sprite con le relative distanze dal giocatore
    let xsprite = map.raycastSprites(camera, this.width );
    // Devo ordinare in base alle distanze cosi posso disegnare alla giusta 
    // profondità gli sprite
    rays.sort(function(a, b){return b.ray.distance-a.ray.distance});

    let drx = camera.range;
    let dry = camera.range;
    if ( rays[0] != undefined ) {
      drx = Math.abs( camera.position.x - rays[0].ray.x ) /*+ 0.5*/;
      dry = Math.abs( camera.position.y - rays[0].ray.y ) + 0.5;
    }

    xsprite.sort(function(a, b){return b.distance-a.distance});

    let done = xsprite.length;
    let j = 0; // Scorro gli sprite
    // Disegno i raggi e gli sprite
    repeat = true;
    for(let i = 0; i< rays.length ; i++){
      // disegno le colonne dei muri
      if( repeat )
        this.drawColumn(rays[i].col, rays[i].ray, rays[i].angle, camera, map.wallTextures);
      // disegno gli sprites
      if( ( j < done ) && ( rays[i].ray.distance <= xsprite[j].distance || i == rays.length-1) ) {
        // calcolo le proporzioni
        let h : { top : number, height : number } = this.project(1, 0, xsprite[j].distance);
        let dx = Math.abs(camera.position.x - xsprite[j].sprite.position.x);
        let dy = Math.abs(camera.position.y - xsprite[j].sprite.position.y);
        if( ( dx < drx && dy < dry ) && 
          ( xsprite[j].screenX > -h.height && xsprite[j].screenX < this.width+h.height) &&
          ( xsprite[j].distance < camera.spriteRange ) ) {
            this.ctx.save();
            this.ctx.globalAlpha = 1;
            this.ctx.drawImage(xsprite[j].sprite.img, xsprite[j].screenX, this.height/2-h.height/2, h.height, h.height);
            this.ctx.restore();
        } else {
          //xsprite[j].sprite.distanceToPlayer = Infinity;
        }
        // Lo sto mirando
        if( this.width/2 - h.height*0.8 < xsprite[j].screenX  && xsprite[j].screenX < this.width/2 - h.height*0.2 ){
          xsprite[j].sprite.isTargeted = true;
        } else {
          xsprite[j].sprite.isTargeted = false;
        }
        j++;
      }
      // Per stampare gli tutti gli sprite se siamo arrivati alla fine dell'array
      if( j < done && i == rays.length-1 ){
        i--;
        repeat = false;
      }
    }
    this.ctx.restore();

  }
  
  public Render(camera : RayCamera, map : RayMap) : void {
      //this.drawSky(camera, map);
      this.drawSkyAndFloor();
      if (map.wallTextures.length > 0)
        this.drawColumns(camera, map);
  }
  
}