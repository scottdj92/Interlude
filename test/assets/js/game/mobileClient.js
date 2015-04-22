var mobileClient = {};
			
mobileClient = {
	connectData: {},
	socket: null,
	name: null,
	id: null,
	col: null,
	state: 0,
	
	init : function () {

		// create new instance of socket.io
		this.id = Math.floor(Math.random()*10);
		this.name ='user'+this.id;

		var red = Math.floor(Math.random() * 255);
		var green = Math.floor(Math.random() * 255);
		var blue = Math.floor(Math.random() * 255);
		this.col = 'rgb('+red+','+green+','+blue+')';

		//setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
		this.socket = io.connect( window.location.origin);

		// initial data sent by socket
		this.connectData = { id: this.id, color: this.col};

		// JOIN GAME
		// this.socket.emit('player join', connectData);

		// start socket listeners
		this.initSocket();

		// start general page interaction listeners
		this.initListeners();
		var self = this;
		setTimeout(function(){mobileClient.changeState();}, 1500);
	},

	// INITIATE SOCKET ******************************************//
	initSocket : function() {
		var socket = this.socket;
		var m = this;
		socket.on('response joined', function(msg){
			//when player has successfully joined
			$("#status").html(msg);
			m.changeState();
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
	},

	// GENERAL LISTENERS
	initListeners : function() {
		var self = this;

		/** GAME CONTROLS **/
		$("#fire_btn").on('touchstart click', function(){
			var data = {id: self.id};
			self.socket.emit('game fire', data);
		});

		/** MOVEMENT **/
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
		
		/** Prevent Page Drag **/
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
		
	},
	//
	// MOBILE STATES   //////////////////////////////////////////////////////
	changeState: function(){
		//increment state
		this.state += 1;
		//check current state and take corresponding actions
		switch(this.state){
			case 1:
				this.showIntro();
				break;
			case 2:
				this.showLogin();
				break;
			case 3:
				this.showColorSelection();
				break;
			case 4:
				this.showNameInput();
				break;
		}
	},
	
	// STATE-CHANGE METHODS *****************************************/
	
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
		
		//input bar interaction (boxes will fill with each letter inputed)
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
			/*
			var input = $("#pw_input").val().toUpperCase();
			self.connectData.password = input;
			// clear onscreen input
			$("#pw_input").val('');
			self.clearInputFill();
			// emit through socket
			self.socket.emit('player join', self.connectData);
			*/
			$("#pw_input").blur();
			self.changeState();
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
		$("#name_instr").fadeIn(700);
		
	},
	
	// 5
	showGameControls : function(){
		$('#game_controls').show();
	},

	

	// HELPER ///////////////////////////////////////////////////////////////
	clearInputFill: function(){
		var boxes = document.getElementsByClassName('box');
		for(var i=0; i<5; i++){
				$(boxes[i]).removeClass('filled');
		}
	},
	
	selectColor: function(color){
		//make sure to check color
		// if( available )
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
		
	},

}