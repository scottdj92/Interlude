//Contains draw methods for different game states, and helper functions
"use strict";
var game = game || {};
//Any values used as coordinates for functions here should be between 0 and 16/9
//To keep everything relative to the canvas size
//All values will be multiplied by canvas.height
//This means that the corner of the screen will be (16/9 , 1)
game.draw = {
  canvas : undefined,
  ctx : undefined,
  /** Init function for draw
   * @param canvas : canvas to draw on
   * @param ctx : rendering context
   */
  init : function(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  },
  /** Fills a circle at the coordinates provided
   * @param x : X coordinate
   * @param y : Y coordinate
   * @param r : radius of circle
   * @param color : color of circle
   */
  circle : function(x, y, r, color) {
    var Xscaled = x * this.canvas.height;
    var Yscaled = y * this.canvas.height;
    var Rscaled = r * this.canvas.height;

    this.ctx.save();//save the draw state
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(Xscaled, Yscaled, Rscaled, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();//restore the draw state
  }
  /** Draw function for the particle object
   *
   *
   MIGHT NOT WANT THIS HERE
   */
  particle : function(size, x, y, color, alpha) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(Math.PI/2);
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillRect(-size/2, -size/2, size, size);
    this.ctx.restore();
  }
}