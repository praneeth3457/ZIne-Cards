// var User = require('../schemas/user');

// var config = require('../../config');
var session = require('express-session');

// var secretKey = config.secretKey;

module.exports = function(app, express) {

	var api = express.Router();

	api.get('/test', function(req, res) {
    console.log('Hello');
			res.json({message: 'Success'});
	});

  return api
}
