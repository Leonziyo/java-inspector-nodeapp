var express = require('express'),
	router = express.Router();

router.get('/', function(req, res) {
	res.redirect('/dashboard');
});

router.get('/index.html', function(req, res) {
	res.redirect('/dashboard');
});

router.get('/dashboard', function(req, res) {
	var poolManager = require(global.__base + '/ObjectPoolManager');
	
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(poolManager.getObjectPools()));
	
	// clientSocket.emit(UPDATE_OBJECT_POOL_OBJECT, { hello: 'world' });
  	// res.sendfile(__dirname + '/views/index.html');
});

module.exports = router;