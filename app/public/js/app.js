var app = angular.module('object-inspector', []);

app.directive('editInPlace', function() {
	return {
		restrict: 'E',
		scope: { value: '=', pool: '=' },
		template: '<span class="object_index_width" ng-click="edit()" ng-bind="value"></span><input class="object_index_width" ng-keyup="$event.keyCode == 13 ? loseFocus() : null" ng-blur="updateChange(pool)" ng-focus="saveLastIndex(pool)" ng-model="value"></input>',
		link: function ( $scope, element, attrs ) {
			// Let's get a reference to the input element, as we'll want to reference it.
			var inputElement = angular.element( element.children()[1] );
			var lastIndex;

			// This directive should have a set class so we can style it.
			element.addClass( 'edit-in-place' );

			// Initially, we're not editing.
			$scope.editing = false;

			// ng-click handler to activate edit-in-place
			$scope.edit = function () {
				$scope.editing = true;

				// We control display through a class on the directive itself. See the CSS.
				element.addClass( 'active' );

				// And we must focus the element. 
				// `angular.element()` provides a chainable array, like jQuery so to access a native DOM function, 
				// we have to reference the first element in the array.
				inputElement[0].focus();
			};
			
			$scope.loseFocus = function() {
				inputElement.blur()
			};
			
			$scope.saveLastIndex = function(pool) {
				lastIndex = pool.currentIndex;
			};
			
			$scope.updateChange = function(pool) {
				$scope.editing = false;
				element.removeClass('active');
				
				var val = parseInt(inputElement.val());				
				if(isNaN(val) || pool.objects.length-1 < val || val < 0) {
					pool.currentIndex = lastIndex;
				}
				else {
					pool.currentIndex = val;
					pool.currentObject = pool.objects[val];
				}
				
			};						
		}
	};	
});

app.directive('editInPlaceSimple', ['SocketService', function(SocketService) {
	return {
		restrict: 'E',
		scope: { value: '=', field: '=', object: '=', pool: '=' },
		template: '<span class="" ng-click="edit()" ng-bind="value"></span><input class="cell_input" ng-keyup="$event.keyCode == 13 ? loseFocus() : null" ng-blur="updateCellChange(pool, object, field)" ng-focus="saveLastCellValue(field)" ng-model="value"></input>',
		link: function ( $scope, element, attrs ) {
			// Let's get a reference to the input element, as we'll want to reference it.
			var inputElement = angular.element( element.children()[1] );
			var lastValue;

			// This directive should have a set class so we can style it.
			element.addClass( 'edit-in-place' );

			// Initially, we're not editing.
			$scope.editing = false;

			// ng-click handler to activate edit-in-place
			$scope.edit = function () {
				$scope.editing = true;

				// We control display through a class on the directive itself. See the CSS.
				element.addClass( 'active' );

				// And we must focus the element. 
				// `angular.element()` provides a chainable array, like jQuery so to access a native DOM function, 
				// we have to reference the first element in the array.
				inputElement[0].focus();
			};
			
			$scope.loseFocus = function() {
				inputElement.blur();
			};
			
			$scope.saveLastCellValue = function(field) {
				lastValue = inputElement.val();
			};
			
			$scope.updateCellChange = function(pool, object, field) {
				$scope.editing = false;
				element.removeClass('active');
				
				var temp = inputElement.val(),
					wasUpdated = false;
				//TODO
				// check that the type is valid, float, byte, int, etc
				// if not load the previous value, if valid then call SocketService to update 
				// the backend with the new value
				switch(field.type) {
					case 'float':
						temp = parseFloat(temp)
						if(isNaN(temp)) {
							field.value = lastValue;
						}
						else {
							field.value = temp;
							wasUpdated = true;
						}
						break;
					case 'int':
						temp = parseInt(temp)
						if(isNaN(temp)) {
							field.value = lastValue;
						}
						else {
							field.value = temp;
							wasUpdated = true;
						}
						break;
					case 'byte':
						temp = parseInt(temp)
						if(isNaN(temp) || temp > 255 || temp < 0) {
							field.value = lastValue;							
						}
						else {
							field.value = temp;
							wasUpdated = true;
						}
						break;
					case 'double':
						temp = parseFloat(temp)
						if(isNaN(temp)) {
							field.value = lastValue;
						}
						else {
							field.value = temp;
							wasUpdated = true;
						}
						break;
					case 'long':
						temp = parseInt(temp)
						if(isNaN(temp)) {
							field.value = lastValue;
						}
						else {
							field.value = temp;
							wasUpdated = true;
						}
						break;
					case 'boolean':
						if(temp == "false")
							field.value = false;
						else if(temp == "true")
							field.value = true;
						else
							field.value = lastValue;
						
						wasUpdated = true;
						break;
					case 'char':
						temp = String(temp);
						if(temp) {
							field.value = temp;
							wasUpdated = true;
						}
						else {
							field.value = lastValue;
						}
						break;
					case 'short':
						temp = parseInt(temp)
						if(isNaN(temp) || temp > 32767 || temp < -32768) {
							field.value = lastValue;
						}
						else {
							field.value = temp;
							wasUpdated = true;
						}
						break;
				}
				
				if(wasUpdated) {
					var data = {
						class_name: pool.class_name,
						object_id: object.id,
						field: field
					};
					
					SocketService.fieldUpdatedAtWebClient(data);
				}
				
			};						
		}
	};	
}]);

