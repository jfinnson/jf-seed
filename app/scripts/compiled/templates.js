angular.module('app.marketplace.templates', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/marketplace/main/mainPage.html',
    '<div id=mainPage class=mainPage ng-controller=SystemController>Test</div>');
  $templateCache.put('templates/shared/support/about.html',
    '<div id=aboutPage><header></header><div data-role=content>Hope this was helpful. <button ng-click=reset()>Reset LocalStorage</button></div></div>');
  $templateCache.put('templates/shared/support/testing.html',
    '<div class=simpleDemo>Test page</div>');
}]);
