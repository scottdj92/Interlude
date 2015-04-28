"use strict";
var game = game || {};

game.interlude = {
  players : [], //array of players in the game
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
  playersReady : 0,

  init : function() {
    console.log(this);
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
	
    game.sockets.init(this);
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));

    //this.blackHole = new game.BlackHole(8/9, 0.5, 0.4, 150);

    for(var i = 0; i < 50; i++){
      this.projectiles.inactive.push(new game.Projectile());
    }
    //test bubbles
    //this.bubbles.push(new game.Bubble(0, "cyan", 10/9, 1, -.001, .0001));//Create a new bubble
    //this.bubbles.push(new game.Bubble(1, "purple", 6/9, 1, .001, .0001));//Create a new bubble

    this.loop();
  },

  /** HELPER FUNCTIONS ****************************************/
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
  spawnBubbles : function(){
    this.nextBubble--;
    if(this.nextBubble < 0) {
      var x = Math.random()*12/9 + 2/9;
      var y = 1;
      var xVel = .001 - Math.random()*.002;
      var yVel = Math.random()*.0008; 

      this.bubbles.push(new game.Bubble(this.bubbleIDCounter, "red", x, y, xVel, yVel));
      this.nextBubble = 100;
      this.bubbleIDCounter++;
    }
  },
  //Function for updating main game loop
  updateGame : function(){
    var dt = 0;
    var self = this;
    //this.blackHole.update(dt);
    //Loop through all of the players
    this.players.forEach(function(player) {
      player.update(dt); //call player's update function
    });
    //loop through all of the projectiles
    this.projectiles.active.forEach(function(proj, index, array){
      proj.update(dt);
      if( proj.canHit ) {
        if(self.checkBubbleCollison(proj) )
          proj.dead = true;
      }
      if(proj.dead){
        self.projectiles.inactive.push(proj);
        array.splice(index,1);
      }
    });

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

    this.spawnBubbles();
  },
  //Main update function
  update : function () {
    //Call different update function depending on the state
    switch (this.state){
      case "START" :
        if(this.canStart)
          this.state = "GAME";
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
    //this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);//clear the canvas
    this.ctx.fillStyle = "#235";
    this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);//clear the canvas
    //loop through bubbles
    this.bubbles.forEach(function(bubble) {
      bubble.render(self.ctx);//draw each bubble
    });
    this.projectiles.active.forEach(function(proj){
      proj.render();
    });

    //loop through players
    this.players.forEach(function(player) {
      player.render(self.ctx);//draw each player
    });
    //this.blackHole.render();
  },
  //render function for start screen
  renderStart : function() {
    game.draw.img(this.backgroundImg, 0,7545,1920,1080, 0,0,16/9,1)
  },
  //Main render function
  render : function () {
    switch(this.state) {
      case "START" :
        this.renderStart();
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
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZABCDEFGHIJKLMNOPQRSTUVWXYZ";
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