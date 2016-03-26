'use strict';

var manager = function() {
	var objectPools = [];
	
	var getObjectPools = function() {
		return objectPools;	
	};
	
	var getObjectPoolByClassName = function(className) {
		for(var i = 0; i < objectPools.length; i++) {
			if(objectPools[i].class_name == className)
				return objectPools[i];
		}
		return null;
	};
	
	var addObjectPool = function(obj) {
		objectPools.push(obj);	
	};
	
	var addObjectToObjectPool = function(obj) {
		for(var i = 0; i < objectPools.length; i++) {
			if(objectPools[i].class_name == obj.class_name) {				
				objectPools[i].objects.push(obj);
			}
		}
	};
	
	var removeObjectFromObjectPool = function(obj) {
		for(var i = 0; i < objectPools.length; i++) {
			if(objectPools[i].class_name === obj.class_name) {
				for(var x = 0; x < objectPools[i].objects.length; x++) {
					if(objectPool[i].objects[x].id === obj.id)
						objectPools[i].objects.splice(x, 1);
				}
			}
		}
	};
	
	var removeObjectPool = function(obj) {
		for(var i = 0; i < objectPools.length; i++) {
			if(objectPools[i].class_name == className)
				objectPools.splice(i, 1);
		}
	};
	
	var clearAllPools = function() {
		objectPools = [];
	};
	
	return {
		getObjectPoolByClassName : getObjectPoolByClassName,
		addObjectPool: addObjectPool,
		addObjectToObjectPool: addObjectToObjectPool,
		removeObjectFromObjectPool: removeObjectFromObjectPool,
		removeObjectPool: removeObjectPool,
		getObjectPools: getObjectPools,
		clearAllPools: clearAllPools,
	};
};


module.exports = manager();