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
  },
  /** strokes an arc at the coordinates provided
   * @param x : X coordinate
   * @param y : Y coordinate
   * @param r : radius of circle
   * @param color : color of circle
   */
  strokeArc : function(x, y, r, color, lineWidth, startPi, endPi) {
    var Xscaled = x * this.canvas.height;
    var Yscaled = y * this.canvas.height;
    var Rscaled = r * this.canvas.height;
    var lw = lineWidth * this.canvas.height; 

    this.ctx.save();//save the draw state
    this.ctx.lineWidth = lw;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(Xscaled, Yscaled, Rscaled, startPi, endPi);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();//restore the draw state
  },
  /** Draw function for the particle object
   *
   *
   MIGHT NOT WANT THIS HERE
   */
  particle : function(size, x, y, color, alpha) {
    this.ctx.save();
    this.ctx.translate(x*this.canvas.height, y*this.canvas.height);
    this.ctx.rotate(Math.PI/4);
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = alpha;
    size *= this.canvas.height;
    this.ctx.fillRect(-size/2, -size/2, size, size);
    this.ctx.restore();
  },
  //image draw function
  img : function(image, imgX, imgY, imgW, imgH, x, y, w, h) {
    this.ctx.drawImage(image, imgX, imgY, imgW, imgH, 
      x*this.canvas.height, y*this.canvas.height, w*this.canvas.height, h*this.canvas.height);
  },
  /** Draws text to the screen
   * @param string : text to be rendered
   * @param x : x coord of text
   * @param y : y coord of text
   * @param size : size of text
   * @param col : color of text
   */
    text: function( string, x, y, size, col) {
      x *= this.canvas.height;
      y *= this.canvas.height;
      size *= this.canvas.height;  
      this.ctx.save();
      this.ctx.font = size+'px Lato';
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = col;
      this.ctx.fillText(string, x, y);
      this.ctx.restore();
    },
    triStar: function(x,y,theta) {
      var xs = x*this.canvas.height;
      var ys = y*this.canvas.height;
      var x1 = .01* this.canvas.height;
      var y1 = 1.73/6 * 2*x1;
      var y2 = 1.73/3 * 2*x1;
      this.ctx.save();
      this.ctx.globalAlpha = .6;
      this.ctx.fillStyle = "#fff";
      this.ctx.translate(xs,ys);
      this.ctx.rotate(theta);
      this.ctx.beginPath();
      this.ctx.moveTo(0,y2);
      this.ctx.lineTo(-x1,-y1);
      this.ctx.lineTo(x1,y1);
      this.ctx.lineTo(0,y2);
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.restore();
    }
}