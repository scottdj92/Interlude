var mobileClient = {};
			
mobileClient = {
	connectData: {},
	socket: null,
	name: null,
	id: null,
	col: null,
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
	},


	initSocket : function() {
		var socket = this.socket;
		var m = this;
		socket.on('response joined', function(msg){
			//when player has successfully joined
			$("#status").html(msg);

			m.showGameControls();
		});

		socket.on('response reject', function(msg){
			//when player has been rejected
			$("#status").html(msg);
		});
	},


	initListeners : function() {
		var self = this;

		/** FORM ACTIONS **/
		$('#submit').on('click', function(e){
			var input = document.getElementsByName('pw_input')[0].value.toUpperCase();
			self.connectData.password = input;
			document.getElementsByName('pw_input').value = "";
			self.socket.emit('player join', self.connectData);

		});

		/** GAME CONTROLS **/
		$("#fire_btn").on('touchstart click', function(){
			var data = {id: self.id};
			self.socket.emit('game fire', data);
		});

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
	},

	showGameControls : function(){
		$('#game_login').fadeOut(200);
		$('#game_controls').show();
	},

}