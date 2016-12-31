var User = require('../schemas/users');

var config = require('./../config');
var session = require('express-session');

var secretKey = config.secretKey;

module.exports = function(app, express) {

	var api = express.Router();

	api.post('/register', function(req, res) {

		var user = new User({
			avatar: req.body.avatar,
			gender: req.body.gender,
			name: req.body.name,
      username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			games: 0,
			stars: 0,
			wins: 0
		});

		user.save(function(err) {
			if(err) {
				res.send({message: 'Unsuccess', error:err});
				return;
			}

			res.json({message: 'Success'});
		});
	});

	api.get('/stats', function(req, res) {
		User.find({}, function(err, stats) {
			if(err) {
				return res.status(500).send();
			}else if(stats){
				var totalStats = [];
				stats.sort(function (a, b) {
					if (a.stars > b.stars) {
						return 1;
					}
					if (a.stars < b.stars) {
						return -1;
					}

					return 0;

				});

				var checkLevel = stats.length/4;
				var lev = Math.floor(checkLevel);
				var left = stats.length - (lev*4);
				var pla, gol, sil, bro;
				if(left == 3){
					pla = lev;
					gol = lev*2 + 1;
					sil = lev*3 + 2;
					bro = lev*4 + 3;
				} else if(left == 2) {
					pla = lev;
					gol = lev*2;
					sil = lev*3 + 1;
					bro = lev*4 + 2;
				} else if(left == 1) {
					pla = lev;
					gol = lev*2;
					sil = lev*3;
					bro = lev*4 + 1;
				} else {
					pla = lev;
					gol = lev*2;
					sil = lev*3;
					bro = lev*4;
				}

				for(var i=0; i<stats.length; i++) {
					var statsObj = {
						id : stats[i]._id,
						username : stats[i].username,
						rank : stats.length - i,
						games : stats[i].games,
						stars : stats[i].stars,
						level : '',
						avg : (stats[i].stars/stats[i].games).toFixed(2),
						wins : stats[i].wins
					}

					if(statsObj.rank <= pla) {
						statsObj.level = 'Platinum';
					} else if(statsObj.rank > pla && statsObj.rank <= gol) {
						statsObj.level = 'Gold';
					} else if(statsObj.rank > gol && statsObj.rank <= sil) {
						statsObj.level = 'Silver';
					} else if(statsObj.rank > sil && statsObj.rank <= bro) {
						statsObj.level = 'Bronze';
					}

					totalStats.push(statsObj);
				}
			}
				return res.status(200).send({message:'Success', stats: totalStats});
		});
	});

	api.post('/login', function(req, res) {
		User.findOne({username:req.body.username, password:req.body.password}, function(err, user){
			if(err){
				return res.status(500).send();
			}
			if(!user){
				return res.status(200).send({message:'Unsuccess'});
			}
			req.session.user = user;
			// req.sessionStore.user = user;
			return res.status(200).send({message:'Success', user: user});
		})

		api.get('/dashboard', function(req, res) {
			//var session = JSON.parse(req.sessionStore.sessions[Object.keys(req.sessionStore.sessions)[1]]);
			if(!req.session.user) {
				return res.status(401).send();
			} else {
				User.findOne({_id:req.session.user._id}, function(err, user){
					if(err){
						return res.status(500).send();
					}

					if(!user){
						return res.status(200).send({message:'Unsuccess'});
					}

					return res.status(200).send({message:'Success', user: user});
				})
			}
		})

		api.get('/logout', function(req, res) {
			if(!req.session.user) {
				return res.status(401).send();
			}

			req.session.user = null;
			return res.status(200).send({message:'Successfully logged out'});
		})


	});

	//Update Profile
	api.post('/profile', function(req, res) {
		User.update(
	    {_id: req.body._id},
	    {$set: {
				avatar: req.body.avatar,
				gender: req.body.gender,
				name: req.body.name,
	      username: req.body.username,
				email: req.body.email,
				password: req.body.password
			}},
	    {safe: true, upsert: true},
	    function(err, model) {
				if(err) {
					res.send({message: 'Unsuccess', 'error':err});
					return;
				}

				res.json({message: 'Success', res: model});
	    }
		);
	});

	//update stats after the game
	api.post('/updateStats', function(req, res) {
		var stars;
		var wins;
		var error = [];
		for(var i=0; i<req.body.length; i++){
			if(req.body[i].points >= 250){
				stars = 300;
				wins = 1;
			} else {
				stars = req.body[i].points;
				wins = 0;
			}
			User.update(
		    {_id: req.body[i]._id},
		    {$set: {
					games: req.body[i].games + 1,
					stars: req.body[i].stars + stars,
					wins: req.body[i].wins + wins
				}},
		    {safe: true, upsert: true},
		    function(err, model) {
					if(err) {
						error.push(err);
					}


		    }
			);
		}

		if(error.length > 0){
			res.send({message: 'Unsuccess', 'error':err});
			return;
		}
		res.json({message: 'Success'});


	});

	return api

}
