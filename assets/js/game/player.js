//Function for making player objects and adding them to the game
"use strict";
//If there is no game object make one
var game = game || {};
//Creates a player object that can be replicated
game.Player = function() {
  /** Player constructor
   * @param id : unique player identifier
   * @param color : player color
   * @param sockID : player's socketID
   * @param x : start x position
   * @param y : start y position
   */
  var Player = function(id, sockID, x, y, img){
    this.x = x;
    this.y = y;
    this.r = .06; //radius
    this.speed = .001; 
    this.id = id;
	  this.sockID = sockID;
    this.img = img;
    //this.color = color;
    this.mu = 0.95;
    this.target = {x:0,y:0}; //target position for the cursor
    this.startRotation = undefined;
    this.ready = false;
    this.primed = false;
  }
  //create a reference to the player prototype
  var p = Player.prototype;
  /** Update function for the player
   * @param dt : delta time for if we want to cap the frame rate
   */
  p.update = function(dt) {
    this.move(dt);
  };
  /** Move function for the player
   * @param dt : delta time for if we want to cap the frame rate
   */
  p.move = function(dt) {
    var self = this;//save a reference to this
    //make a vector with the x and y distance
    var dist = {
        x:self.x - self.target.x, 
        y: self.y - self.target.y
    };
    var normal = this.normalize(dist);//normalize the distance
    var yMag = Math.abs(dist.y);//get the magnitude of x distance
    var xMag = Math.abs(dist.x);//get the magnitude of y distance
    
    if(dist.x > .0004 || dist.x < -.0004)//if far enough away in the x direction
      this.x -= normal.x * (this.speed * xMag/100);//move to the target loaction
    if(dist.y > .0004 || dist.y < -.0004)
      this.y -= normal.y * (this.speed * yMag/100);  
    //console.log(this.x + ".." +this.y);
    //console.log(this.target);
    this.x =this.target.x;
    this.y =this.target.y;
  };
  /** Returns a normalized vector
   * @param vec : vector to be normalized
   */
  p.normalize = function(vec) {
    var norm = {x: vec.x, y: vec.y}; //make a copy of the vector
    var mag = this.getMag(norm);//get the magnitude
    norm.x = norm.x/mag;//normalize x 
    norm.y = norm.y/mag;//normalize y
    return norm;
  };
  /** Get the magnitude of a vector
   * @param vec : vector get the magnitude of
   */
  p.getMag = function(vec) {
    return Math.sqrt(vec.x*vec.x + vec.y*vec.y);
  };
  /** render function for a player
   * @param ctx : drawing context
   */
  p.render = function() {
    var y = this.primed ? 182 : 0;
    game.draw.ctx.save();
    game.draw.ctx.globalAlpha = .7;
    switch(this.color){
      case "blue":
        game.draw.img(this.img, 0, y, 182, 182, 
              this.x-this.r, this.y-this.r, 2*this.r, 2*this.r);
        break;
      case "pink":
        game.draw.img(this.img, 182, y, 182, 182, 
              this.x-this.r, this.y-this.r, 2*this.r, 2*this.r);
        break;
      case "green":
        game.draw.img(this.img, 364, y, 182, 182, 
              this.x-this.r, this.y-this.r, 2*this.r, 2*this.r);
        break;
      case "white":
        game.draw.img(this.img, 546, y, 182, 182, 
              this.x-this.r, this.y-this.r, 2*this.r, 2*this.r);
        break;
      case "purple":
        game.draw.img(this.img, 728, y, 182, 182, 
              this.x-this.r, this.y-this.r, 2*this.r, 2*this.r);
        break;
      default:
        console.log('Annie are you ok?');
        break;
    }
    game.draw.ctx.restore();
  };
  /** sets the player's target positon
   * @param x : target x coord
   * @param y : target y coord
   */
  p.setTarget = function(x,y) {
    this.target.x = x;
    this.target.y = y;
  };
  /** sets the player positon
   * @param x : target x coord
   * @param y : target y coord
   */
  p.setPosition = function(x,y){
  	this.x = x;
	  this.y = y;
  };
	/** sets the player's chosen color
	 * @param color: color
	 */
	p.setColor = function(color){
		this.color = color;
	};
	
	p.setName = function(name){
		this.name = name;
	}
	
  return Player;
}();