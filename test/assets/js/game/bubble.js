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
  var Bubble = function(id, color, x, y) {
    this.x = x;
    this.y = y;
    this.r = .07;//radius
    this.velocity = { x : 0, y : 0};
    this.id = id;
    this.color = color;
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
  };

  b.collideWith = function(bub){
    if(bub.id === this.id || 
      !game.physicsUtils.circleCollision(this,bub)) {

      return false;
    } else {
      var impulse = game.physicsUtils.getImpulse(this, bub, 1);
      this.applyImpulse(impulse);

      impulse.x *= -1;
      impulse.y *= -1;
      bub.applyImpulse(impulse);
    }
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