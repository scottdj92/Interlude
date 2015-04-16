//Function for making particle objects
"use strict";
//If there is no game object make one
var game = game || {};

game.Particle = function() {
  /** Particle constructor
   * @param theta : postion around the circle of the black hole
   * @param centerX : center of black hole
   * @param centerY : center of black hole
   * @param radius : radius of the entire black hole
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
    this.speed = radius/30;
  }
  //create a reference to the particle prototype
  var p = Particle.prototype;
  /** Update function for the particle
   * @param dt : delta time for if we want to cap the frame rate
   */
  p.update = function(dt) {
    this.move();
    this.checkReset();
  };
  /** Move function for the particle
   */
  p.move = function() {
    this.currDistance -= this.speed;
    this.x = currDistance*this.slope.x;
    this.y = currDistance*this.slope.y;
  };
  /** Checks to see if the particle should be moved to the outer ring
   */
  p.checkReset = function() {
    if(this.currDistance <= 0)
      this.currDistance = this.maxDistance;
  };
  /** render function for a particle
   */
  p.render = function() {
    var size = this.maxDistance/40;
    var alpha = this.currDistance/this.maxDistance;
    game.draw.particle(size, this.x, this.y, "black", alpha);
  };

  return Particle;
}();