//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.createPlayer = function(id, color, x, y) {
  var player = {
    x: x,
    y: y,
    xAcc: 0,
    yAcc: 0,
    xVel: 0,
    yVel: 0,
    r: 20,
    speed: 1,
    id : id,
    color : color,
    mu : 0.95,

    update : function(dt) {
      this.calculateVelocity(dt);
      this.move(dt);
    },

    calculateVelocity : function(dt) {
      this.applyFriction();
      this.xVel += this.xAcc;
      this.yVel += this.yAcc;
    },

    updateAcceleration : function(x,y) {
      this.xAcc = x;
      this.yAcc = y;
    },

    applyFriction : function() {
      this.xVel = this.xVel * this.mu;
      this.yVel = this.yVel * this.mu;
    },

    move : function(dt) {
      this.y += this.yVel;
      this.x += this.xVel;
    },

    render : function(ctx) {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  return player;
}