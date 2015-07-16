
angular.module("app", ['app.config', 'app.marketplace.templates', 'ngRoute', 'app.shared', 'app.marketplace' ]).config(
    [
        "$routeProvider",
        "$locationProvider",
        function($routeProvider, $locationProvider) {

          $routeProvider.when("/", {
            templateUrl : "templates/marketplace/main/mainPage.html",
            controller : "SystemController",
            page : "main"
          }).when("/about", {
            templateUrl : "templates/shared/support/about.html",
            controller : "AboutController",
            page : "about"
          }).when("/test", {
            templateUrl : "templates/shared/support/testing.html",
            controller : 'TestingController',
            page : "testing"   
          }).otherwise({
            redirectTo : '/'
          });

          // prevent reloading the same page
          $(document).bind(
              "pagebeforechange",
              function(e, data) {
                var to = data.toPage, from = data.options.fromPage;

                if (to && to.attr && from && from.attr && to.attr("id") === from.attr("id")) {
                  e.preventDefault();
                }
              });

        } ]).run(
    [
        '$route',
        "$rootScope",
        "$location",
        "$timeout",
        "$window",
        "$compile",
        "apiUrl",
        function($route, $rootScope, $location, $timeout, $window, $compile, apiUrl) {

          $rootScope.$on("$routeChangeSuccess", function(event, next, current) {
            // Possible place for access control

            // Only apply access restrictions if the next has an access role
            // if (next.access && next.access !== 1 && !(next.access &
            // $rootScope.account.f_data.role)) {
            // if ($rootScope.account.f_data.role ===
            // routingConfig.userRoles.account || $rootScope.account.role ===
            // routingConfig.userRoles.admin) {
            // $location.path('/');
            // }
            // else {
            // $location.path('/');
            // }
            // }
            //
            // if (angular.isDefined($route.current)) {
            // if (angular.isDefined($route.current.page)) {
            // $rootScope.currPage = $route.current.page;
            // } else {
            //
            // }
            // }
          });

          // window.onbeforeunload = function(e) {
          // return 'Navigate away?';
          // }

          // Stop refresh on path change
          var original = $location.path;
          $location.path = function(path, reload) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function(event) {
              // These conditions and setting of currentRoute allows a watcher
              // in the dashboard controller to update the UI on back/forward
              // without reload.
              // Without the lastRoute check avoid immediately reverting to
              // lastRoute.
              if ($route.current && $route.current.params && lastRoute !== $route.current) {
                $rootScope.currentRoute = $route.current.params;
              }

              if (lastRoute && lastRoute.$$route.originalPath !== ""){
                $route.current = lastRoute; // Check is necessary to not
                                            // backtrack the first load when
                                            // path is blank.
              }
              un();
            });
            return original.apply($location, [ path ]);
          };

          //Attach useful nested checking object to window.
          window.checkNested = function(obj /*, level1, level2, ... levelN*/) {
            var args = Array.prototype.slice.call(arguments, 1);

            for (var i = 0; i < args.length; i++) {
              if (!obj || !obj.hasOwnProperty(args[i])) {
                return false;
              }
              obj = obj[args[i]];
            }
            return true;
          };
        } ]);
