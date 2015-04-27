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
  var Bubble = function(id, color, x, y, xVel, yVel) {
    this.x = x;
    this.y = y;
    this.r = .07;//radius
    this.velocity = { x : xVel, y : yVel};
    this.id = id;
    this.color = color;
    this.collisions = [];
    this.mass = 10;
  }
  //create a reference to the bubble prototype
  var b = Bubble.prototype;
  /** Update function for the bubble
   * @param dt : delta time for if we want to cap the frame rate
   */
  b.update = function(dt) {
    if(this.y < -1) {//if the bubble is off of the screen
      this.remove = true;//it can be removed
    }
    this.move();
    this.updateCollisions();
    this.velocity.y += .000005;//accelerate upward
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
    if(bub.id === this.id || !game.physicsUtils.circleCollision(this,bub) || this.colliding(bub) ) {
      return false;
    } else {
      //add collison to collision array
      this.collisions.push(bub);
      bub.collisions.push(this);
      //get impulse
      var impulse = game.physicsUtils.getImpulse(this, bub, 0.01);
      this.applyImpulse(impulse);
      //invert it for other bubble
      impulse.x *= -1;
      impulse.y *= -1;
      bub.applyImpulse(impulse);
    }
  };
  /** Applies an impulse to the bubble
   * @param impules : force to be added to bubble
   */
  b.applyImpulse = function(impulse) {
    this.velocity.x = impulse.x/this.mass;
    this.velocity.y = impulse.y/this.mass;
  };
  /** Move function for the bubble
   */
  b.move = function() {
    this.y -= this.velocity.y;
    this.x += this.velocity.x;
  };
  /** render function for a bubble
   * @param ctx : drawing context
   */
  b.render = function(ctx) {
    game.draw.circle(this.x, this.y, this.r, this.color);
  };

  return Bubble;
}();