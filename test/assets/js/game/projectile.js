"use strict";

var game = game || {};

game.Projectile = function() {
  
  var Projectile = function(x,y,pow,id,color) {
    this.x = x;
    this.y = y;
    this.z = 100;
    this.pow = pow;
    this.canHit = false;
    this.dead = false;
    this.color = color;
    this.id = id;
  };

  var p = Projectile.prototype;

  p.update = function(dt) {
    if(this.dead)
      return;

    this.z -= this.pow;
    if(this.z < 20) 
      this.canHit = true;

    if(this.z < -10)
      this.dead = true;
  };

  p.render = function() {
    game.draw.circle(this.x,this.y, 100-z/100 * 0.3, this.color);
  };
}