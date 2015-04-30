"use strict";
var game = game || {};

game.interlude = {
  players : {}, //array of players in the game
  bubbles : [], //array of bubbles in the game
  projectiles : { //Holds all projectiles in the game so we dont make extra
    active : [], //currently active projectiles
    inactive : [] //inactive projectiles
  },
  blackHole : undefined,
  canvas : undefined, //canvas for drawing
  ctx : undefined, //drawing context
  password: "", //THIS IS A PASSWORD
  nextBubble: 0, //time until next bubble spawn
  state : "START", //current game state
  backgroundImg : undefined,
  bubbleAssets : {},
  bubbleIDCounter : 0,
  canstart: false,
  playersReady : 4,
  backgroundPos: 0,
  bgIterator: 2,
  lastLane: 0,//last lane a bubble spawned in
  //stores last date val in milliseconds thats 1/1000 sec
  lastUpdate: 0,
  //gets delta time
  /*
  var now = Date.now();
  var deltaTime = now - this.lastUpdate;
  this.lastUpdate = now;
  */

  init : function() {
    var self = this;
    // create new instance of socket.io
    var num = Math.floor(Math.random()*10);
    var name ='user'+num;
    //setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
    
    //set inital canvas variables
    this.canvas = document.querySelector('#area');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 5;
	  game.draw.init(this.canvas, this.ctx);

    this.loadImages();
  	//get passwords
  	this.password = this.generatePassword();
  	console.log(this.password);
    document.querySelector('#password').innerHTML = this.password;
	
    game.sockets.init(this);
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));

    //this.blackHole = new game.BlackHole(8/9, 0.5, 0.4, 150);
    for(var i = 0; i < 50; i++){
      this.projectiles.inactive.push(new game.Projectile());
    }

    this.loop();
  },

  ////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// LOAD ASSETS / HELPERS
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
  //Loads all image assets
  loadImages : function() {
    this.backgroundImg = this.loadImg("assets/img/background1.png");
    this.bubbleAssets['blue'] = this.loadImg("assets/img/cyan-sprite.png"); 
    this.bubbleAssets['pink'] = this.loadImg("assets/img/pink-sprite.png");
    this.bubbleAssets['purple'] = this.loadImg("assets/img/purple-sprite.png");
    this.bubbleAssets['white'] = this.loadImg("assets/img/white-sprite.png");
    this.bubbleAssets['green'] = this.loadImg("assets/img/green-sprite.png");
  },
  //retune the image object with the source passed in
  loadImg : function(src) {
    var asset = new Image();
    asset.src = src;
    return asset;
  },
  //Main loop that gets called on each frame
  loop : function () {
    requestAnimationFrame(this.loop.bind(this));//Set up next loop call
    this.update();//Update the game
    this.render();//render the game
  },
	
  //Returns the value multiplied by itself
  sq : function(val) {
    return val * val;
  },
	
  /** Takes in two circle objects and detects a collision
   * @param c1 : first circle in possible collision
   * @param c2 : second circle in possible collision
   */
  circleCollison : function(c1, c2) {
    var radSq = this.sq(c1.r + c2.r);
    var distSq = this.sq(c2.x - c1.x) + this.sq(c2.y - c1.y);
    return (radSq >= distSq);
  },
	
  //function for checking a collsion against all bubbles
  checkBubbleCollison : function(c1) {
    var self = this;
    this.bubbles.forEach(function(bubble){
      if(self.circleCollison(bubble, c1)) {
        bubble.remove = true;
        return true;
      }
    });
    return false;
  },
	
  //spawns bubbles for the game
  spawnBubbles : function(dt){
    this.nextBubble--;

    if(this.nextBubble <= 0) {
      //set spawn lane
      var bubbleLane = Math.floor(Math.random()*5);
      while(bubbleLane === this.lastLane){
        bubbleLane = Math.floor(Math.random()*5);
      }
      this.lastLane = bubbleLane;

      var x = 2/9 + 3/9 * bubbleLane;
      var y = 1.1;
      var xVel = 0;//.001 - Math.random()*.002;
      var yVel = .001;//Math.random()*.0008; 

      this.bubbles.push(new game.Bubble(this.bubbleIDCounter, this.bubbleAssets["blue"],
                        x, y, xVel, yVel));
      
      this.nextBubble = 200;
      this.bubbleIDCounter++;
    }
  },
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// UPDATE 
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	/**
		Projectiles
	**/
  //updates projectiles and moves inactive ones to the correct array
  updateProjectiles : function(dt){
    var self = this;
    //loop through all of the projectiles
    this.projectiles.active.forEach(function(proj, index, array){
      proj.update(dt);
      //bubble collisions
      if( proj.canHit ) {
        if(self.checkBubbleCollison(proj) )
          proj.dead = true;
      }
      //move finished ones
      if(proj.dead){
        self.projectiles.inactive.push(proj);
        array.splice(index,1);
      }
    });
  },
	
	/**
		Players
	**/
  updatePlayers: function(dt){
    var self = this;
    for(var p in this.players){
      //console.log(p);
      self.players[p].update(dt);
    }
  },
	
	/**
		Bubbles
	**/
  //updates all bubbles in game
  updateBubbles : function(dt) {
    var self = this;
    //Loop through all of the bubbles
    this.bubbles.forEach(function(bubble, index, array) {
      //do bubble bounce physics - I'm sorry you all have to see this
      for(var i = index + 1; i < array.length; i++){
        bubble.collideWith(self.bubbles[i]);
      }
      bubble.update(dt); //call bubble's update function
      if(bubble.remove) //Check to see if the bubble should be removed
        array.splice(index, 1); //Remove a bubble
    });
  },
	
	/**
		GAME
	**/
  //Function for updating main game loop
  updateGame : function(){
    var dt = 0;
    var self = this;
    //this.blackHole.update(dt);
    //Loop through all of the players
    this.updatePlayers(dt);

    this.updateProjectiles(dt);
    this.updateBubbles(dt);
    //this.spawnBubbles(dt);
  },
	
	/**
		Intro
	**/
  updateIntro : function() {
    var dt = 0;
    //Loop through all of the players
    this.updatePlayers(dt);
    this.updateProjectiles(dt);
    this.updateBubbles(dt);
   //console.log(this.players);
    //if all bubbles are popped switch to countdown
    if(this.bubbles.length < 1)
      this.initCountdown();
  },
	
	/**
		MAIN UPDATE  !!!!!!!
	**/
  //Main update function
  update : function () {
    //Call different update function depending on the state
    this.backgroundPos += this.bgIterator;
        if(this.backgroundPos <= 0 || this.backgroundPos >= 7000)
          this.bgIterator *= -1;
    switch (this.state){
      case "START" :
        break;
      case "LOGIN" :
        if(this.canStart) this.initIntro();
        break;
      case "INTRO":
        this.updateIntro();
        break;
      case "GAME" :
        this.updateGame();//call game update function
        break;
      case "BOSS" :
        break;
      case "END" :
        break;
      default :
        break;
    }
  },
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// RENDER 
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
  //Render function for in game screen
  renderGame : function() {
    var self = this;//Save a reference to this
    game.draw.img(this.backgroundImg, 0,7545 - this.backgroundPos,1920,1080, 0,0,16/9,1);
    //loop through bubbles
    this.bubbles.forEach(function(bubble) {
      bubble.render(self.ctx);//draw each bubble
    });
    this.projectiles.active.forEach(function(proj){
      proj.render();
    });

    //loop through players
    for(var p in this.players){
      self.players[p].render();
    }
    //this.blackHole.render();
  },
  //render function for start screen
  renderStart : function() {
    game.draw.img(this.backgroundImg, 0,7545 - this.backgroundPos,1920,1080, 0,0,16/9,1);
  },
  //Main render function
  render : function () {
    switch(this.state) {
      case "START" :
        this.renderStart();
        break;
      case "LOGIN" :
        this.renderStart();
        break;
      case "INTRO":
        this.renderGame();
        break;
      case "GAME" :
        this.renderGame();//render in game screen
        break;
      case "BOSS" :
        break;
      case "END" :
        break;
      default :
        break;
    }
  },
	
  ////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// TRANSITIONS (Each game state)
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	/**
		Lobby
	**/
	initLoginState : function() {
    if(this.state === "LOGIN") return;
    //switch state
    this.state = "LOGIN";
    //transition screens
    $("#lobby .pwd-sect").addClass("down");
  },
	
	//Intro screen where players learn mechanics
  initIntro : function() {
		//set state
    this.state = "INTRO";
		
		var self = this;
		setTimeout( function(){
    //get rid of dom elements
		self.removeLobby();
    //add bubbles for them to pop
    self.bubbles.push(new game.Bubble(0, self.bubbleAssets["white"],
                      2/9, 1/2, 0, 0));
    self.bubbles.push(new game.Bubble(1, self.bubbleAssets["purple"],
                      5/9, 1/2, 0, 0));
    self.bubbles.push(new game.Bubble(2, self.bubbleAssets["pink"], 
                      8/9, 1/2, 0, 0));
    self.bubbles.push(new game.Bubble(3, self.bubbleAssets["blue"], 
                      11/9, 1/2, 0, 0));
    self.bubbles.push(new game.Bubble(4, self.bubbleAssets["green"],
                      14/9, 1/2, 0, 0));
		}, 1500);
  },
	
  //initializes countdown state
  initCountdown : function(){
		console.log('start game');
    this.initGame();
    this.lastUpdate = Date.now();
  },
	
  initGame : function() {
    this.state = "GAME";
		
  },
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// LOBBY 
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// Add player to Lobby
	addPlayertoLobby: function(data){
		var p = document.getElementsByClassName('player');
		for(var i=0; i<p.length; i++){
			if( !$(p[i]).hasClass('join') ){
				$(p[i]).attr('id', data.sockID);
				$(p[i]).addClass('join');
				$(p[i]).find('.name').html("waiting");
				i = p.length;
			}
		}
	},
	
	// update the color of the lobby player's color
	updateLobbyPlayerColor: function(data){
		var p = document.getElementById(data.id);
		$(p).find('.icon').addClass(data.color);
	},
	
	//update the name of the lobby player
	updateLobbyPlayerName: function(data){
		$(document.getElementById(data.id)).find('.name').html(data.name);
	},
	
	//remove lobby
	removeLobby: function(){
		$("#lobby .pwd-sect").removeClass('down').addClass("done");
		$("#players").fadeOut(700, function(){ $('#lobby').hide(); });
	},
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// HELPER
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
  //Resize function for keeping canvas at the right ratio
  resizeCanvas : function() {
    //get reference to canvas holder
    var canvasHolder = document.querySelector('#canvas-holder');
    
    this.canvas.width = canvasHolder.offsetWidth;
    this.canvas.height = canvasHolder.offsetHeight;
  },
	
  /** 
  	* createPassword():
	* generates a password needed to join game
  */
  generatePassword : function(){
  	var pw = "";
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var string_length = 5;
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			pw += chars.substring(rnum,rnum+1);
		}
		return pw;
  },
	
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// PLAYER  
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
  /** 
  	* createPlayer():
	* creates and adds a new player in game
	* parameter [data object from socket]
  */
  createPlayer : function(data){
  	var x = 200, y = 200;
    this.players[data.id] = new game.Player(data.id, data.sockID, x, y);
    var i = parseInt(data.id);
  },
	
	/** 
  	* setPlayerColor():
	* creates and adds a new player in game
	* parameter [data object from socket]
  */
	setPlayerColor: function(data){
		//check available colors
		var used = false;
		var self = this;
		var players = this.players;
		console.log(data);
		var sockID = players[data.id].sockID;
		var response = { id: data.id, sockID: sockID };
		for( var p in players ){
			if(players[p].color == data.color){
				//if color is already used
				used = true;
				response.color = null;
				game.sockets.socket.emit("player colorcheck", response);
				break;
			}
		}
		//if color availabe
		if(!used){
			players[data.id].setColor(data.color);
			response.color = data.color;
			game.sockets.socket.emit("player colorcheck", response);
			self.updateLobbyPlayerColor(data);
			self.getSelectedColors();
		}
	},
	
	/** 
  	* checkSelectedColors():
	* sends to players array of taken colors
  */
	getSelectedColors: function(){
		var colors = [];
		for( var p in this.players ){
			colors.push(this.players[p].color);
		}
		game.sockets.socket.emit("color selected", colors);
	},
	
	
	/** 
  	* setPlayerReady():
	* adds player name
	* parameter [data object from socket]
  */
	setPlayerReady: function(data){
		this.players[data.id].ready = true;
		this.players[data.id].setName(data.name);
		this.updateLobbyPlayerName(data);
		this.playersReady ++;
		console.log(this.playersReady);
	},
	
  /** 
  	* findPlayer():
	* locates a player in players array by ID
	* parameter [socketID]
  */
  findPlayer : function (socketID) {
      var target;
      var self = this;
      for(var p in this.players){
        var player = self.players[p];
        if(player.sockID == socketID){
          target = player;
        }
      }; 
      return target;
    }
}