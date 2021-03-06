var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var MobileDetect = require('mobile-detect');
var players = [];
var port = process.env.PORT || process.env.NODE_PORT || 3000; 
app.use('/assets', express.static(path.resolve(__dirname+"/..")));

app.get('/', function(req, res){
	//the html string being sent

	var md = new MobileDetect(req.headers['user-agent']);
	var filepath = path.resolve(__dirname + '/../../index.html');
	if(md.mobile() != null) {
		filepath = path.resolve(__dirname + '/../../mobile_index.html');
	}
	res.sendFile(filepath);
});


// **** ACTIONS DONE BY SERVER HAVE HIGHER PRIORITY AND INIT BEFORE CLIENT ACTIONS

// Setup socket.io
// listen to connection
io.on('connection', function(socket){
	//broadcast that a user has connected
	//pass an object containing user informatiojn?
  io.to(socket.id).emit('game init', {id:socket.id});
  //DISCONNECT PLAYERS
  //forces ids passed in out of the game
  socket.on('disconnect players', function(data){
  	data.sockets.forEach(function(sock){
  		io.to(sock).emit('disconnect players', data);
  	});
  });
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
	data.id = socket.id;
	// check if total players have maxed
    	io.emit('player join', data);
			io.to(socket.id).emit('player id', socket.id);
  });
  
  /** 
		PLAYER JOINED 
	**/
  // Sent from game to notify that player has been accepted
	// players.push(data.id); //add new player's socketID
	// emit to individual player that they hve just joined the game
  socket.on('player joined', function(data){
		var msg = data;
		io.to(data.id).emit('response joined', msg);
  });
	
  /** 
		PLAYER REJECT 
	**/
  // Sent from game to notify that player has been rejected
	// data should be socket id of client
  socket.on('player reject', function(data){
  	io.to(data.id).emit('response reject', data.msg);
  });

  /** 
		PHONE TILT 
	**/
  socket.on('phone tilt', function(data){
    io.to(data.room).emit('phone tilt', data);
  });
	
	/** 
		COLOR SELECTION 
	**/
	// mobile -> game
	socket.on('player color', function(data){
		io.to(data.room).emit('player color', data);
	});
	// game -> mobile
	socket.on('player colorcheck', function(data){
		io.to(data.sockID).emit('color check', data);
	});
	//mobile -> game
	// request what colors are available
	socket.on("color getAvail", function(data){
		io.to(data.room).emit('color checkAvail', data.color);
	});
	
	// game -> mobile (all)
	// let all mobile clients know that a color is taken (return response)
  //---------------------------- MUST GO TO ALL PLAYERS IN THAT GAME ----------------------------------------------//
	socket.on("color selected", function(data){
		data.players.forEach(function(p){
			io.to(p).emit('color selected', data);
		});
	});
	
	/** 
		PLAYER NAME 
	**/
	socket.on('player name', function(data){
		console.log(data.room);
		io.to(data.room).emit('player name', data);
	});
	
	/** 
		PLAYER READY 
	**/
	socket.on('player ready', function(data){
		io.to(data.room).emit("player ready", data);
	});
	
	/**
	 GAME START
	**/
	// game -> mobile (all)
	socket.on('game started', function(data){
		data.players.forEach(function(p){
			io.to(p).emit('game start', data);
		});
	});
	
  /** 
		GAME FIRE 
	**/
  socket.on('game fire', function(data){
    io.to(data.room).emit('game fire', data);
  });
  socket.on('pull start', function(data){
    io.to(data.room).emit('pull start', data);
  });
	
});


http.listen(port, function(){
	console.log('listening on *:3000');
});
