var game = game || {};

game.sockets = {
  socket: undefined,
  init : function(app){
    this.socket = io.connect( window.location.origin, {query: 'user='+name, type: 'desktop'});
    /** PLAYER CONNECTING TO GAME ****************************************/
    //
    var self = this;
    //Set up socket events 
    this.socket.on('player join', function(data){
      // check password
      console.log(data);
      // if password is correct, create new player
      if( data.password === app.password ){ 
        // emit successful join
        self.socket.emit('player joined', data.sockID);
        // create new player
        app.createPlayer(data);
      } else {
        //emit rejection
        self.socket.emit('player reject', data.sockID);
      } 
    });

    //recieves event once a player has typed in the code and selected a color
    this.socket.on('player ready', function(data){
      app.players[data.id].ready = true;
    });
  
    /** HANDLING PLAYER ACTIONS ****************************************/
    //
    // Firing on phone
    this.socket.on('game fire', function(data){
      //just make this add a projectile
      var player = app.players[data.id];
      app.projectiles.inactive[0].reset(player.x, player.y, data.id, data.dist, player.color);
      app.projectiles.active.push(app.projectiles.inactive[0]);
      app.projectiles.inactive.splice(0,1);
    });
    
    this.socket.on('phone tilt', function(data) {
      if(app.players[data.id]) {
        app.players[data.id].setTarget((data.xAcc/90) + 8/9, -1*(data.yAcc/90) + .5);
      }
    });
    
    this.socket.on('player leave', function(sockID) {
      // data only contains the play id
      console.log("PLAYER LEAVE:");
      var target = app.findPlayer(sockID);
      if(target){
        console.log("Player "+target.id+" has left");
        app.players.splice(app.players.indexOf(target),1); // removes player from players array
      }
    });
  }
}