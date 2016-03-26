'use strict';

global.__base = __dirname;

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);

var temp = require('./socketEvents.js'),
	clientSocket = temp.clientSocket,
	eventHandler = temp.eventHandler,
	middleware = temp.middleware;

io.use(middleware);
io.on('connection', eventHandler);

//var routes = require('./routes/routes.js');
//app.use('/app/', routes);

app.use(express.static(global.__base + '/public'));

console.log('running...');