app.service('SocketService', ['ModelService', function(ModelService) {	
	var RECEIVE_OBJECT_POOLS = "RECEIVE_OBJECT_POOLS",
		RECEIVE_OBJECT_POOL = "RECEIVE_OBJECT_POOL",
		RECEIVE_OBJECT = "RECEIVE_OBJECT",
		REMOVE_OBJECT_FROM_POOL = "REMOVE_OBJECT_FROM_POOL",
		UPDATE_OBJECT_FIELDS = "UPDATE_OBJECT_FIELDS",
		CLEAR_ALL_POOLS = "CLEAR_ALL_POOLS",
		CLEAR_ALL_POOLS_BACKEND = "CLEAR_ALL_POOLS_BACKEND",
		FIELD_UPDATED_AT_WEB_CLIENT = "FIELD_UPDATED_AT_WEB_CLIENT";
	
	var REQUEST_DELAY = 5000;
	var socket = io.connect('http://localhost:8080', {query: 'webclient=true'});		
	
	socket.on('connect', function(data) {
	});
	
	//plural
	socket.on(RECEIVE_OBJECT_POOLS, function (data) {
		ModelService.setObjectPools(data);
	});
	
	//singular
	socket.on(RECEIVE_OBJECT_POOL, function (data) {
		ModelService.addObjectPool(data);
	});
	
	socket.on(RECEIVE_OBJECT, function (data) {
		ModelService.addObject(data);
	});
	
	socket.on(REMOVE_OBJECT_FROM_POOL, function (data) {
		ModelService.removeObject(data);
	});
	
	socket.on(UPDATE_OBJECT_FIELDS, function (data) {
		ModelService.updateObjectFields(data);
	});
	
	socket.on(CLEAR_ALL_POOLS, function () {
		ModelService.clearAllPools();
	});	
	
	this.clearAllPoolsBackend = function() {
		socket.emit(CLEAR_ALL_POOLS_BACKEND);
	};
	
	this.fieldUpdatedAtWebClient = function(data) {
		socket.emit(FIELD_UPDATED_AT_WEB_CLIENT, data);	
	};
	
}]);

app.service('ModelService', [function() {
	var objectPools = [];
	this.objectPoolChanges = false; //remove if not used TODO
	var onObjectPoolsChangeCallbacks = [],
		onObjectUpdateCallbacks = [];
	
	this.getObjectPools = function() {
		return objectPools;	
	};
	
	this.clearAllPools = function() {
		objectPools.splice(0, objectPools.length);
		for(var i = 0; i < onObjectUpdateCallbacks.length; i++)
			onObjectUpdateCallbacks[i]();
	};
	
	this.setObjectPools = function(data) {
		objectPools = data;
		
		for(var i = 0; i < objectPools.length; i++) {
			if(objectPools[i].objects.length == 0) {
				objectPools[i].currentIndex = -1;
				objectPools[i].currentObject = [];
				objectPools[i].isViewExpanded = true;
				objectPools[i].customClassName = objectPools[i].class_name;
				objectPools[i].totalObjects = 0;
				objectPools[i].isVisible = true;
			}
			else {
				objectPools[i].currentIndex = 0;
				objectPools[i].currentObject = objectPools[i].objects[0];
				objectPools[i].isViewExpanded = true;
				objectPools[i].customClassName = objectPools[i].class_name;
				objectPools[i].totalObjects = objectPools[i].objects.length - 1;
				objectPools[i].isVisible = true;
			}
		}
		
		for(var i = 0; i < onObjectPoolsChangeCallbacks.length; i++)
			onObjectPoolsChangeCallbacks[i](data);
	};
	
	this.addObjectPool = function(objectPool) {
		objectPools.push(objectPool);	
		
		if(objectPool.objects.length == 0) {
			objectPool.currentIndex = -1;
			objectPool.currentObject = [];
			objectPool.isViewExpanded = true;
			objectPool.customClassName = objectPool.class_name;
			objectPool.totalObjects = 0;
			objectPool.isVisible = true;
		}
		else {
			objectPool.currentIndex = 0;
			objectPool.currentObject = objectPool.objects[0];
			objectPool.isViewExpanded = true;
			objectPool.customClassName = objectPool.class_name;
			objectPool.totalObjects = objectPool.objects.length - 1;
			objectPool.isVisible = true;
		}
	};
	
	this.addObject = function(object) {
		for(i = 0; i < objectPools.length; i++) {
			if(objectPools[i].class_name === object.class_name) {
				objectPools[i].objects.push(object);	
				objectPools[i].totalObjects = objectPools[i].objects.length - 1;
				
				if(objectPools[i].currentIndex == -1 && objectPools[i].objects.length > 0) {
					objectPools[i].currentIndex = 0;
					objectPools[i].currentObject = objectPools[i].objects[0];
				}
			}
		}
	};
	
	this.removeObject = function(object) {
		for(i = 0; i < objectPools.length; i++) {
			if(objectPools[i].class_name === object.class_name) {
				objectPools[i].objects.splice(objectPools[i].objects.indexOf(object), 1);
				objectPools[i].totalObjects = objectPools[i].objects.length - 1;
				
				if(objectPools[i].objects.length-1 < objectPools[i].currentIndex) {
					objectPools[i].currentIndex = -1;
					objectPools[i].currentObject = [];
				}
			}
		}
	};
	
	this.registerOnObjectPoolsChange = function(callback) {
		onObjectPoolsChangeCallbacks.push(callback);
	};
	
	this.registerOnObjectUpdate = function(callback) {
		onObjectUpdateCallbacks.push(callback);
	};
	
	this.updateObjectFields = function(pools) {
		for(var i = 0; i < pools.length; i++) {
			for(var x = 0; x < objectPools.length; x++) {
				
				if(pools[i].class_name === objectPools[x].class_name) {
					for(var y = 0; y < pools[i].objects.length; y++ ) {
						for(var z = 0; z < objectPools[x].objects.length; z++) {
							if(pools[i].objects[y].id === objectPools[x].objects[z].id) {
								
								for(var a = 0; a < pools[i].objects[y].fields.length; a++) {
									for(var b = 0; b < objectPools[x].objects[z].fields.length; b++) {
										if(pools[i].objects[y].fields[a].name === objectPools[x].objects[z].fields[b].name) {
											
											objectPools[x].objects[z].fields[b].value = pools[i].objects[y].fields[a].value;
											break;
										}
									}
								}
								break;
							}
						}
					}					
					break;
				}
			}
		}
		
		for(var i = 0; i < onObjectUpdateCallbacks.length; i++)
			onObjectUpdateCallbacks[i]();		
	};
	
}]);

