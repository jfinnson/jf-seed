"use strict";

// local storage version
angular
		.module("app.shared")
    // Web server api service. Single point for api calls.
		.service(
				"serverAPI",
				[
						"$http",
						function($http) {

							/**
               * Single point for http calls
               * 
               * @param options =
               *          {isAsync, dataType, checkCache, doCache, dbRef,
               *          eleType, dataContent, POST, noLoadingImg}
               */
							var doAPICall = function(fromUrl, options) {
								// Assert
								if (!fromUrl) {
									throw "Empty fromUrl passed";
									return false;
								}

								// If null then create empty object
								if (!options) {
									options = {};
								}

								// Returns a promise
								// (http://docs.angularjs.org/api/ng.$q)
								return $http({
									url : fromUrl,
									async : options.isAsync || false,
									dataType : options.dataType,
									data : options.dataContent,
									method : options.method || "GET"
								})
										.success(
												function(data, status, headers,config) {
												})
										.error(
												function(data, status, headers,
														config) {
                          throw ("Error with api call: "
                              + fromUrl
                              + ". Error status: "
                              + status);
												});
							};

	  // Web socket service
		.service(
				"socketSrv",
				["$rootScope",
				 function($rootScope) {
					var connection = null;
					var attempts = 1;
					var msgCount = 0;
					var callbacks = {};
					var address = null;
					var scope = $rootScope;
					
					var _init = function(newAddress, newScope){
						address = newAddress;
						if(newScope)scope = newScope;
						_createWebSocket();
					};
					
					var _createWebSocket = function(){
						if(!address)return false;
						connection = new WebSocket( address );
						
						connection.onopen = function () {
							scope.$emit("websocket-status", {"status": "open", "message" : "Websocket Open"} );
					        console.log( "Opened websocket" );
					        attempts = 1;

					        this.send( '{ "type": "login", "account_type": "client", "token" : "'+ $rootScope.account.token + '"}');
					        
						};

						connection.onclose = function () {
							scope.$emit("websocket-status", {"status": "error", "message" : "Websocket closed"} ); // close
							var time = _generateInterval( attempts );
					        setTimeout(
					          function () {
					            attempts++;
					            _createWebSocket();
					          }, time
					        );
						};

						connection.onerror = function ( error ) {
							scope.$emit("websocket-status", {"status": "error", "message" : "Websocket error"} );
					        console.log( "Websocket error: " + error );
						}

						connection.onmessage = function ( e ) {
					        console.log( "Websocket message: ", e.data );
					        var message = JSON.parse( e.data );
							if($.isPlainObject(message) && message.body){
								message.body.datetime = (new Date()).toString();
								message.body.id = msgCount++;
							}
					        _dispatchMessage( message );
						};
					};
					
					var _sendMessage = function ( message, callback, timeout ) {
					      if ( "tag" in message ) {
					        if ( message.tag in this.callbacks ) {
					          console.log( "Problem! Tag already exists in callbacks" );
					        }
					        this.callbacks[message.tag] = { timeout: timeout || 60, callback: callback };
					      }
					      connection.send( JSON.stringify( message ) );
					};

				    var _dispatchMessage = function ( message ) {
				      switch ( message.type ) {
				        case "command_response":
				          if ( message.command_tag in callbacks ) {
				            callbacks[message.command_tag].callback( message );
				          }
				          else {
				            console.log( "No callback for tag <" + message.tag + "> in the callback queue" );
				          }
				          break;
				        case "command":
				          break;
				        case "status_update":
				          scope.$emit("websocket-status_update", message.body );
				          break;
				        default:
				          console.log( "Unknown message from websocket" );
				      }
				    };

				    var _removeTag = function ( tag ) {
				      delete this.callbacks[tag];
				    };

				    var _generateInterval = function ( k ) {
				      var maxInterval = ( Math.pow(2, k) - 1 ) * 1000;

				      if (maxInterval > 30*1000) {
				        maxInterval = 30*1000; // If the generated interval is more
                                        // than 30 seconds, truncate it down to
                                        // 30 seconds.
				      }
				      // generate the interval to a random number between 0 and the
              // maxInterval determined from above
				      return Math.random() * maxInterval;
				    };
					
					return {
						init: _init,
						createWebSocket : _createWebSocket,
						sendMessage : _sendMessage,
						generateInterval: _generateInterval,
						dispatchMessage : _dispatchMessage,
						removeTag : _removeTag

					};

				} ])
				

		// TODO reassess. Provides service for accessing global variables.
		.service("globalVariablesSrv", ["$timeout", function($timeout) {
			var globalVariables = { 
					"currTimeVal" : new Date().getTime(),
					"currTimeValUTC" : moment().utc().valueOf()
					
			};

			$timeout(function(){
				globalVariables["currTimeVal"]=new Date().getTime();
				globalVariables["currTimeValUTC"]=moment().utc().valueOf();
			},1000);
			
			return {
				getVar : function(name) {
					return globalVariables[name];
				} 

			};

		} ])

		// Service that provides functions for checking the online status of the app
		.service("onlineUtils",
				[ "$window", "$rootScope", function($window, $rootScope) {

					$rootScope.online = navigator.onLine;
					$window.addEventListener("offline", function() {
						$rootScope.$apply(function() {
							$rootScope.online = false;
						});
					}, false);
					$window.addEventListener("online", function() {
						$rootScope.$apply(function() {
							$rootScope.online = true;
						});
					}, false);

					return {
						isOnline : function() {
							if ($rootScope.db.active) {
								return $rootScope.online;
							} else {
								return false;
							}
						}
					};
				} ])
				
				
		// Alert service for displaying bootstrap alerts
		.service("alertSrv", [ "$timeout", function($timeout) {
			 
			var _setAlert = function(scope, message, type, ignoreTimeout, override) {
				// - If a new scan occurs during 10 seconds, go back to white for 1
        // second, then show colour
				if(timeoutActive && !ignoreTimeout){
					scope.alert = {
							type : 'info',
							msg : ""
						};
					$timeout(function() {
						_setAlert(scope, message, type, true, override);
				        }, 1000);
					return false;
				}
				
				scope.alert = {
					type : (type || 'error'),
					msg : (message)
				};
				// scope.$apply();
				
				scope.showOverrideOpt = override;
			}
		
			var _closeAlert = function(scope) {
				scope.alert.msg = "";
			}
			
			// Use count to allow for multiple timeouts with non-conflicting check
      // values.
			var timeoutCount = 0;
			var timeoutActive = false;
		
			return {
				timedChange : function(scope, message, type, time){
					timeoutCount++;
					var myTC = timeoutCount;
					timeoutActive = true;
					$timeout(function() {
						if(myTC==timeoutCount){
							_setAlert(scope, message, type);
							timeoutActive = false;
						}
				        }, time);
				},
				
				setAlert : _setAlert, 
				closeAlert : _closeAlert
			}
		
		} ])

		// Other general services
		.service("generalUtils",
				[function(){
					var fixDate = function (d, check) { // force d to be on check's YMD,
                                              // for daylight savings purposes
						if (+d) { // prevent infinite looping on invalid dates
							while (d.getDate() != check.getDate()) {
								d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
							}
						}
					}
					return {
						parseISO8601 : function(s, ignoreTimezone) { // ignoreTimezone
                                                          // defaults to false
							// derived from http://delete.me.uk/2005/03/iso8601.html
							// TODO: for a know glitch/feature, read
              // tests/issue_206_parseDate_dst.html
							var m = s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
							if (!m) {
								return null;
							}
							var date = new Date(m[1], 0, 1);
							if (ignoreTimezone || !m[13]) {
								var check = new Date(m[1], 0, 1, 9, 0);
								if (m[3]) {
									date.setMonth(m[3] - 1);
									check.setMonth(m[3] - 1);
								}
								if (m[5]) {
									date.setDate(m[5]);
									check.setDate(m[5]);
								}
								fixDate(date, check);
								if (m[7]) {
									date.setHours(m[7]);
								}
								if (m[8]) {
									date.setMinutes(m[8]);
								}
								if (m[10]) {
									date.setSeconds(m[10]);
								}
								if (m[12]) {
									date.setMilliseconds(Number("0." + m[12]) * 1000);
								}
								fixDate(date, check);
							}else{
								date.setUTCFullYear(
									m[1],
									m[3] ? m[3] - 1 : 0,
									m[5] || 1
								);
								date.setUTCHours(
									m[7] || 0,
									m[8] || 0,
									m[10] || 0,
									m[12] ? Number("0." + m[12]) * 1000 : 0
								);
								if (m[14]) {
									var offset = Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0);
									offset *= m[15] == '-' ? 1 : -1;
									date = new Date(+date + (offset * 60 * 1000));
								}
							}
							return date;
						},
						one_day : (24 * 60 * 60 * 1000),
						one_hour : (60 * 60 * 1000)
					}
				}])
				
		.service("localStorageService", 
      ["onlineUtils", "$rootScope",
        function( onlineUtils, $rootScope) { 
          var appID = "WP-"; // String to go before every storage id.
          
          var getStorageID = function(STORAGE_ID, ignoreAccount){
            var combinedID = appID+STORAGE_ID;
            if(!ignoreAccount && $rootScope && $rootScope.account && $rootScope.account.name){
              combinedID = $rootScope.account.name + "_" + combinedID;
            }
            return combinedID;
          }
          
          this.getItem = function(STORAGE_ID, ignoreAccount){
            return localStorage.getItem(getStorageID(STORAGE_ID, ignoreAccount));
          }
          this.setItem = function(STORAGE_ID, data, ignoreAccount){
            return localStorage.setItem(getStorageID(STORAGE_ID, ignoreAccount), JSON.stringify(data)); 
          }
  
        } ]);

 