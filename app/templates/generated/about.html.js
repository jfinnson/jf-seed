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
