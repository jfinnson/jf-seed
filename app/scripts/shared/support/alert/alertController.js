//TODO create alertDirective ?
angular.module("app.shared.support")
.controller("AlertCtrl",
    [ "$scope", "alertSrv", function($scope, alertSrv) {
      $scope.alertSrv = alertSrv;

      $scope.closeAlert = function(index) {
        $scope.alert = null;
      };

    } ]);