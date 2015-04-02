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
    this.speed = 40;
    this.id = id;
	  this.sockID = sockID;
    this.color = color;
    this.mu = 0.95;
    this.target = {x:0,y:0}
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
    this.x += this.velocity.x;
    this.y += this.velocity.y;
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