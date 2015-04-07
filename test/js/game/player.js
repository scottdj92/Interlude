//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.Player = function() {
  var Player = function(id, color, sockID, x, y){
    this.x = x;
    this.y = y;
    this.xAcc = 0;
    this.yAcc = 0;
    this.velocity = {x: 0, y: 0}
    this.r = 20;
    this.speed = 20;
    this.id = id;
	  this.sockID = sockID;
    this.color = color;
    this.mu = 0.95;
    this.target = {x:0,y:0};
    this.startRotation = undefined;
  }

  var p = Player.prototype;

  p.update = function(dt) {
    this.move(dt);
  };

  p.calculateVelocity = function(dt) {
    this.applyFriction();
    this.xVel += this.xAcc;
    this.yVel += this.yAcc;
  };

  p.updateAcceleration = function(x,y) {
    this.xAcc = 1;
    this.yAcc = 1;
  };

  p.applyFriction = function() {
    this.xVel = this.xVel * this.mu;
    this.yVel = this.yVel * this.mu;
  };

  p.move = function(dt) {
    // this.x += this.velocity.x;
    // this.y += this.velocity.y;
    var self = this;
    var dist = {x:self.x - self.target.x, y: self.y - self.target.y};
    var normal = this.normalize(dist);
    var yMag = Math.abs(dist.y);
    var xMag = Math.abs(dist.x);


    if(dist.x > 2 || dist.x < -2)
      this.x -= normal.x * (this.speed * xMag/40);
    if(dist.y > 2 || dist.y < -2)
      this.y -= normal.y * (this.speed * yMag/40);  
  };

  p.normalize = function(vec) {
    var norm = {x: vec.x, y: vec.y};
    var mag = this.getMag(norm);
    norm.x = norm.x/mag;
    norm.y = norm.y/mag;
    return norm;
  };

  p.getMag = function(vec) {
    return Math.sqrt(vec.x*vec.x + vec.y*vec.y);
  };

  p.render = function(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  p.setTarget = function(x,y) {
    this.target.x = x;
    this.target.y = y;
  };

  p.setPosition = function(x,y){
  	this.x = x;
	  this.y = y;
  };
	
  return Player;
}();