//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};

game.makeBubble = function(x, y) {
  var bubble = {
    x: x,
    y: y,
    r: 10,
    speed: 1,
    remove: false,

    update : function(dt) {
      this.y -= speed;

      if(this.y < -10) {
        this.remove = true;
      }
    },

    render : function(ctx) {
      ctx.save();
      ctx.fillStye = "#e55";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

  }
  console.log('h');
  return bubble;
}