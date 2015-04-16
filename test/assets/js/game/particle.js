//Function for making particle objects
"use strict";
//If there is no game object make one
var game = game || {};

game.Particle = function() {
  /** Particle constructor
   * @param x : start x position
   * @param y : start y position
   * @param centerX : center of black hole
   * @param centerY : center of black hole
   */
  var Particle = function(x, y, centerX, centerY) {
    this.x = x;
    this.y = y;
    this.centerX = centerX;
    this.centerY = centerY;
    this.size = 0.0001;//radius
    this.speed = 0.003;
  }
  //create a reference to the particle prototype
  var p = Particle.prototype;
  /** Update function for the particle
   * @param dt : delta time for if we want to cap the frame rate
   */
  p.update = function(dt) {
    
  };
  /** Move function for the particle
   * @param x : distance to move in x
   * @param y : distance to move in y
   */
  p.move = function(x,y) {
    
  };
  /** render function for a particle
   * @param ctx : drawing context
   */
  p.render = function() {
    
  };

  return Particle;
}();