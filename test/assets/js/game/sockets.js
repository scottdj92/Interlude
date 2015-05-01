var game = game || {};

game.sockets = {
  socket: undefined,
  init : function(app){
    this.socket = io.connect( window.location.origin, {query: 'user='+name, type: 'desktop'});
    var self = this;
		
		/** PLAYER CONNECTING TO GAME ****************************************/
		
		/**
			Player join attempt
		**/ 
    this.socket.on('player join', function(data){
			var msg; //error msg
			
			if(app.state == "START" || app.state == "LOGIN"){
				// check password
				if( data.password === app.password ){ 
					// check number of players
					if( app.playersReady < 5 ){
						self.socket.emit('player joined', {id:data.sockID, room: app.room}); // emit successful join
						app.createPlayer(data); // create new player
						app.addPlayertoLobby(data); //Add player to lobby
						app.initLoginState();
						return;
					} else {
						msg = "Game is full"
					} //
				} else {
					//emit rejection
					msg = "Incorrect Password";
				} //
			} else {
				msg = "Unable to join game";
			}
									 
			self.socket.emit('player reject', {id:data.sockID, msg: msg}); //emit rejection if not all conditions met
    });
	
		//gets socket id
    this.socket.on('game init', function(data){
      app.room = data.id;
      console.log(app.room);
    });

		//color selection
		this.socket.on("player color", function(data){
			app.setPlayerColor(data);
		});
		
		//send available colors
		this.socket.on("color checkAvail", function(data){
			app.getSelectedColors();
		});
		
    //recieves event once a player has typed in the code and selected a color
    this.socket.on('player ready', function(data){
			app.setPlayerReady(data);
      if(app.playersReady >= 5)
        app.canStart = true;
    });
  
    /** HANDLING PLAYER ACTIONS ****************************************/
   
    // Firing on phone
    this.socket.on('game fire', function(data){
      //just make this add a projectile
      var player = app.players[data.id];
      player.primed = false;
      app.projectiles.inactive[0].reset(player.x, player.y, data.id, data.dist, player.color);
      app.projectiles.active.push(app.projectiles.inactive[0]);
      app.projectiles.inactive.splice(0,1);
    });
    //change player sprite to primed state
    this.socket.on('pull start', function(data){
      var player = app.players[data.id];
      player.primed = true;
    });

    this.socket.on('phone tilt', function(data) {
      if(app.players[data.id]) {
        app.players[data.id].setTarget((data.xAcc/40) + 8/9, -1*(data.yAcc/90) + .5);
      }
    });
    
    this.socket.on('player leave', function(sockID) {
      // data only contains the play id
      var target = app.findPlayer(sockID);
      if(target){
        console.log("Player "+target.id+" has left");
        //var color = target.color; /* delete color player has chosen */
				delete app.players[sockID]; // removes player from players array
				app.playersReady --;
      }
    });
  }
}