"use strict";

var game = game || {};

game.TriStar = function() {
  
  var TriStar = function(x,y) {
    this.x = x;
    this.y = 0;
    this.dead = false;
    this.theta = Math.random()*100;
    this.mu = 0.9;
    this.velocity = {x:0, y:.05, theta:0};
    this.spinPoint = .1;//Math.random()*.1 + .2;
    this.color = "#fff";
    this.spun = false;
  };

  var t = TriStar.prototype;

  t.update = function(dt) {
    if(this.dead)
      return;

    this.theta += this.velocity.theta * dt;
    this.y += this.velocity.y *dt;
    this.x += this.velocity.x *dt;

    if(this.y > this.spinPoint && !this.spun) {
      this.applyForce(0,.05,40);
      this.spun = true;
    }

    if(this.y > 1.1)
      this.dead = true;

    this.applyFriction();
  };

  t.applyFriction = function() {
    this.velocity.x *= this.mu;
    this.velocity.theta *= this.mu;
  };

  t.applyForce = function(x,y,theta){
    this.velocity.x = x;
    this.velocity.y = y;
    this.velocity.theta = theta;
  };

  t.render = function() {
    game.draw.triStar(this.x,this.y,this.theta);
  };

  return TriStar;
}();