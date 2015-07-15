"use strict";

/*
 *  Controls and manages top level task app
 * 
 */

angular.module("app.marketplace.system")
		.controller(
				"SystemController",
				[
						"$scope",
						"$location",   
						function($scope, $location ) {
							
//							socketSrv.init((window.location.protocol == "https:" ? 'wss:' : 'ws:') + '//' + window.location.host);
		
							  //init services here
							  elementSrv.initService(); 
							  accountService.init($scope); 
							
                $scope.$watch('account.id', function(newValue, oldValue){
                  if(newValue && newValue!==oldValue){
                    //Account change, reload elements and services.
                  }
                });  
						} ]);
						
		
  
