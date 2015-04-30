var mobileClient = {};
			
mobileClient = {
	connectData: {},
	socket: null,
	name: null,
	id: null,
	color: null,
	hex: null,
	state: 0,
	
	// INITIALIZER 
	init : function () {
		// create new instance of socket.io
		//setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
		this.socket = io.connect( window.location.origin);
		// start socket listeners
		this.initSocket();
		this.initListeners();
		
		var self = this;
		setTimeout(function(){mobileClient.changeState();}, 1500);
	},// end
	
	/**
		INITIATE SOCKET 
	**/
	// Init each socket listener
	initSocket : function( callback ) {
		var socket = this.socket;
		// initial data sent by socket
		console.log(this.id);
		this.connectData = { id: socket.id };
		
		var self = this;
		//set own id
		socket.on('player id', function(id){
			console.log(id);
			self.id = id;
		});
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
			if(msg.color){
				self.selectColor(msg.color);
			}
			// if not available 
		});
		
		// Lists of taken colors recieved from game
		socket.on('color selected', function(msg){
			// marks that a color is selected
			// msg is an array containing colors taken and the name of user (if availble)
			self.markSelectedColors(msg);
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
	
	// 1 //
	showIntro: function(){
		$("#pre-game").removeClass('center').addClass('center-top');
		$("#intro").addClass('initial');
		
		var m = this;
		$("#join_btn").on("click touchend", function(e){ 
			e.preventDefault();
			m.changeState(); 
		});
	},
	
	// 2 //
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
	
	// 3 //
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
		this.socket.emit("color getAvail", this.id);
		// color selection listeners
		$(".color").on("touchend click", function(e){
			e.preventDefault();
			var color = $(e.target).attr("class").split(" ")[1];
			// send message to server for game to check colors
			// need to create function for socket listeners
			//self.selectColor(color); // will be called after response of socket listener
			var data = { id: self.id, color: color };
			self.socket.emit('player color', data);
		});
		
	},
	
	// 4 //
	showNameInput: function(){
		$("#colors_instr").fadeOut(300);
		setTimeout(function(){ $("#name_instr").fadeIn(300); }, 300);
		
		var self = this;
		// Name Submit Btn Listener
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
	
	// 5 //
	showGameControls : function(){
		var self = this;
		$("#colors").removeClass("down").addClass("inactive").fadeOut(600);
		$("#name_instr").addClass("inactive");
		
		$("#game_prep .instructions").fadeOut(500, function(){
			//hide game_prep content
			$("#game_prep").removeClass("active").hide();
			$('#game_controls').addClass("active").fadeIn(500);
	
			mobileClient.slingshot.init(self);
		});
	},
	
	// 6 //
	gameStart: function(){
		$("#game_controls #info").fadeOut(400);
	},

	
	/**
		HELPER 
	**/
	clearInputFill: function(){
		var boxes = document.getElementsByClassName('box');
		for(var i=0; i<5; i++){
				$(boxes[i]).removeClass('filled');
		}
	},
	
	selectColor: function(color){
		//make sure to check color
		this.color = color; //set client's color
		$(document.getElementsByClassName(color)[0]).addClass("selected");
		this.hex = $(".color.selected").css("background-color");
		//clear unselected colors
		var self = this;
		$(".color").off();
		$(".color").each(function(index){
			if( !$(this).hasClass('selected') ){
				$(this).addClass('nonactive');
				$(this).fadeOut(500);
			}
		});
		
		setTimeout( function(){
			$("#colors").addClass('down');
			self.changeState();
		}, 500);
	},
	
	markSelectedColors: function(colors){
		colors.forEach(function(color){
			var col = document.getElementsByClassName(color)[0];
			if( !$(col).hasClass("selected") )
				$(col).addClass("unavailable");
		});
	},
	
	// Notify Game that Player is ready
	sendReady: function(){
		var data = { id:this.id, name:this.name };
		this.socket.emit("player ready", data);
		this.changeState(); 
	},

}