app.controller('InspectorController', ['$scope', 'SocketService', 'ModelService', '$window', '$timeout', function($scope, SocketService, ModelService, $window, $timeout) {
	$scope.objectPools = [];
	$scope.searchText = "";
	var isFullClassName = true;	
	
	function loadHashIfNeeded() {
		var hash = $window.location.hash;
		if(!hash)
			return;
		
		hash = hash.replace('#', '');
		$scope.searchText = hash;
		$scope.performSearchBarUpdate();
	}
	
	$scope.toggleTable = function(pool) {
		pool.isViewExpanded = !pool.isViewExpanded;
	};
	
	$scope.setTableVisibilityAll = function(visible) {
		for(var i = 0; i < $scope.objectPools.length; i++)
			$scope.objectPools[i].isViewExpanded = visible;
	};
	
	ModelService.registerOnObjectPoolsChange(function(objectPools) {		
		$scope.$apply(function() {
			$scope.objectPools = objectPools;
		});
	});
	
	ModelService.registerOnObjectUpdate(function() {		
		$scope.$apply();
	});
	
	$scope.previousObject = function(pool) {
		if(pool.currentIndex-1 < 0)		  	
			return;
		
		pool.currentIndex--;
		pool.currentObject = pool.objects[pool.currentIndex];
	};
	
	$scope.nextObject = function(pool) {
		if(pool.currentIndex+1 > pool.objects.length-1)
			return;
		
		pool.currentIndex++;
		pool.currentObject = pool.objects[pool.currentIndex];
	};
	
	$scope.clearPoolsBackend = function() {
		SocketService.clearAllPoolsBackend();
	};
	
	$scope.classNameChoiceChanged = function(value) {
		isFullClassName = (value != 'last_segment');		
		for(var i = 0; i < $scope.objectPools.length; i++) {
			if(value == 'last_segment') {				
				$scope.objectPools[i].customClassName = $scope.objectPools[i].class_name.split('.').pop();
			}
			else
				$scope.objectPools[i].customClassName = $scope.objectPools[i].class_name;
		}
		
		if($scope.searchText)
			$scope.performSearchBarUpdate();
	};
	
	$scope.performSearchBarUpdate = function() {
		$scope.setTableVisibilityAll(false);
		var pools = ModelService.getObjectPools();
		var temp;
		console.log(isFullClassName);
		for(var i = 0; i < pools.length; i++) {
			
			temp = (isFullClassName) ? pools[i].class_name : pools[i].customClassName;
			if(matchRuleShort(temp, $scope.searchText + "*"))
				pools[i].isVisible = true;
			else
				pools[i].isVisible = false;
		}						
	};

	function matchRuleShort(str, rule) {
		str = str.toLowerCase();
		rule = rule.toLocaleLowerCase();
		return new RegExp("^" + rule.replace("*", ".*") + "$").test(str);
	}
	
	$scope.openInNewTab = function(className) {
		$window.open('#' + className, '_blank');	
	};
	
	$timeout(loadHashIfNeeded, 1000);	
	
}]);