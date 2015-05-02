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
    var self = this;
    this.particles.forEach(function(particle){
      particle.update();
      particle.centerX = self.x;
      particle.centerY = self.y;
			particle.maxDistance = self.r;
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
  b.move = function(x, y) {
    
  };
  /** render function for a blackhole
   * @param ctx : drawing context
   */
  b.render = function() {
    var scale = game.draw.canvas.height;
    var grd = game.draw.ctx.createRadialGradient(this.x*scale, this.y*scale, 
                   this.r/100 * scale, this.x*scale, 
                   this.y*scale, this.r*.9 * scale);
    grd.addColorStop(0,"white");
    grd.addColorStop(1,'rgba(0,0,0,0)');
    game.draw.ctx.save();
    game.draw.ctx.globalAlpha = .5;
    game.draw.circle(this.x,this.y,this.r,grd);
    game.draw.ctx.restore();
    game.draw.particle(this.r*3/5, this.x, this.y, "black", 0.7);
    this.particles.forEach(function(particle){
      particle.render();
    });
  };

  return BlackHole;
}();