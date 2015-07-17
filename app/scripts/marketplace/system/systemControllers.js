/*
 *  Controls and manages top level task app
 * 
 */
angular.module("app.marketplace.system").controller("SystemController",
    [ "$scope", "$location","elementSrv", function($scope, $location, elementSrv) {

      //							socketSrv.init((window.location.protocol == "https:" ? 'wss:' : 'ws:') + '//' + window.location.host);

      //init services here
      elementSrv.initService();
//      accountService.init($scope);
      
      //For demo TODO remove
      elementSrv.getEles('product').then(function(products){
        $scope.products = products;
      });

      $scope.$watch('account.id', function(newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          //Account change, reload elements and services.
        }
      });
    } ]);
