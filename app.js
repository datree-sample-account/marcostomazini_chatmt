var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
	
var port = process.env.PORT || 5000; // Use the port that Heroku provides or default to 5000
server.listen(port, function() {
  console.log("Express server listening on port");
});
	
app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

// Heroku won't actually allow us to use WebSockets
// so we have to setup polling instead.
// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});
   
io.sockets.on('connection', function(socket){

	socket.on('set nickname', function (name) {
        io.sockets[name] = socket.id;
    });
	
	socket.on("private", function(data) {
		var idLoc = io.sockets[data.id];
		var idDest = io.sockets[data.to];
		
		if (idDest == undefined)
		{
			idDest = "USUARIO NAO EXISTE";
		}
		io.sockets.socket(idLoc).emit("private", { from: data.id, to: data.to, msg: data.msg, idLocal: idLoc, idDestino: idDest });		
		io.sockets.socket(idDest).emit("private", { from: data.id, to: data.to, msg: data.msg, idLocal: idLoc, idDestino: idDest });
	});
   
	socket.on('send message', function(data){
		io.sockets.emit('new message', data);
	});
});