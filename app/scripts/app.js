angular.module("app", [ 'ui.router', 'app.config', 'app.marketplace.templates', 'app.shared', 'app.marketplace' ]).config([ "$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.when("", "/home");
  $urlRouterProvider.when("/", "/home");

  // For any unmatched url, send to /home
  $urlRouterProvider.otherwise("/home");

  $stateProvider.state("home", {
    url: '/home',
    templateUrl : "templates/marketplace/main/mainPage.html",
    controller : "SystemController" 
  }).state("about", {
    url: '/about',
    templateUrl : "templates/shared/support/about.html",
    controller : "AboutController" 
  }).state("test", {
    url: '/test',
    templateUrl : "templates/shared/support/testing.html",
    controller : 'TestingController' 
  }).state("test.state1", {
    url: '/state1',
    templateUrl : "templates/shared/support/testing-state1.html"
    //    controller : 'TestingController' 
  });

  // prevent reloading the same page
  $(document).bind("pagebeforechange", function(e, data) {
    var to = data.toPage, from = data.options.fromPage;

    if (to && to.attr && from && from.attr && to.attr("id") === from.attr("id")) {
      e.preventDefault();
    }
  });

} ]).run(["$rootScope", "$location", "$timeout", "$window", "$compile", "apiUrl", function($rootScope, $location, $timeout, $window, $compile, apiUrl) {

//  $rootScope.$on("$routeChangeSuccess", function(event, next, current) {
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
//  });

  // window.onbeforeunload = function(e) {
  // return 'Navigate away?';
  // }

  // Stop refresh on path change
//  var original = $location.path;
//  $location.path = function(path, reload) {
//    var lastRoute = $route.current;
//    var un = $rootScope.$on('$locationChangeSuccess', function(event) {
//      // These conditions and setting of currentRoute allows a watcher in the
//      // dashboard controller to update the UI on back/forward without reload.
//      // Without the lastRoute check avoid immediately reverting to
//      // lastRoute.
//      if ($route.current && $route.current.params && lastRoute !== $route.current) {
//        $rootScope.currentRoute = $route.current.params;
//      }
//
//      if (lastRoute && lastRoute.$$route.originalPath !== "") {
//        $route.current = lastRoute; // Check is necessary to not backtrack the
//        // first load when path is blank.
//      }
//      un();
//    });
//    return original.apply($location, [ path ]);
//  };
} ]);
