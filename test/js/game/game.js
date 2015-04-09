"use strict";
var game = game || {};

game.interlude = {
  players : [], 
  bubbles : [],
  canvas : undefined, 
  ctx : undefined,
  password: "",
  nextBubble: 0,
  state : "GAME",

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
	
	//get passwords
	this.password = this.generatePassword();
	console.log(this.password);
	
	/** PLAYER CONNECTING TO GAME ****************************************/
	//
    //Set up socket events 
    socket.on('player join', function(data){
	  // check password
	  console.log(data);
	  // if password is correct, create new player
	  if( data.password == self.password ){	
		// emit successful join
		socket.emit('player joined', data.sockID);
        // create new player
		self.createPlayer(data);
	  } 
	  else {
	  	//emit rejection
		socket.emit('player reject', data.sockID);
	  }
    });
	
	/** HANDLING PLAYER ACTIONS ****************************************/
	//
	// Firing on phone
    socket.on('game fire', function(data){
      self.bubbles.forEach(function(bubble, index, array){
        if(self.circleCollison(bubble, self.players[data.id])) {
          array.splice(index, 1);
        }
      });
    });

	  
    socket.on('phone tilt', function(data) {
      //console.log(players);
      //console.log(data);
      if(self.players[data.id]) {
        //Begin rotation nonsense
        if(self.players[data.id].startRotation === undefined)
          self.players[data.id].startRotation = data.rot;
        var angle = data.rot - self.players[data.id].startRotation;
        angle = self.mod(angle + 180, 360) -180;
        //var newRot = data.rot - self.players[data.id].startRotation;
        //end rotation nonesense
        //console.log(self.players[data.id].startRotation);
		    //console.log(angle);
        self.players[data.id].setTarget(data.xAcc*20 + self.canvas.width/2, 250 - data.yAcc * 20);
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

  /** HELPER FUNCTIONS ****************************************/
  //
  loop : function () {
    requestAnimationFrame(this.loop.bind(this));
    this.update();
    this.render();   
  },

  sq : function(val) {
    return val * val;
  },

  mod : function(a, n) {
    return a - Math.floor(a/n) * n;
  },

  circleCollison : function(c1, c2) {
    var radSq = this.sq(c1.r + c2.r);
    var distSq = this.sq(c2.x - c1.x) + this.sq(c2.y - c1.y);
    return (radSq >= distSq);
  },

  updateGame : function(){
    var dt = 0;
    this.players.forEach(function(player) {
      player.update(dt);
    });
    this.bubbles.forEach(function(bubble, index, array) {
      bubble.update(dt);
      if(bubble.remove)
        array.splice(index, 1);
    });
    this.nextBubble -= 1;

    if(this.nextBubble < 0) {
      this.bubbles.push(new game.Bubble(0, "red", this.canvas.width/2, this.canvas.height));
      this.nextBubble = ( Math.random() * 100 ) + 100;
    }
  },

  update : function () {
    switch (this.state){
      case "GAME" :
        this.updateGame();
        break;
      default :
        break;
    }
  },

  renderGame : function() {
    var self = this;
    this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

    this.bubbles.forEach(function(bubble) {
      bubble.render(self.ctx);
    });

    this.players.forEach(function(player) {
      player.render(self.ctx);
    });
  },

  render : function () {
    switch (this.state){
      case "GAME" :
        this.renderGame();
        break;
      default :
        break;
    }
  },
	
	
  /** 
  	* createPassword():
	* generates a password needed to join game
  */
  generatePassword : function(){
  	var pw = "";
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var string_length = 5;
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		pw += chars.substring(rnum,rnum+1);
	}
	return pw;
  },
	
  /** 
  	* createPlayer():
	* creates and adds a new player in game
	* parameter [data object from socket]
  */
  createPlayer : function(data){
  	var x = 200, y = 200;
    this.players[data.id] = new game.Player(data.id, data.color, data.sockID, x, y);
    var i = parseInt(data.id);
  },
	
  /** 
  	* findPlayer():
	* locates a player in players array by ID
	* parameter [socketID]
  */
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