var app = require('express')();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var MobileDetect = require('mobile-detect');
var users = [];
//initialize current number of players within the socket
var numPlayer = 0;

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
	//pass an object containing user information?
    /*socket.broadcast.emit('Broadcast');
	*/
	var userId = socket.handshake.query.user;
	console.log(userId +' connected.');

	//increment number of concurrent players by 1
	numPlayer += 1;
  	socket.join(userId);

  	//sends message object to IO and packages it for emitting to other users
	var msg = { text:"Hello " + userId, id:"Admin"};
	var playerMsg = {text: "You are player " + numPlayer, id:"Admin"};
	io.to(userId).emit('chat message', msg);
	io.to(userId).emit('players', playerMsg);
	io.emit("chat message", msg);
	io.emit('players', playerMsg);

	// handle disconnects
	socket.on('disconnect', function(){
		console.log( userId + ' disconnected');
	});
});



// get sent message
io.on('connection', function(socket){

  socket.on('chat message', function(msg){
    console.log('message: ' + msg.text);

  });
});



// broadcast
io.on('connection', function(socket){
  socket.broadcast.emit('Broadcast');
});

// emit message
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    io.emit('players', playerMsg);
  });
});


http.listen(3000, function(){
	console.log('listening on *:3000');
});
