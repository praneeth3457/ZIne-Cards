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

app.use(express.static(__dirname + ''));



///////////////////////////////////
////// --- WEB SOCKETS --- ////////
///////////////////////////////////

cards = [0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9];
users = [];
connections = [];
gameUsers = [];
throwCards = [];
newUser = {
						gameId : 1,
						userCount : 1,
						started : false,
						completed : false,
						cards : cards.slice(),
						round : 5,
						calRound : 5,
						remainingCards : cards.slice(),
						users : []
					};

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
		userData.userNo = 1;
		userData.pointsPer = (userData.points/200)*100;

		// checking for total active games
		var gamesLength = gameUsers.length;

		// checking if there is atleast active game
		if(gamesLength > 0) {
			//checking for present active game users
			var presentGameUsers = gameUsers[gamesLength - 1].userCount;
			if(presentGameUsers >= 5) {
				newUser.users.push(userData);
				gameUsers.push(newUser);
			} else {
				var isUserExist = false;
				for(var i=0; i<gameUsers[gamesLength - 1].userCount; i++){
					if(gameUsers[gamesLength - 1].users[i].username == userData.username){
						isUserExist = true;
					}
				}
				if(isUserExist == false) {
					gameUsers[gamesLength - 1].userCount = presentGameUsers + 1;
					//gameUsers[gamesLength - 1].calRound += 5;
					userData.userNo = presentGameUsers + 1;
					gameUsers[gamesLength - 1].users.push(userData);
					if(presentGameUsers == 1){
						startTimeInterval(true, gameUsers[gamesLength - 1]);
					}
				}
			}
		} else {
			newUser.users.push(userData);
			gameUsers.push(newUser);
		}

		io.sockets.emit('get game user', gameUsers[gameUsers.length - 1]);
	});

	startTimeInterval = function(check, gameDetails){
		var time = 60;
		var startTime = setInterval(function(){
			time = time - 1;
			if(time < 0) {
				clearInterval(startTime);
				io.sockets.emit('get start game', true);
				getNewCards(3, gameDetails);
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
				var pickedNum = Math.round(random * (remCardsLen - 1));
				gameDetails.users[j].presentCards.push(gameDetails.remainingCards[pickedNum]);
				gameDetails.remainingCards.splice(pickedNum, 1);
				i++;
			}
			while (i < num);
		}
		getNewPickedCard(gameDetails);


		//for timer
		if(num == 3) {
			var randomTimer = Math.random();
			var userLens = gameDetails.users.length;
			var pickedNum = Math.round(random * (userLens - 1));
			var timerUserSelected = gameDetails.users[pickedNum].userNo;
			timer(timerUserSelected, gameDetails.userCount);
		}

	}

	getNewPickedCard = function(gameDetails) {
		io.sockets.emit('get game cards', gameDetails);
	}

	socket.on('place show', function(data){
		placeAShow(data);
	});

	socket.on('set drop card', function(data){
		//socket.emit('get game cards', data.gameDetails);
		socket.emit('get drop card', data);
		if(data.gameDetails.remainingCards == 0) {
			placeAShow(data);
		} else {
			getNewPickedCard(data.gameDetails);
			// setInterval(function() {
				var selectNewUser = data.userNo + 1;
				if(selectNewUser > data.gameDetails.userCount){
					selectNewUser = 1;
				}
				if(isTimer) {
					clearInterval(gameRoundTimer);
				}
				//var calRound = data.gameDetails.userCount * 5;

				timer(selectNewUser, data.gameDetails.userCount);
			// }, 2000);
		}

	});
	function timer(user, count) {
			var roundTime = 15;
			gameRoundTimer = setInterval(function(){
				roundTime = roundTime - 1;
				if(roundTime <= 0) {
					isTimer = false;
					clearInterval(gameRoundTimer);
					io.sockets.emit('get start game', true);
					var selectNewUser = user + 1;
					if(selectNewUser > count){
						selectNewUser = 1;
					}
					timer(selectNewUser, count);
					//getNewCards(1, gameDetails);
				} else {
					isTimer = true;
					io.sockets.emit('get game round time', {time : roundTime, user: user});
				}

			}, 1000);
			// this.isRunning = function () {
			// 	return timer == true;
			// };
			// this.clear = function() {
			// 	clearInterval(gameRoundTimer);
			// 	timer = false;
			// }
	}
	var placeAShow = function(data) {
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
				data.gameDetails.users[k].pointsPer = (data.gameDetails.users[k].points/200)*100;
			} else if(data.gameDetails.users[k].cardsTotal == min) {
				data.gameDetails.users[k].lastGameStatus = 'min';
				data.gameDetails.users[k].points += 0;
				data.gameDetails.users[k].pointsPer = (data.gameDetails.users[k].points/200)*100;
			} else {
				data.gameDetails.users[k].lastGameStatus = 'none';
				data.gameDetails.users[k].points += data.gameDetails.users[k].cardsTotal;
				data.gameDetails.users[k].pointsPer = (data.gameDetails.users[k].points/200)*100;
			}

			if(data.gameDetails.users[k].points >= 200) {
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
				getNewCards(3, data.gameDetails);
			}, 15500);
		} else {
			io.sockets.emit('game winner', {data : data, winner : userWinner});
		}
		data.gameDetails.remainingCards = cards.slice();


		clearInterval(gameRoundTimer);

		io.sockets.emit('new data', data.gameDetails);
	}

	//set new card
	socket.on('set new card', function(data){
		for(var s=0; s<data.gameDetails.users.length; s++){
			if(data.gameDetails.users[s].username == data.user) {
					var randomPick = Math.random();
					var cardsRemLen = data.gameDetails.remainingCards.length;
					var pickedNumber = Math.round(randomPick * (cardsRemLen - 1));
					data.gameDetails.users[s].presentCards.push(data.gameDetails.remainingCards[pickedNumber]);
					data.gameDetails.remainingCards.splice(pickedNumber, 1);
			}
		}
		getNewPickedCard(data.gameDetails);
	});

});
