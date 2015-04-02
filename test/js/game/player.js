//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.Player = function() {
  var Player = function(id, color, sockID, x, y){
    this.x = x;
    this.y = y;
    this.xAcc = 0;
    this.yAcc = 0;
    this.xVel = 0;
    this.yVel = 0;
    this.r = 20;
    this.speed = 1;
    this.id = id;
	  this.sockID = sockID;
    this.color = color;
    this.mu = 0.95;
  }

  var p = Player.prototype;

  p.update = function(dt) {
    //this.calculateVelocity(dt);
    //this.move(dt);
  };

  p.calculateVelocity = function(dt) {
    this.applyFriction();
    this.xVel += this.xAcc;
    this.yVel += this.yAcc;
  };

  p.updateAcceleration = function(x,y) {
    this.xAcc = x;
    this.yAcc = y;
  };

  p.applyFriction = function() {
    this.xVel = this.xVel * this.mu;
    this.yVel = this.yVel * this.mu;
  };

  p.move = function(dt) {
    this.y -= this.yVel;
    this.x += this.xVel;
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

  p.setPosition = function(x,y){
  	this.x = x;
	this.y = 250 - y*10;
  };
	
  return Player;
}();