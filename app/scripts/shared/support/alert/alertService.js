angular.module("app.shared.support")
    // Alert service for displaying bootstrap alerts
    .service("alertSrv", [ "$timeout", function($timeout) {

      var _setAlert = function(scope, message, type, ignoreTimeout, override) {
        // - If a new scan occurs during 10 seconds, go back to white for 1
        // second, then show colour
        if (timeoutActive && !ignoreTimeout) {
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
      };

      var _closeAlert = function(scope) {
        scope.alert.msg = "";
      };

      // Use count to allow for multiple timeouts with non-conflicting check
      // values.
      var timeoutCount = 0;
      var timeoutActive = false;

      return {
        timedChange : function(scope, message, type, time) {
          timeoutCount++;
          var myTC = timeoutCount;
          timeoutActive = true;
          $timeout(function() {
            if (myTC === timeoutCount) {
              _setAlert(scope, message, type);
              timeoutActive = false;
            }
          }, time);
        },

        setAlert : _setAlert,
        closeAlert : _closeAlert
      };

    } ]);