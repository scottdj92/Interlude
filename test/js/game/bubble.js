//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};

game.Bubble = function() {
  var Bubble = function(id, color, x, y) {
    this.x = x;
    this.y = y;
    this.r = 20;
    this.speed = 1;
    this.id = id;
    this.color = color;
  }
  var b = Bubble.prototype;

  b.update = function(dt) {
    /*this.y -= speed;

    if(this.y < -10) {
      this.remove = true;
    }*/
  };

  b.move = function(x,y) {
    this.y -= y;
    this.x -= x;
  };

  b.render = function(ctx) {
    ctx.save();
    ctx.fillStye = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  return Bubble;
}();