var game = game || {};

game.sockets = {
  socket: undefined,
  init : function(app){
    this.socket = io.connect( window.location.origin, {query: 'user='+name, type: 'desktop'});
    /** PLAYER CONNECTING TO GAME ****************************************/
    //
    //Set up socket events 
    this.socket.on('player join', function(data){
      // check password
      console.log(data);
      // if password is correct, create new player
      if( data.password === app.password ){ 
        // emit successful join
        this.socket.emit('player joined', data.sockID);
        // create new player
        app.createPlayer(data);
      } else {
        //emit rejection
        this.socket.emit('player reject', data.sockID);
      } 
    });
  
    /** HANDLING PLAYER ACTIONS ****************************************/
    //
    // Firing on phone
    this.socket.on('game fire', function(data){
      /*app.bubbles.forEach(function(bubble, index, array){
        //If there is a collision and the colors match
        if(app.circleCollison(bubble, app.players[data.id]) &&
            bubble.color === app.players[data.id].color ) {
          array.splice(index, 1);
        }
      });*/

      //just make this add a projectile
    });
    
    this.socket.on('phone tilt', function(data) {
      //console.log(players);
      //console.log(data);
      if(app.players[data.id]) {
        app.players[data.id].setTarget(data.xAcc*20 + app.canvas.width/2, 250 - data.yAcc * 20);
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