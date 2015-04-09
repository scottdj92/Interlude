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
    this.r = 50;//radius
    this.speed = 1;
    this.id = id;
    this.color = color;
  }
  //create a reference to the bubble prototype
  var b = Bubble.prototype;
  /** Update function for the bubble
   * @param dt : delta time for if we want to cap the frame rate
   */
  b.update = function(dt) {
    if(this.y < -10) {//if the bubble is off of the screen
      this.remove = true;//it can be removed
    }
    this.move(0,this.speed);//move the bubble
  };
  /** Move function for the bubble
   * @param x : distance to move in x
   * @param y : distance to move in y
   */
  b.move = function(x,y) {
    this.y -= y;
    this.x += x;
  };
  /** render function for a bubble
   * @param ctx : drawing context
   */
  b.render = function(ctx) {
    ctx.save();//save the draw state
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();//restore the draw state
  };

  return Bubble;
}();