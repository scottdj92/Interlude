//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};

game.addPlayer = function(id, color, x, y) {
  var player = {
    x: x,
    y: y,
    r: 20,
    speed: 1,
    id : id,
    color : color,


    update : function(dt) {
      /*this.y -= speed;

      if(this.y < -10) {
        this.remove = true;
      }*/
    },

    move : function(x,y) {
      this.y -= y;
      this.x -= x;
    }

    render : function(ctx) {
      ctx.save();
      ctx.fillStye = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

  }
  console.log('h');
  return player;
}