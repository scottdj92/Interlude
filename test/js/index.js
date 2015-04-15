var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var MobileDetect = require('mobile-detect');
var players = [];

app.use('/js', express.static(path.resolve(__dirname)));
app.use('/css', express.static(path.resolve(__dirname+'/../css')));
app.use('/audio', express.static(path.resolve(__dirname+'/../audio')));

app.get('/', function(req, res){
	//the html string being sent

	var md = new MobileDetect(req.headers['user-agent']);
	var filepath = path.resolve(__dirname + '/../index.html');
	if(md.mobile() != null) {
		filepath = path.resolve(__dirname + '/../mobile_index.html');
	}
	res.sendFile(filepath);
});


// **** ACTIONS DONE BY SERVER HAVE HIGHER PRIORITY AND INIT BEFORE CLIENT ACTIONS

// Setup socket.io
// listen to connection
io.on('connection', function(socket){
	//broadcast that a user has connected
	//pass an object containing user informatiojn?
    
	// DISCONNECT
	// handle disconnects
	socket.on('disconnect', function(){
		io.emit('player leave', socket.id);
		console.log(players.length + " players left.");
		players.splice( players.indexOf(socket.id), 1); // remove player from array
	});
});

io.on('connection', function(socket){
  
  /** PLAYER JOIN **/
  // player joining request
  socket.on('player join', function(data){
	data.sockID = socket.id;
	// check if total players have maxed
	if( players.length < 5 ){
    	io.emit('player join', data);
	}
	else {
		var msg = "Game is full :(";
  		io.to(socket.id).emit('response reject', msg);
	}
  });
  
  /** PLAYER JOINED **/
  // Sent from game to notify that player has been accepted
  socket.on('player joined', function(data){
  	players.push(data); //add new player's socketID
	  
	//emit to individual player that they hve just joined the game
	var msg = "Successfully joined :)";
	io.to(data).emit('response joined', msg);
  });
	
  /** PLAYER REJECT **/
  // Sent from game to notify that player has been rejected
  socket.on('player reject', function(data){
	//data should be socket id of client
	var msg = "Unable to join game :(";
  	io.to(data).emit('response reject', msg);
  });

  /** PHONE TILT **/
  socket.on('phone tilt', function(data){
    io.emit('phone tilt', data);
  });

  /** GAME FIRE **/
  socket.on('game fire', function(data){
    io.emit('game fire', data);
  });
	
});


http.listen(3000, function(){
	console.log('listening on *:3000');
});
