var mobileClient = {};
			
mobileClient = {
	connectData: {},
	socket: null,
	name: null,
	id: null,
	color: null,
	state: 0,
	
	// INITIALIZER 
	init : function () {
		// create new instance of socket.io
		this.id = Math.floor(Math.random()*10);
		this.name ='user'+this.id;

		var red = Math.floor(Math.random() * 255);
		var green = Math.floor(Math.random() * 255);
		var blue = Math.floor(Math.random() * 255);
		this.color = 'rgb('+red+','+green+','+blue+')';

		//setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
		this.socket = io.connect( window.location.origin);

		// initial data sent by socket
		this.connectData = { id: this.id, color: this.color};

		// JOIN GAME
		// this.socket.emit('player join', connectData);

		// start socket listeners
		this.initSocket();
		
		this.initListeners();

		var self = this;
		setTimeout(function(){mobileClient.changeState();}, 1500);
	},// end
	
	/**
	// INITIATE SOCKET 
	**/
	initSocket : function( callback ) {
		var socket = this.socket;
		var self = this;
		socket.on('response joined', function(msg){
			//when player has successfully joined
			$("#status").html(msg);
			self.changeState();
		});

		socket.on('response reject', function(msg){
			//when player has been rejected
			$("#status").html(msg);
		});
		
		socket.on('color check', function(msg){
			/* msg will have color name */
			// if color available
			// if not available 
		});
		
		if(jQuery.isFunction(callback)){
			callback();
		}
	},
	
	/**
	// GENERAL LISTENERS
	**/
	initListeners : function() {
		var self = this;
		// MOVEMENT
		if (window.DeviceOrientationEvent) {
			window.addEventListener('deviceorientation', function(e) {
				// gamma is the left-to-right tilt in degrees, where right is positive
				var xTilt = e.gamma;
				// beta is the front-to-back tilt in degrees, where front is positive
				var yTilt = e.beta;
				// alpha is the compass direction the device is facing in degrees
				var rot = e.alpha
				var data = { id: self.id, xAcc : xTilt, yAcc : yTilt, rot: rot, };
				self.socket.emit('phone tilt', data);
			}, false);
		}
		
		// PREVENT PAGE DRAG
		var xStart, yStart = 0;
		document.addEventListener('touchstart',function(e) {
				xStart = e.touches[0].screenX;
				yStart = e.touches[0].screenY;
		});
		document.addEventListener('touchmove',function(e) {
				var xMovement = Math.abs(e.touches[0].screenX - xStart);
				var yMovement = Math.abs(e.touches[0].screenY - yStart);
				if((yMovement * 3) > xMovement) {
						e.preventDefault();
				}
		});
		
	}, // end
	
	/**
	// MOBILE STATES 
	// check current state and take corresponding actions
	
			- Intro
			- Login
			- Color
			- Name
			- Game Controls (Wait for game to start)
			- Game Start (In-game)
	**/
	changeState: function(){
		//increment state
		this.state += 1;
		switch(this.state){
			case 1:
				// Introduction
				this.showIntro();
				break;
			case 2:
				// Login (enter password)
				this.showLogin();
				break;
			case 3:
				// Enter Game and Select Color
				this.showColorSelection();
				break;
			case 4:
				// Enter Name (Complete preparation process)
				this.showNameInput();
				break;
			case 5:
				// Show Game Controls and wait for game to start
				this.showGameControls();
				break;
			case 6:
				// Game is in session
				this.gameStart();
				break;
		}
	},
	
	/**
	// STATE-CHANGE METHODS 
	// These functions are used to show different screens for each state
	**/
	
	// 1
	showIntro: function(){
		$("#pre-game").removeClass('center').addClass('center-top');
		$("#intro").addClass('initial');
		
		var m = this;
		$("#join_btn").on("click touchend", function(e){ 
			e.preventDefault();
			m.changeState(); 
		});
	},
	
	// 2
	showLogin: function(){
		$("#intro").removeClass("initial").addClass("nonactive").fadeOut(600);
		$("#game_login").addClass("active");
		
		// input bar interaction (boxes will fill with each letter inputed)
		var self = this;
		$("#pw_input").on('keyup change', function(){
			self.clearInputFill();
			var chars = $('#pw_input').val().length;
			var boxes = document.getElementsByClassName('box');
			for(var i=0; i<chars; i++){
				$(boxes[i]).addClass('filled');
			}
		});
		
		/** FORM ACTIONS **/
		$('#submit').on('click touchend', function(e){
			e.preventDefault();
			
			var input = $("#pw_input").val().toUpperCase();
			self.connectData.password = input;
			// clear onscreen input
			$("#pw_input").val('');
			self.clearInputFill();
			// emit through socket
			self.socket.emit('player join', self.connectData);
			
			$("#pw_input").blur();
			
			//self.changeState();
		});
	},
	
	// 3
	showColorSelection: function(){
		// remove pre game content
		$("#pre-game").addClass("finished");
		setTimeout(function(){$("#pre-game").hide()}, 1000);
		
		$("#game_login").removeClass("active");
		
		// load game content
		$("#game_prep").addClass("active");
		// load colors
		$(".color").each(function(index) {
				$(this).delay(200*index).fadeIn(200);
		});
		
		var self = this;
		// color selection listeners
		$(".color").on("touchend click", function(e){
			var color = $(e.target).attr("class").split(" ")[1];
			// send message to server for game to check colors
			// need to create function for socket listeners
			self.selectColor(color); // will be called after response of socket listener
		});
		
	},
	
	// 4
	showNameInput: function(){
		$("#colors_instr").fadeOut(300);
		setTimeout(function(){ $("#name_instr").fadeIn(300); }, 300);
		
		var self = this;
		$("#submit_name").on("touchend click", function(e){
			e.preventDefault();
			
			if($("#name_input").val().trim() != "") {
				self.name = $("#name_input").val().toUpperCase();
				console.log(self.name);
				//change state
				//send ready to game
				self.sendReady();
				$("#name_input").blur();
				$(this).off();
			}
		});
	},
	
	// 5
	showGameControls : function(){
		var self = this;
		$("#colors").removeClass("down").addClass("inactive").fadeOut(600);
		$("#name_instr").addClass("inactive");
		
		$("#game_prep .instructions").fadeOut(500, function(){
			//hide game_prep content
			$("#game_prep").removeClass("active").hide();
			$('#game_controls').addClass("active").fadeIn(500);
			// fire btn
			$("#fire_btn").on('touchstart click', function(e){
				e.preventDefault();
				console.log("shoot");
				var data = {id: self.id};
				self.socket.emit('game fire', data);
			});
			
			// Creating slingshot
			var R = Raphael(0, 0, window.innerWidth, window.innerHeight);
			// Parameters
			var cWidth = 20;
			var cXpos = window.innerWidth/2;
			var cYpos = window.innerHeight/2 - cWidth/2;
			// Line
			var l = R.path("M0 502L502 502L768 502");
			l.attr({
					stroke: 'red',
					'stroke-width': 4
			});
			// Circle (draggable)
			var c = R.circle(cXpos, cYpos, 20).attr({
					fill: 'white',
					stroke: 'red',
					'stroke-width': 4
			});
			var move = function(dx, dy) {
					var x = cXpos + dx, y = cYpos + dy; 
					this.attr({cx: x, cy: y});
					l.attr({path: "M0 502L"+x+" "+y+"L768 502"});
			}
			var start = function() {
					c.stop();
					l.stop();
			}
			var end = function() {
					//console.log(this.attr(cx));
					this.animate({cx: cXpos, cy: cYpos}, 2000, "elastic");
					//this.animate({cx: cXpos, cy: -100}, 200);
					l.animate({path: "M0 502L384 512L768 502"},
									 2000, "elastic");
			}
			c.drag(move, start, end);
		});
	},

	
	/**
	// HELPER ///////////////////////////////////////////////////////////////
	**/
	clearInputFill: function(){
		var boxes = document.getElementsByClassName('box');
		for(var i=0; i<5; i++){
				$(boxes[i]).removeClass('filled');
		}
	},
	
	selectColor: function(color){
		//make sure to check color
		//if( available ){
			this.color = color; //set client's color
			$(document.getElementsByClassName(color)[0]).addClass("selected");
			//clear unselected colors
			$(".color").each(function(index){
				if(!$(this).hasClass('selected')){
					$(this).addClass('nonactive');
					$(this).fadeOut(500);
				}
			});
			$(".color").off();

			var self = this;
			setTimeout(function(){
				$("#colors").addClass('down');
				self.changeState();
			}, 500);
		//}
	},
	
	// Notify Game that Player is ready
	sendReady: function(){
		var data = { id:this.id, name:this.name };
		this.socket.emit("player ready", data);
		this.changeState(); 
	},

}