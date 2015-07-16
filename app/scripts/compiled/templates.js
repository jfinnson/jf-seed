angular.module('app').run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/shared/support/about.html',
    '<div id="aboutPage" > \n' +
    '    <header></header>\n' +
    '\n' +
    '    <div data-role="content">\n' +
    '        Hope this was helpful.\n' +
    '        \n' +
    '        <button ng-click="reset()">Reset LocalStorage</button> \n' +
    '    </div> \n' +
    '</div>');
}]);

angular.module('app').run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/marketplace/main/mainPage.html',
    '<div id="mainPage" class="mainPage" ng-controller="SystemController" >   \n' +
    '    Test\n' +
    '</div>');
}]);

angular.module('app').run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/shared/support/testing.html',
    '<!--  Misc page for misc testing   --><!-- diagram-page  TestAbnController-->\n' +
    '<div class="simpleDemo"> \n' +
    'Test page\n' +
    '\n' +
    '		\n' +
    '</div>');
}]);
