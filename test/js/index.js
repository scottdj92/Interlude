var app = require('express')();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);

app.get('/', function(req, res){
	//the html string being sent
	var filepath = path.resolve(__dirname + '/../index.html');
	res.sendFile(filepath);
});

// Setup socket.io
// listen to connection
io.on('connection', function(socket){
	console.log('a user connected');
	// handle disconnects
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

// get sent message
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
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
  });
});


http.listen(3000, function(){
	console.log('listening on *:3000');
});