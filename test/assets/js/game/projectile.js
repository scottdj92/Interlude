"use strict";

var game = game || {};

game.Projectile = function() {
  
  var Projectile = function() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.startZ = 30;
    this.pow = 0;
    this.canHit = false;
    this.dead = false;
    this.color = "black";
    this.id = 0;
    this.r = 0.01;
  };

  var p = Projectile.prototype;

  p.update = function(dt) {
    if(this.dead)
      return;

    this.z-=5;

    //this.z -= this.pow;
    if(this.z < 5) 
      this.canHit = true;

    if(this.z < -1)
      this.dead = true;
  };

  p.reset = function(x,y,pow,id,type){
    this.x = x;
    this.y = y;
    this.z = this.startZ;
    this.pow = pow;
    this.canHit = false;
    this.dead = false;
    this.type = type;
    this.color = "black";
    this.id = id;
  };

  p.render = function() {
    game.draw.circle(this.x,this.y, (this.z/this.startZ) * 0.04, this.color);
  };

  return Projectile;
}();
