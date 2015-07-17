//Provides general services. Also includes some non-angular service funcitons.
angular.module("app.shared.support")
.run(function(){
  // Attach useful nested checking object to window.
  // Fn can be used instead of an ugly nested checking if. if(obj && obj.test1 && obj.test1.test2 ...)
  window.checkNested = function(obj /* , level1, level2, ... levelN */) {
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < args.length; i++) {
      if (!obj || !obj.hasOwnProperty(args[i])) {
        return false;
      }
      obj = obj[args[i]];
    }
    return true;
  };
});