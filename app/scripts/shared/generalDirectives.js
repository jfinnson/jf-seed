"use strict";
//Shared general purpose directives
angular.module("app.shared")
.directive('ngRightClick',["$parse",  function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
}])

//Improved clickAnywhereButHere directive
.directive('jfBlur',["$document", function($document){
    return {
      restrict: 'A',
      link: function(scope, elem, attr, ctrl) {
        elem.bind('click', function(e) {
          // this part keeps it from firing the click on the document.
          e.stopPropagation();
        });
         
        scope.$watch(attr.jfBlur, function(newVal, oldVal){
          if(newVal!==oldVal){
            if(newVal){
              var init = true;
              $document.bind('click', function(event) {
                if(!init){ 
                  // magic here.
                  scope[attr.jfBlur] = false;
                  $( this ).unbind( event );
                  scope.$apply();
                }
                init = false;
                });
            }else{
            }
          }
        });
        
      }
    }
  }])

;
