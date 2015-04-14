"use strict";
var game = game || {};

game.interlude = {
  players : [], //array of players in the game
  bubbles : [], //array of bubbles in the game
  canvas : undefined, //canvas for drawing
  ctx : undefined, //drawing context
  password: "", //THIS IS A PASSWORD
  nextBubble: 0, //time until next bubble spawn
  state : "GAME", //current game state

  init : function() {
    console.log(this);
    var self = this;
    // create new instance of socket.io
    var num = Math.floor(Math.random()*10);
    var name ='user'+num;
    //setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
    var socket = io.connect( window.location.origin, {query: 'user='+name, type: 'desktop'});
    //set inital canvas variables
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
        //If there is a collision and the colors match
        if(self.circleCollison(bubble, self.players[data.id]) &&
            bubble.color === self.players[data.id].color ) {
          array.splice(index, 1);
        }
      });
    });

	  
    socket.on('phone tilt', function(data) {
      //console.log(players);
      //console.log(data);
      if(self.players[data.id]) {
        //Begin rotation nonsense
      /*  if(self.players[data.id].startRotation === undefined)
          self.players[data.id].startRotation = data.rot;
        var angle = data.rot - self.players[data.id].startRotation;
        angle = self.mod(angle + 180, 360) -180;*/
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
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));

    this.loop();
  },

  /** HELPER FUNCTIONS ****************************************/
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
  //Function for updating main game loop
  updateGame : function(){
    var dt = 0;
    //Loop through all of the players
    this.players.forEach(function(player) {
      player.update(dt); //call player's update function
    });
    //Loop through all of the bubbles
    this.bubbles.forEach(function(bubble, index, array) {
      bubble.update(dt); //call bubble's update function
      if(bubble.remove) //Check to see if the bubble should be removed
        array.splice(index, 1); //Remove a bubble
    });
    this.nextBubble -= 1; //Tick down time for next bubble
    //check to see if next bubble should be spawned
    if(this.nextBubble < 0) {
      var bubbleID = Math.floor(Math.random()*this.players.length);
      var bubbleColor = this.players[bubbleID] ? this.players[bubbleID].color : "black";
      this.bubbles.push(new game.Bubble(0, bubbleColor, this.canvas.width/2, this.canvas.height));//Create a new bubble
      this.nextBubble = ( Math.random() * 100 ) + 100; //Randomly set next bubble spawn interval
    }
  },
  //Main update function
  update : function () {
    //Call different update function depending on the state
    switch (this.state){
      case "START" :
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
  //Render function for in game screen
  renderGame : function() {
    var self = this;//Save a reference to this
    this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);//clear the canvas
    this.ctx.fillStyle = "#112244";
    this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);//clear the canvas
    //loop through bubbles
    this.bubbles.forEach(function(bubble) {
      bubble.render(self.ctx);//draw each bubble
    });
    //loop through players
    this.players.forEach(function(player) {
      player.render(self.ctx);//draw each player
    });
  },
  //Main render function
  render : function () {
    switch(this.state) {
      case "START" :
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
	//Resize function for keeping canvas at the right ratio
  resizeCanvas : function() {
    //get reference to canvas holder
    var canvasHolder = document.querySelector('#canvas-holder');
    
    console.log('resize');
    this.canvas.width = canvasHolder.offsetWidth;
    this.canvas.height = canvasHolder.offsetHeight;
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