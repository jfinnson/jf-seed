// Web server api service. Single point for api calls.
angular.module("app.shared.system.api").service("serverAPI", [ "$http", function($http) {

  /**
   * Single point for http calls
   * 
   * @param options =
   *          {isAsync, dataType, checkCache, doCache, dbRef,
   *          eleType, dataContent, POST, noLoadingImg}
   */
  var _doAPICall = function(fromUrl, options) {
    // Assert
    if (!fromUrl) {
      throw "Empty fromUrl passed";
    }

    // If null then create empty object
    if (!options) {
      options = {};
    }

    // Returns a promise
    // (http://docs.angularjs.org/api/ng.$q)
    return $http({
      url : fromUrl,
      async : options.isAsync || false,
      dataType : options.dataType,
      data : options.dataContent,
      method : options.method || "GET"
    }).success(function(data, status, headers, config) {
    }).error(function(data, status, headers, config) {
      throw ("Error with api call: " + fromUrl + ". Error status: " + status);
    });
  };

  return {
    doAPICall : _doAPICall
  };
} ]);
