angular.module("app.shared")
.controller("AlertCtrl",
    [ "$scope", "alertSrv", function($scope, alertSrv) {
      $scope.alertSrv = alertSrv;

      $scope.closeAlert = function(index) {
        $scope.alert = null;
      };

    } ])

.controller("TestingController", [ "$scope", function($scope) {
} ])

.controller("AboutController", [ "$scope", function($scope) {
} ]);
