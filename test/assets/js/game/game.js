"use strict";
var game = game || {};

game.interlude = {
  players : {}, //array of players in the game
  bubbles : [], //array of bubbles in the game
	colors : [],
  popSprites : [],
  bgObjs : [],
  projectiles : { //Holds all projectiles in the game so we dont make extra
    active : [], //currently active projectiles
    inactive : [] //inactive projectiles
  },
  videos : {
    instructions : undefined
  },
  tracks : [],
	audio : [],
	audCount : 0,
  currentTrack : undefined,
  scores : {},
  blackHole : undefined,
  canvas : undefined, //canvas for drawing
  ctx : undefined, //drawing context
  password: "", //THIS IS A PASSWORD
  nextBubble: 0, //time until next bubble spawn
  state : "START", //current game state
  bgImgs : [],
  badBubImg : undefined,
  bubbleAssets : {},
  playerSprites : undefined,
  bubbleIDCounter : 0,
  canstart: false,
  playersReady : 4,
  bgPos: 1080,
  currBG : 0,
  nextBG : 1,
  bgSpeed : 80,
  tricounter : 100,
  lastLane: 0,//last lane a bubble spawned in
  //stores last date val in milliseconds thats 1/1000 sec
  lastUpdate: 0,
  bossTimer: 5,
  countdownTime: {
    secLeft: 3,
    sec: 1,
  },
  room: undefined,
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // Initializer
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////
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
		this.loadAudio();
    this.setUpScores();
  	//get passwords
  	this.password = this.generatePassword();
    document.querySelector('#password').innerHTML = this.password;
	
    game.sockets.init(this);
		
		// window screen size
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
		
		this.initSizeListeners();
		
    for(var i = 0; i < 50; i++){
      this.projectiles.inactive.push(new game.Projectile());
    }
    this.loop();
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // reseter
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  reset : function() {
    this.setUpScores();
    //get passwords
    this.password = this.generatePassword();
    document.querySelector('#password').innerHTML = this.password;

    this.state = "START";
		
    //reset time values
    this.lastUpdate = 0;
    this.bossTimer = 120;
    this.countdownTime= {
      secLeft: 3,
      sec: 1,
    };

    this.bubbleIDCounter = 0;
    this.canstart = false;
    this.playersReady = 0;
    this.backgroundPos = 0;

    this.players = {}; //array of players in the game
    this.bubbles = []; //array of bubbles in the game
    this.colors = [];
    this.popSprites = [];
		
		this.resetLobby();

    this.loop();
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// LOAD ASSETS / HELPERS
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
  //Loads all image assets
  loadImages : function() {
    this.bgImgs[0] = this.loadImg("assets/img/bg/bg1.png");
    this.bgImgs[1] = this.loadImg("assets/img/bg/bg2.png");
    this.bgImgs[2] = this.loadImg("assets/img/bg/bg3.png");
    this.bgImgs[3] = this.loadImg("assets/img/bg/bg4.png");
    this.bubbleAssets['blue'] = this.loadImg("assets/img/cyan-sprite.png"); 
    this.bubbleAssets['pink'] = this.loadImg("assets/img/pink-sprite.png");
    this.bubbleAssets['purple'] = this.loadImg("assets/img/purple-sprite.png");
    this.bubbleAssets['white'] = this.loadImg("assets/img/white-sprite.png");
    this.bubbleAssets['green'] = this.loadImg("assets/img/green-sprite.png");
    this.playerSprites = this.loadImg("assets/img/crosshair.png");
    this.videos.instructions = document.querySelector("#instructions");
    this.badBubImg = this.loadImg("assets/img/bad-sprite.png");
  },
  //retune the image object with the source passed in
  loadImg : function(src) {
    var asset = new Image();
    asset.src = src;
    return asset;
  },
	//load audio
	loadAudio : function(){
		//need to make random
		this.audio = new Sound('The_Clash-Rock_the_Casbah', ['Keys.mp3', 'Percussion.mp3', 'Guitar.mp3', "Bass.mp3", 'Drums.mp3']);
    //var audio = new Sound('Duran_Duran-Hungry_Like_the_Wolf', ['Bass.mp3', 'Drums.mp3', 'Guitar.mp3', 'Vocals.mp3', 'Vocal_Synth.mp3']);
    this.audio.init();
	},
  //set up scores
  setUpScores : function() {
    this.scores["blue"]={total:0, hit:0};
    this.scores["white"]={total:0, hit:0};
    this.scores["green"]={total:0, hit:0};
    this.scores["purple"]={total:0, hit:0};
    this.scores["pink"]={total:0, hit:0};
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
      if(c1.type === bubble.type && self.circleCollison(bubble, c1)) {
        bubble.remove = true;
        if(self.state !== "GAME" || self.state !== "BOSS")
          self.scores[bubble.type].hits++;
        return true;
      }
    });
    return false;
  },
	
	//Picks a color from available players
	chooseBubbleColor : function(id) {
		if(!id){
			var cols = []
			//change this shit
			for(var p in this.players){
				cols.push(this.players[p].color);
			}
			var n = Math.floor(Math.random()*cols.length);
			return cols[n];
		}
		else {
			return this.players[id].color;
		}
	},

  //spawns bubbles for the game
  spawnBubbles : function(dt, p){
    this.nextBubble--;
		var id = this.players[p].audio; //id of audio track
		console.log(id);
		var freq = this.audio.getByteFrequencyData(id);
		var length = freq.length;
    if(this.nextBubble <= 0) {
			//set spawn lane
			if( length > 8 ){
				if( (freq[length-1] - freq[length-2]) - (freq[length-3] - freq[length-4]) > 
					 (freq[length-5] - freq[length-6]) - (freq[length-7] - freq[length-8]) ) {
					var bubbleLane = Math.floor(Math.random()*5);
					while(bubbleLane === this.lastLane){
						bubbleLane = Math.floor(Math.random()*5);
					}
					this.lastLane = bubbleLane;

					var x = 2/9 + 3/9 * bubbleLane;
					var y = 1.10 - (Math.random() * 0.1);//spawn off screen
					var xVel = .07 - Math.random()*.14;
					var yVel = Math.random()*0.4; 
					var r = (Math.random() * .08) + .05;//get random size
					var color = this.chooseBubbleColor();
					this.scores[color].total++;
					this.bubbles.push(new game.Bubble(this.bubbleIDCounter, 
														this.bubbleAssets[color],color, r,
														x, y, xVel, yVel, (this.state !== "BOSS")));
					this.nextBubble = 150;
					this.bubbleIDCounter++;
				}
			}
    }
  },
  //returns the delta time from the last call in seconds
  getDT : function() {
    var now = Date.now();
    var dt = (now - this.lastUpdate)/1000;
    if(this.lastUpdate===0) dt = 0;
    this.lastUpdate = now;

    return dt;
  },
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// UPDATE 
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////
  // Update Helpers
  /////////////////
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
    Background
  **/
  updateBG : function(dt) {
    this.bgPos += this.bgSpeed * dt;

    if(this.bgPos >= 9705) {
      //switch bg
      this.currBG = this.nextBG;
      this.bgPos = 1080;
      this.nextBG ++;
    } 
    if(this.nextBG > 3)
      this.nextBG = 0;
    this.tricounter--;
    if(this.tricounter <= 0){
      var x = Math.random()*10/8 +2/9;
      this.bgObjs.push(new game.TriStar(x,0));
      this.tricounter = 340;
    }
    this.bgObjs.forEach(function(obj){obj.update(dt);});

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
      if(bubble.remove) {//Check to see if the bubble should be removed
        self.popSprites.push(new game.PopSprite(bubble.img, bubble.r, bubble.x, bubble.y));
        array.splice(index, 1); //Remove a bubble
      }
    });
  },
  //updates all bubble pop sprites
	updatePopSprites : function(dt) {
    var self = this;
    //Loop through all of the sprites
    this.popSprites.forEach(function(sprite, index, array) {
      sprite.update(dt); //call sprites's update function
      if(sprite.remove) //Check to see if the sprite should be removed
        array.splice(index, 1); //Remove a sprite
    });
  },

  ///////////////
  // MAIN UPDATES
  ///////////////
	/**
		GAME
	**/
  //Function for updating main game loop
  updateGame : function(){
    var self = this;
    var dt = this.getDT();
    this.bossTimer -= dt;
    if(this.bossTimer <= 0) this.initBoss();
    else if(this.bossTimer <= 60) console.log("bon jovi");
    //this.blackHole.update(dt);
    //Loop through all of the players
    this.updateBG(dt);
    this.updatePlayers(dt);
    this.updatePopSprites(dt);
    this.updateProjectiles(dt);
    this.updateBubbles(dt);
		for(var p in this.players) this.spawnBubbles(dt, p);
  },
	/**
		Intro
	**/
  updateIntro : function() {
    var dt = this.getDT();
    this.updateBG(dt);
    //Loop through all of the players
    this.updatePlayers(dt);
    this.updateProjectiles(dt);
    this.updateBubbles(dt);
    this.updatePopSprites(dt);
   //console.log(this.players);
    //if all bubbles are popped switch to countdown
    if(this.bubbles.length < 5 && this.popSprites.length < 1){
      this.initCountdown();
    }
  },
	/**
    countdown to game
  **/
  updateCountdown : function(){
    var dt = this.getDT();
    this.updateBG(dt);
    //Loop through all of the players
    this.updatePlayers(dt);
    this.updateProjectiles(dt);
    //update countdown timer
    this.countdownTime.sec -= dt;
    if(this.countdownTime.sec < 0) {
      this.countdownTime.sec = 1;
      this.countdownTime.secLeft--;
    }
    //if all bubbles are popped switch to countdown
    if(this.countdownTime.secLeft < 1){
      this.initGame();
    }
  },
	/**
    Boss
  **/
  updateBoss : function() {
    var self = this;
    var dt = this.getDT();
    this.updateBG(dt);
    this.blackHole.update(dt);
    this.updatePlayers(dt);
    this.updatePopSprites(dt);
    this.updateProjectiles(dt);
    this.updateBubbles(dt);
    for(var p in this.players){ this.spawnBubbles(dt, p); }
    //save black hole ref
    var bh = this.blackHole;
    //accelerate bubbles to black hole
    //This is hella ugly
    this.bubbles.forEach(function(bub){
      var xDist = bub.x - bh.x;
      var yDist = bub.y - bh.y;

      var distSq = xDist * xDist + yDist * yDist;
      var fwd = game.physicsUtils.normalize({x:xDist, y:yDist});
      var pull = .06/distSq;
      pull *= distSq <= bh.r/10 ? 2 : 1/4;
      var yAcc = fwd.y*pull;
      var xAcc = -fwd.x*pull;
      bub.setAccleration(xAcc, yAcc);
      if(distSq <= bh.r/10)
        bub.r = bub.startR * distSq/bub.startDistsq;
      else {
        bub.startDistsq = distSq;
      }

      if(distSq <= bh.r/40){
        bub.remove = true;
        bh.r += .05
      }
    });
		if(bh.r > .1){
    	bh.r -= .001
		}
  },
	updateBossEnter : function() {
    var self = this;
    var dt = this.getDT();
    this.updateBG(dt);
    this.blackHole.update(dt);
    this.updatePlayers(dt);
    this.updateProjectiles(dt);
    if(this.blackHole.y < 0.2){
      this.blackHole.y += 0.008;
    } else {
      this.state = "BOSS";
    }
  },
	/**
		MAIN UPDATE  !!!!!!!
	**/
  //Main update function
  update : function () {
    //Call different update function depending on the state
    switch (this.state){
      case "START" :
        this.updateBG(this.getDT());
        break;
      case "LOGIN" :
        this.updateBG(this.getDT());
        if(this.canstart) {
          this.initIntro();
        }
        break;
      case "INTRO":
        this.updateIntro();
        break;
      case "COUNTDOWN":
        //this.reset();
				this.updateCountdown();
        break;
      case "GAME" :
        this.updateGame();//call game update function
        break;
      case "BOSS" :
        this.updateBoss();
        break;
      case "BOSS ENTER":
        this.updateBossEnter();
        break;
      case "END" :
        break;
      case "TRANS":
        break;
      default :
        break;
    }
  },
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// RENDER 
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	/**
		Main
	**/
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
      case "COUNTDOWN":
        this.renderCountdown();
        break;
      case "GAME" :
        this.renderGame();//render in game screen
        break;
      case "BOSS" :
        this.renderBoss();
        break;
      case "BOSS ENTER" :
        this.renderBossEnter();
        break;
      case "END" :
				this.renderEnd();
        break;
      case "TRANS":
        break;
      default :
        break;
    }
  },
	
	/**
		Start
	**/
  //render function for start screen
  renderStart : function() {
    this.renderBG();
  },
	
	/**
    countdown
  **/
  renderCountdown : function() {
    this.renderBG();

    this.projectiles.active.forEach(function(proj){
      proj.render();
    });
    //loop through players
    for(var p in this.players){
      this.players[p].render();
    }

    game.draw.ctx.save();
    game.draw.ctx.globalAlpha = 0.35;
    game.draw.circle(8/9, 0.5, .29, "#5B7C96");
    game.draw.ctx.restore();

    game.draw.ctx.save();
    game.draw.ctx.globalAlpha = 0.25;
    game.draw.strokeArc(8/9, 0.5, .3, "#5B7C96", .02,Math.PI*3/2, 
                        Math.PI*2*this.countdownTime.sec);
    game.draw.ctx.restore();

    game.draw.strokeArc(8/9, 0.5, .3, "#5B7C96", .02,
                       Math.PI*2*this.countdownTime.sec, Math.PI*3/2);

    game.draw.text(this.countdownTime.secLeft, 8/9, 0.55, .2, "#fff");
  },
	/**
		Game
	**/
  //Render function for in game screen
  renderGame : function() {
    var self = this;//Save a reference to this
    this.renderBG();
    //loop through bubbles
    this.bubbles.forEach(function(bubble) {
      bubble.render(self.ctx);//draw each bubble
    });
    this.popSprites.forEach(function(sprite) {
      sprite.render();//draw each bubble
    });
    this.projectiles.active.forEach(function(proj){
      proj.render();
    });
    //loop through players
    for(var p in this.players){
      self.players[p].render();
    }
  },
	
	/**
		Boss
	**/
  //render function for boss screen
  renderBoss : function () {
    var self = this;//Save a reference to this
    this.renderBG();
    this.blackHole.render();
    //loop through bubbles
    this.bubbles.forEach(function(bubble) {
      bubble.render(self.ctx);//draw each bubble
    });
    this.popSprites.forEach(function(sprite) {
      sprite.render();//draw each bubble
    });
    this.projectiles.active.forEach(function(proj){
      proj.render();
    });
    //loop through players
    for(var p in this.players){
      self.players[p].render();
    }
  },
	renderBossEnter : function() {
    var self = this;//Save a reference to this
    this.renderBG();
    this.blackHole.render();
    this.projectiles.active.forEach(function(proj){
      proj.render();
    });
    //loop through players
    for(var p in this.players){
      self.players[p].render();
    }
  },
	/**
		BG
	**/
	renderBG : function() {
    //render
    if(this.bgPos > 8625 && this.bgPos < 9705) {
      var y1 = this.bgPos - 8625;
      var h1 = y1;
      var h2 = 1080 - y1;
      game.draw.img(this.bgImgs[this.nextBG], 0, 8625 - y1,1920,h1,0,0,16/9,h1/1080);
      game.draw.img(this.bgImgs[this.currBG], 0, 0,1920,h2,0, h1/1080,16/9,h2/1080);  
      //draw other bg
    } else {
      game.draw.img(this.bgImgs[this.currBG], 0,8625 - this.bgPos,1920,1080,0,0,16/9,1);
    }

  },

  renderEnd : function() {
    this.renderBG();
    game.draw.text("Bruh it's over", 8/9, 0.55, .2, "#fff");
  },
	
  ////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// TRANSITIONS (Each game state)
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
    Animation transition
  **/
  transitionAnimation : function(video, callback) {
    //player asset animation on canvas
    this.state = "TRANS";
    //set up canvas callback for video playing
    video.addEventListener('play', function() {
    var self = this; //cache
    (function loop() {
        console.log('playing');
        if (!self.paused && !self.ended) {
          game.draw.ctx.drawImage(self, 0, 0,
                  game.draw.canvas.width, game.draw.canvas.height);
          setTimeout(loop, 1000 / 30); // drawing at 30fps
        } else {
          callback();
        }
      })();
    }, 0);
    //play video
    video.play();
    //when animation is done call callback
    //video finished do callback
  },
	
	/**
		Lobby
	**/
	initLoginState : function() {
    if(this.state === "LOGIN") return;
    //switch state
    this.state = "LOGIN";
    //transition screens
    $("#lobby .pwd-sect").addClass("down");
    $("#lobby .logo").fadeOut(400);
  },
	
	//Intro screen where players learn mechanics
  initIntro : function() {
    var self = this;
    setTimeout( function(){
        //get rid of dom elements
        self.removeLobby();
      }, 900);
		this.transitionAnimation(this.videos.instructions, function(){
      //set state
      var r = .12;		
      self.state = "INTRO";
  		var players = self.getPlayersById();
  		game.sockets.socket.emit('game start', {players: players}); 
  		
      //add bubbles for them to pop
      self.bubbles.push(new game.Bubble(0,self.bubbleAssets["white"],"white",r,
                        2/9, 3/5 - .1, 0, 0, false));
      self.bubbles.push(new game.Bubble(1,self.bubbleAssets["purple"],"purple",r,
                        5/9, 4/5- .1, 0, 0, false));
      self.bubbles.push(new game.Bubble(2,self.bubbleAssets["pink"],"pink",r,
                        8/9, 3/5- .1, 0, 0, false));
      self.bubbles.push(new game.Bubble(3,self.bubbleAssets["blue"],"blue",r,
                        11/9, 4/5- .1, 0, 0, false));
      self.bubbles.push(new game.Bubble(4,self.bubbleAssets["green"],"green",r,
                        14/9, 3/5- .1, 0, 0, false));
    });
  },
  //initializes countdown state
  initCountdown : function(){
		console.log('start game');
    this.state = "COUNTDOWN";
  },
	
  initGame : function() {
    this.state = "GAME";
		this.removeLobby();
	
		this.playAudio();
  },

  initBoss : function() {
    this.blackHole = new game.BlackHole(8/9, -0.6, 0.4, 150);
    this.state = "BOSS ENTER";
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
	
	// MAIN reset lobby
	resetLobby: function(){
		this.resetPlayers();
		this.resetPasswordSect();
		$("#lobby .logo").show();
		$("#lobby").fadeIn(500);
	},
	
	//reset players
	resetPlayers: function(){
		var html = '';
		// this be so dirty (but time is little)
		var player = "<div class='player'><div class='icon'></div><div class='name'></div></div>";
		for(var i=0; i<5; i++) { html += player }
		$("#players").html(html);
		$("#players").show();
	},
	
	resetPasswordSect: function(){
		$(".pwd-sect").removeClass('done');
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
	
	toggleFullScreen : function(documentElement){
		if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
			if (document.documentElement.requestFullscreen) {
				document.documentElement.requestFullscreen();
			} else if (document.documentElement.msRequestFullscreen) {
				document.documentElement.msRequestFullscreen();
			} else if (document.documentElement.mozRequestFullScreen) {
				document.documentElement.mozRequestFullScreen();
			} else if (document.documentElement.webkitRequestFullscreen) {
				document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
			$(documentElement).parent().addClass("fullscreen");
  	} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
			$(documentElement).parent().removeClass("fullscreen");
  	}
	},
	
	initSizeListeners : function(){
		var self = this;
		var canvas = document.querySelector('#canvas-holder');
		//set fullscreen buttton listener
		$('#fullscreen_btn').on('click', function(){self.toggleFullScreen(canvas);});
		//button listner
		$(document).on('keyup', function(e) {  
			if (e.keyCode == 13) self.toggleFullScreen(canvas); //enter
			if (e.keyCode == 27) $('.container').removeClass("fullscreen"); // esc
		});
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
    this.players[data.id] = new game.Player(data.id, data.sockID, x, y, 
                            this.playerSprites);
		this.players[data.id].audio = this.audCount;
		this.audCount ++;
    //var i = parseInt(data.id);
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
		var pIds = [];
		for( var p in this.players ){
			pIds.push(p);
			colors.push(this.players[p].color);
		}
		game.sockets.socket.emit("color selected", {players: pIds, colors:colors, room: this.room});
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
  },
	
	// Returns an array of player ids
	getPlayersById : function(){
		var ids = [];
		for(var p in this.players){
			ids.push(p);
		};
		return ids;
	},


  ////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // AUDIO
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  selectTracks: function (selectedTrack, artist, track)
  {

    //establish which song and track you want to play and initialize
    //song is the name of the variable of the audio you want to play
    //ex: selectTracks(0, 'Anthony_Constantino-Songs/', 'Loop.wav'); plays the intro music
    selectedTrack.artistName = artist;
    selectedTrack.trackName = track;

    //console.log(selectedTrack);

    //seek song in file destination and initalize if possible
    selectedTrack.init();

    //add error prevention here
  },

  beginPlayback: function(track)
  {
    //console.log('beginPlayback fired');
    //bada bing bada boom
    track.startPlayback();
  },

  haltPlayback: function(track)
  {
    //prematurely ejaculate...I mean stop if necessary
     track.stopPlayback();
  },

  changeVolume: function(track, float)
  {
    //change the volume to a float between 0-1 where 1 is the loudest possible volume
     track.changeVolume(float);
  },
	
	playAudio : function(){
		for(var i=0; i<this.audio.sources.length; i++){
			this.audio.startPlayback(i);
		}
	},
}