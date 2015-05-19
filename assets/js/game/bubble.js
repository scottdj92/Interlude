//Function for making bubble objects
"use strict";
//If there is no game object make one
var game = game || {};
//Creates a bubble object that can be replicated
game.Bubble = function() {
  /** Player constructor
   * @param id : player id that corolates to this bubble
   * @param color : bubble color
   * @param x : start x position
   * @param y : start y position
   */
  var Bubble = function(id, img, type, r, x, y, xVel, yVel, rising) {
    this.x = x;
    this.y = y;
    this.r = r;//radius
    this.startR = r;
    this.velocity = { x : xVel, y : yVel};
    this.acceleration = { x : 0, y : 0};
    this.id = id;
    this.type = type;
    this.color = img;
    this.collisions = [];
    this.mass = 10;
    this.img = img;
    this.rising = rising;
    this.opacity = 0;
    this.acceleration.y += this.rising ? .005 : 0;
  }
  //create a reference to the bubble prototype
  var b = Bubble.prototype;
  /** Update function for the bubble
   * @param dt : delta time for if we want to cap the frame rate
   */
  b.update = function(dt) {
    if(this.y < -1) //if the bubble is off of the screen
      this.remove = true;//it can be removed
    
    if(this.x > 16/9 - this.r || this.x < this.r)
      this.velocity.x *= -1;
    if(this.opacity<1)
      this.opacity+=dt/2;

    this.move(dt);
    this.updateCollisions();
    //acceleration
    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += this.acceleration.y * dt;
  };
  /** Removes collisions that have ended from the collison array
   */
  b.updateCollisions = function(){
    var self = this;
    self.collisions.forEach(function(bub, index, array){
      if(!game.physicsUtils.circleCollision(self,bub))
        array.splice(index,1);
    });
  };
  /** Checks to see if a collision has already been resolved
   * @param collider : bubble to check array for
   */
  b.colliding = function(collider) {
    var collide = false;
    this.collisions.forEach(function(bub){
      if(collider.id === bub.id)
        collide = true;
    });
    return collide;
  };
  /** Checks for a collison and applies impulse to both objects
   * @param bub : bubble to collide with
   */
  b.collideWith = function(bub){
    if(!game.physicsUtils.circleCollision(this,bub) || this.colliding(bub) ) {
      return false;
    } else {
      //add collison to collision array
      this.collisions.push(bub);
      bub.collisions.push(this);
      //get impulse
      var impulse = game.physicsUtils.getImpulse(this, bub, .2);
      impulse.x *= -1;
      bub.applyImpulse(impulse);
      //invert it for other bubble
      impulse.x *= -1;
      impulse.y *= -1;
      this.applyImpulse(impulse);
    }
  };
  /** Applies an impulse to the bubble
   * @param impules : force to be added to bubble
   */
  b.applyImpulse = function(impulse) {
    this.velocity.x = impulse.x/this.mass;
    this.velocity.y -= impulse.y/this.mass;
  };
  /** Move function for the bubble
   */
  b.move = function(dt) {
    this.y -= this.velocity.y * dt;
    this.x += this.velocity.x * dt;
  };
  /** render function for a bubble
   * @param ctx : drawing context
   */
  b.render = function() {
    game.draw.ctx.save();
    game.draw.ctx.globalAlpha = this.opacity;
    game.draw.img(this.img, 48, 48, 256, 256, 
              this.x-this.r, this.y-this.r, 2*this.r, 2*this.r);
    game.draw.ctx.restore();
  };
  //bitch you know what this does
  b.setAccleration = function(x,y){
    this.acceleration.x = x;
    this.acceleration.y = y;
  };

  return Bubble;
}();