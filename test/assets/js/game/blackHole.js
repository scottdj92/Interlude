//Function for making black hole objects
"use strict";
//If there is no game object make one
var game = game || {};

game.BlackHole = function() {
  /** BlackHole constructor
   * @param x : start x position
   * @param y : start y position
   * @param r : radius of black hole
   * @param numParticles : number of particles in the black hole
   */
  var BlackHole = function(x, y, r, numParticles) {
    this.x = x;
    this.y = y;
    this.r = r;//radius
    this.speed = 0.003;
    this.particles = this.generateParticles(numParticles);
  }
  //create a reference to the bubble prototype
  var b = BlackHole.prototype;
  /** Update function for the black hole
   * @param dt : delta time for if we want to cap the frame rate
   */
  b.update = function(dt) {
    //update each particle
    this.particles.forEach(function(particle){
      particle.update();
    });
  };
  /** Generates the array of particles to be used by the blackhole
   *  for rendering
   * @param numParticle : number of black hole particles
   */
  b.generateParticles = function(numParticles) {
    var particles = [];
    var deltaTheta = Math.PI*2/numParticles;
    for(var i = 0; i < numParticles; i++) {
      particles[i] = new game.Particle(i*deltaTheta, this.x, this.y, this.r);
    }
    return particles;
  };
  /** Move function for the blackhole
   * @param x : distance to move in x
   * @param y : distance to move in y
   */
  b.move = function(x,y) {
    
  };
  /** render function for a blackhole
   * @param ctx : drawing context
   */
  b.render = function(ctx) {
    
  };

  return BlackHole;
}();