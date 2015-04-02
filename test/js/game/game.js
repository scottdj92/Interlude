"use strict";
var game = game || {};

game.interlude = {
  players : [], 
  bubbles : [],
  canvas : undefined, 
  ctx : undefined,

  init : function() {
    console.log(this);
    var self = this;
    // create new instance of socket.io
    var num = Math.floor(Math.random()*10);
    var name ='user'+num;
    //setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
    var socket = io.connect( window.location.origin, {query: 'user='+name, type: 'desktop'});

    this.canvas = document.querySelector('#area');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 5;

    //Set up socket events 
    socket.on('player join', function(data){
      var x = 200, y = 200;
      self.players[data.id] = game.createPlayer(data.id, data.color, data.sockID, x, y);
      var i = parseInt(data.id);
    });

    socket.on('phone tilt', function(data) {
      //console.log(players);
      console.log(data.id);
      if(self.players[data.id]) {
        self.players[data.id].updateAcceleration(data.xAcc/300, data.yAcc/300);
      }
    });
    
    socket.on('player leave', function(sockID) {
      // data only contains the play id
      console.log("PLAYER LEAVE:");
      var target = self.findPlayer(sockID);
      if(target){
        console.log("Player "+target.id+" has left");
        self.players.splice(self.players.indexOf(target),1); // removes player from players array
      }
    });

    this.loop();
  },

  loop : function () {
    requestAnimationFrame(this.loop.bind(this));
    this.update();
    this.render();   
  },

  update : function () {
    var dt = 0;
    this.players.forEach(function(player) {
      player.update(dt);
    });
    this.bubbles.forEach(function(bubble) {
      bubble.update(dt);
    });
  },

  render : function () {
    var self = this;
    this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

    this.players.forEach(function(player) {
      player.render(self.ctx);
    });

    this.bubbles.forEach(function(bubble) {
      bubble.render(self.ctx);
    });
  },

  findPlayer : function (socketID) {
      console.log('Find player: '+socketID);
      var target;
      this.players.every(function(player){
        console.log("search: "+player.sockID);
        if(player.sockID == socketID){
          target = player;
          console.log('match');
        }
      });
      
      return target;
    }
}