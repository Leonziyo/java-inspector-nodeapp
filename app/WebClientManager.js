'use strict';

var manager = function() {
	
	var sockets = [];
	
	var getSockets = function() {
		return sockets;	
	};
	
	var getSocketAt = function(index) {
		if(sockets.length-1 < index)
			return null;		
		return sockets[index];
	};
	
	var addSocket = function(socket) {
		sockets.push(socket);	
	};
	
	var removeSocket = function(socket) {		
		i = sockets.indexOf(socket);
		if(i >= 0)
			sockets.splice(i, 1);	
	};
	
	return {
		getSockets: getSockets,
		getSocketAt: getSocketAt,
		addSocket: addSocket,
		removeSocket: removeSocket
	};
};

module.exports = manager();