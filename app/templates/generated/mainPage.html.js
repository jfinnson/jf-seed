angular.module('app').run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/marketplace/main/mainPage.html',
    '<div id="mainPage" class="mainPage" ng-controller="SystemController" >   \n' +
    '    Test\n' +
    '</div>');
}]);
