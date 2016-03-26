'use strict';

var poolManager = require(global.__base + '/ObjectPoolManager'),
	webClientManager = require(global.__base + '/WebClientManager'),
	appClientManager = require(global.__base + '/AppClientManager');


var REGISTER_OBJECT_POOL = "REGISTER_OBJECT_POOL",
	UPDATE_OBJECT_POOL_OBJECT = "UPDATE_OBJECT_POOL_OBJECT",
	UPDATE_ALL_OBJECT_POOLS = "UPDATE_ALL_OBJECT_POOLS",
	ADD_OBJECT_TO_POOL = "ADD_OBJECT_TO_POOL",
	REMOVE_OBJECT_FROM_POOL = "REMOVE_OBJECT_FROM_POOL";

var RECEIVE_OBJECT_POOLS = "RECEIVE_OBJECT_POOLS",
	RECEIVE_OBJECT_POOL = "RECEIVE_OBJECT_POOL",
	RECEIVE_OBJECT = "RECEIVE_OBJECT",
	UPDATE_OBJECT_FIELDS = "UPDATE_OBJECT_FIELDS",
	CLEAR_ALL_POOLS = "CLEAR_ALL_POOLS",
	CLEAR_ALL_POOLS_BACKEND = "CLEAR_ALL_POOLS_BACKEND",
	FIELD_UPDATED_AT_WEB_CLIENT = "FIELD_UPDATED_AT_WEB_CLIENT";

var clientSocket;

var middleware = function(socket, next) {
	var handshakeData = socket.request;
	if(handshakeData._query['webclient'])
		socket.isWebClient = true;
	else
		socket.isWebClient = false;
	
	//console.log('Web client = ' + socket.isWebClient);
	next();
};

var eventHandler = function (socket) {
	console.log('new connection...');
	clientSocket = socket;
	
	if(socket.isWebClient) {
		webClientManager.addSocket(socket);		
		socket.emit(RECEIVE_OBJECT_POOLS, poolManager.getObjectPools());	
		
		socket.on(CLEAR_ALL_POOLS_BACKEND, function (data) {
			console.log('---------CLEAR_ALL_POOLS_BACKEND-------');
			//console.log(data);

			poolManager.clearAllPools();
		});
		
		socket.on(FIELD_UPDATED_AT_WEB_CLIENT, function (data) {
			console.log('---------FIELD_UPDATED_AT_WEB_CLIENT-------');
			//console.log(data);

			var sockets = appClientManager.getSockets();
			for(var i = 0; i < sockets.length; i++)
				sockets[i].emit(FIELD_UPDATED_AT_WEB_CLIENT, data);
		});
	}
	else {
		appClientManager.addSocket(socket);
		
		socket.on(REGISTER_OBJECT_POOL, function (data) {
			console.log('---------REGISTER_OBJECT_POOL-----');
			//console.log(data);			
			
			poolManager.addObjectPool(data);
			var sockets = webClientManager.getSockets();
			for(var i = 0; i < sockets.length; i++)
				sockets[i].emit(RECEIVE_OBJECT_POOL, data);
		});	

		socket.on(ADD_OBJECT_TO_POOL, function (data) {
			console.log('---------ADD_OBJECT_TO_POOL-------');
			//console.log(data);

			poolManager.addObjectToObjectPool(data);
			var sockets = webClientManager.getSockets();
			for(var i = 0; i < sockets.length; i++)
				sockets[i].emit(RECEIVE_OBJECT, data);
		});	

		socket.on(REMOVE_OBJECT_FROM_POOL, function (data) {
			console.log('---------REMOVE_OBJECT_FROM_POOL-------');
			//console.log(data);

			poolManager.removeObjectFromObjectPool(data);
			var sockets = webClientManager.getSockets();
			for(var i = 0; i < sockets.length; i++)
				sockets[i].emit(REMOVE_OBJECT_FROM_POOL, data);
		});	
		
		socket.on(CLEAR_ALL_POOLS, function (data) {
			console.log('---------CLEAR_ALL_POOLS-------');
			//console.log(data);

			poolManager.clearAllPools();
			var sockets = webClientManager.getSockets();
			for(var i = 0; i < sockets.length; i++)
				sockets[i].emit(CLEAR_ALL_POOLS, data);
		});	

		socket.on(UPDATE_ALL_OBJECT_POOLS, function (data) {			
			//console.log('---------UPDATE_ALL_OBJECT_POOLS------');			
			var newPools = data;
			var oldPools = poolManager.getObjectPools();
			var outputPools = [];
			
			var newPool, oldPool;
			for(var i = 0; i < newPools.length; i++) {
				newPool = newPools[i];
				for(var x = 0; x < oldPools.length; x++) {
					oldPool = oldPools[x];
					if(newPool.class_name === oldPool.class_name) {
						var oldObject, newObject = false;
						var wasPoolCreated = false, tempPool = false;
						for(var y = 0; y < oldPool.objects.length; y++) {
							oldObject = oldPool.objects[y];
							for(var u = 0; u < newPool.objects.length; u++) {
								if(newPool.objects[u].id === oldObject.id) {
									newObject = newPool.objects[u];		
									break;
								}
							}							
							if(newObject === false)
								continue;
							
							var fields = [];
							for(var u = 0; u < newObject.fields.length; u++) {
								if(oldObject.fields[u].value !== newObject.fields[u].value) {
									// make sure to emit event to notify web application
									oldObject.fields[u].value = newObject.fields[u].value;
									
									fields.push(newObject.fields[u]);
								}
							}
							
							if(!wasPoolCreated) {
								wasPoolCreated = true;
								tempPool = {
									class_name: newPool.class_name,
									objects: []
								};
							}
							
							if(fields.length > 0) {
								tempPool.objects.push({
									id: oldObject.id,
									fields: fields
								});
							}
						}
						if(tempPool !== false)
							outputPools.push(tempPool);
						break; //break out of the x loop, since we already got it
					}
				}
			}
			var sockets = webClientManager.getSockets();
			for(var i = 0; i < sockets.length; i++)
				sockets[i].emit(UPDATE_OBJECT_FIELDS, outputPools);
			/*
				TODO
				this method is very important you must check every single object
				and compare it with the one in memory, only send updates for the 
				objects that changed in value, were removed or added
				
				you will need to create another event called UPDATE_OBJECT_FIELDS
				send the classname, id, and the fields that changed
				
				- In case an object pool was added/removed ignore it, it will be 
				hanlded later when the app emits an event to notify a pool was 
				added/removed
				
				- If an object was added, ignore it too, read above				
			*/
		});	
	}
	
	socket.on('disconnect', function() {
		console.log('disconnected');
	});
};

module.exports = {
	eventHandler: eventHandler,
	socket: clientSocket,
	middleware: middleware
};