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
//var sockets = require('./server/sockets.js');
cards = [0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9];
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

	//Setting game user
	socket.on('set game user', function(data){
		userData = data.user;
		userData.gameId = socket.id;
		userData.points = 0;
		userData.presentCards = [];
		userData.pointsPer = (userData.points/250)*100;
		var newUser = {
										gameId : 1,
										userCount : 1,
										started : false,
										completed : false,
										cards : cards.slice(),
										remainingCards : cards.slice(),
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
												cards : cards,
												remainingCards : cards,
												users : [userData]
											}
				gameUsers.push(newGame);
				startTimeInterval(false);
			} else {
				var isUserExist = false;
				for(var i=0; i<gameUsers[gamesLength - 1].userCount; i++){
					if(gameUsers[gamesLength - 1].users[i].username == userData.username){
						isUserExist = true;
					}
				}
				if(isUserExist == false) {
					gameUsers[gamesLength - 1].userCount = presentGameUsers + 1;
					gameUsers[gamesLength - 1].users.push(userData);
					if(presentGameUsers == 1){
						startTimeInterval(true, gameUsers[gamesLength - 1]);
					}
				}
			}
		} else {
			gameUsers.push(newUser);
		}

		startTimeInterval = function(check, gameDetails){
			var time = 60;
			if(check == false) {
				clearInterval(startTime);
				time = 10;
			}
			var startTime = setInterval(function(){
				time = time - 1;
				if(time <= 0) {
					clearInterval(startTime);
					io.sockets.emit('get start game', true);
					getNewCards(2, gameDetails);
				} else {
					io.sockets.emit('get start timer', time);
				}

			}, 1000);
		}

		getNewCards = function(num, gameDetails) {
			for(var j=0; j<gameDetails.users.length; j++){
				var i = 0;
				do {
					var random = Math.random();
					var remCardsLen = gameDetails.remainingCards.length;
					var pickedNum = Math.round(random * remCardsLen);
					// console.log(gameDetails.remainingCards[pickedNum]);
					gameDetails.users[j].presentCards.push(gameDetails.remainingCards[pickedNum]);
					// console.log(gameDetails.users[j].presentCards);
					gameDetails.remainingCards.splice(pickedNum, 1);
					i++;
				}
				while (i < num);
			}
			io.sockets.emit('get game cards', gameDetails);
			if(gameDetails.users[0].presentCards.length < 5) {
				var roundTime = 15;
				gameRoundTimer = setInterval(function(){
					roundTime = roundTime - 1;
					if(roundTime <= 0) {
						clearInterval(gameRoundTimer);
						io.sockets.emit('get start game', true);
						getNewCards(1, gameDetails);
					} else {
						io.sockets.emit('get game round time', roundTime);
					}

				}, 1000);
			} else {
				placeAShow({user: 'Zine auto-show', gameDetails : gameDetails});
			}


		}

		socket.on('place show', function(data){
			placeAShow(data);
		});

		io.sockets.emit('get game user', gameUsers[gameUsers.length - 1]);


		var placeAShow = function(data) {
			console.log(data);
			io.sockets.emit('get placed user', data);
			var usersLen = data.gameDetails.users.length;
			var cardTotalsArray = [];
			var isWinner = false;
			var userWinner;
			for(var i=0; i<usersLen; i++) {
				var cardsTotal = 0;
				for(var j=0; j<data.gameDetails.users[i].presentCards.length; j++) {
					cardsTotal += data.gameDetails.users[i].presentCards[j];
				}
				cardTotalsArray.push(cardsTotal);
				data.gameDetails.users[i].cardsTotal = cardsTotal;
			}
			var max = Math.max.apply( Math, cardTotalsArray );
			var min = Math.min.apply( Math, cardTotalsArray );

			for(var k=0; k<usersLen; k++) {
				var cardsTotal = 0;
        var maxTotal = 0;
				var prevCards = [];
				for(var c=0; c<data.gameDetails.users[k].presentCards.length; c++){
					cardsTotal += data.gameDetails.users[k].presentCards[c];
					maxTotal += 9;
					prevCards.push(data.gameDetails.users[k].presentCards[c]);
				}
				data.gameDetails.users[k].cardsTotalValue = cardsTotal;
				data.gameDetails.users[k].maxTotalValue = maxTotal;
				data.gameDetails.users[k].prevCards = prevCards;
				if(data.gameDetails.users[k].cardsTotal == max) {
					data.gameDetails.users[k].lastGameStatus = 'max';
					data.gameDetails.users[k].points += 50;
					data.gameDetails.users[k].pointsPer = (data.gameDetails.users[k].points/250)*100;
				} else if(data.gameDetails.users[k].cardsTotal == min) {
					data.gameDetails.users[k].lastGameStatus = 'min';
					data.gameDetails.users[k].points += 0;
					data.gameDetails.users[k].pointsPer = (data.gameDetails.users[k].points/250)*100;
				} else {
					data.gameDetails.users[k].lastGameStatus = 'none';
					data.gameDetails.users[k].points += data.gameDetails.users[k].cardsTotal;
					data.gameDetails.users[k].pointsPer = (data.gameDetails.users[k].points/250)*100;
				}

				if(data.gameDetails.users[k].points >= 250) {
					isWinner = true;
					userWinner = data.gameDetails.users[k];
					for(var z=0; z<gameUsers.length; z++) {
						if(gameUsers[z].gameId == data.gameDetails.gameId) {
							gameUsers.splice(z, 1);
						}
					}
				}
				data.gameDetails.users[k].presentCards = [];
			}
			if(!isWinner) {
				setTimeout(function(){
					getNewCards(2, data.gameDetails);
				}, 15500);
			} else {
				io.sockets.emit('game winner', {data : data, winner : userWinner});
			}
			data.gameDetails.remainingCards = cards.slice();


			clearInterval(gameRoundTimer);

			io.sockets.emit('new data', data.gameDetails);
		}
	});
});
