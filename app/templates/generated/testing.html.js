angular.module('app').run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/shared/support/testing.html',
    '<!--  Misc page for misc testing   --><!-- diagram-page  TestAbnController-->\n' +
    '<div class="simpleDemo"> \n' +
    'Test page\n' +
    '\n' +
    '		\n' +
    '</div>');
}]);
