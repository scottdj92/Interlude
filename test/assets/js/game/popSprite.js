"use strict";

var game = game || {};
//Creates a pop sprite that runs the pop animation then dies
game.PopSprite = function(){
  var PopSprite = function(img, r, x, y){
    this.x = x;
    this.y = y;
    this.r = r;//radius
    this.img = img;
    this.fps = 1/60;
    this.timeToNext = this.fps;
    this.currentFrame = 0;
    this.remove = false; 
    this.frames = 18;
    this.spriteCoords = [];//init this if we need it
    this.bad = false;
  };
  //get prototype
  var p = PopSprite.prototype;
  //Updates current frame
  p.update = function(dt){
    this.timeToNext -= dt;
    if(this.bad)
      this.r += .03*dt
    if(this.timeToNext <= 0){
      this.timeToNext = this.fps;
      this.currentFrame++;
    }
    //if animation is done say so
    this.remove = !(this.currentFrame < this.frames);
  };
  //renders popSprite at current frame
  p.render = function(){
    var picX = 48 + (this.currentFrame % 5)*350;
    var picY = 48 + Math.floor(this.currentFrame/5) * 350
    game.draw.img(this.img, picX, picY, 256, 256, 
              this.x-this.r, this.y-this.r, 2*this.r, 2*this.r);
  };

  return PopSprite;
}();