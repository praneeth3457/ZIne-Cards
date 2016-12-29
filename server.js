var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./server/config');
var mongoose = require('mongoose');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var mongoStore = require('connect-mongo')(session);
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

users = [];
connections = [];
gameUsers = []

server.listen(process.env.PORT || 3000);
console.log('server running ...');

mongoose.connect(config.database, function(err) {
	if(err) {
		console.log(err);
	}else{
		console.log('Connected to the database');
	}
});

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(session({
		secret:"udj9sddasdsa78aaf76",
		resave:false,
		saveUninitialized:true,
		store: new mongoStore(
			{
				mongooseConnection: mongoose.connection,
				ttl: 15 * 60 * 60
			}
		)
	})
);

var api = require('./server/routes/signin')(app, express);
app.use('/', api);

app.use(express.static(path.join('')));



///////////////////////////////////
////// --- WEB SOCKETS --- ////////
///////////////////////////////////
io.sockets.on('connection', function(socket) {
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	//Disconnect
	socket.on('disconnect', function(data){
		for(var i=0; i<users.length; i++) {
			if(users[i].id == socket.id) {
				users.splice(i, 1);
				io.sockets.emit('get users', users);
			}
		}
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
	});

	//Send Message
	socket.on('set game user', function(data){
		var userData = data.user;
		userData.points = 0;
		userData.pointsPer = (userData.points/250)*100;
		var newUser = {
										gameId : 1,
										userCount : 1,
										started : false,
										completed : false,
										users : [userData]
									}

		// checking for total active games
		var gamesLength = gameUsers.length;

		// checking if there is atleast active game
		if(gamesLength > 0) {
			//checking for present active game users
			var presentGameUsers = gameUsers[gamesLength - 1].userCount;
			if(presentGameUsers >= 5) {
				var newGame = {
												gameId : gamesLength + 1,
												userCount : 1,
												started : false,
												completed : false,
												users : [userData]
											}
				gameUsers.push(newGame);
				startTimeInterval(false);
			} else {
				gameUsers[gamesLength - 1].userCount = presentGameUsers + 1;
				gameUsers[gamesLength - 1].users.push(userData);
				if(presentGameUsers == 1){
					startTimeInterval(true);
				}
			}
		} else {
			gameUsers.push(newUser);
		}

		startTimeInterval = function(check){
			var time = 90;
			if(check == false) {
				clearInterval(startTime);
				time = 10;
			}
			var startTime = setInterval(function(){
				time = time - 1;
				if(time <= 0) {
					clearInterval(startTime);
				} else {
					io.sockets.emit('get start timer', time);
				}

			}, 1000);
		}

		io.sockets.emit('get game user', gameUsers[gameUsers.length - 1]);
	});
});
