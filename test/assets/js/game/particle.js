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
  var Particle = function(theta, centerX, centerY, radius) {
    //Create the slope that this particle moves on
    var s = {x: 0, y: 0};
    s.x = Math.cos(theta);
    s.y = Math.sin(theta);
    this.slope = s;
    //Save the max distance from the center of the black hole
    this.maxDistance = radius;
    this.currDistance = Math.random()*maxDistance; 
    this.x = currDistance*s.x;
    this.y = currDistance*s.y;
    this.centerX = centerX;
    this.centerY = centerY;
    this.size = 0.0001;//radius
    this.speed = 0.001;
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