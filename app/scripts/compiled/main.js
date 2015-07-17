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

angular.module('app.config', [])

.constant('apiUrl', 'http://localhost:5000')

.constant('marketplaceUrl', 'http://localhost:8000')

.constant('searchUrl', 'http://localhost:9200')

.constant('apiKey', '77dc92d4-2368-498b-a8a2-cb359e637f5b')

.constant('apiSecret', '571c91e3c18b45178df98a32')

.constant('TemplatePaths', {marketplace:'marketplace',shared:'shared'})

.constant('membershipTypes', [{id:'team',name:'Team Member'},{id:'manager',name:'Manager'},{id:'executive',name:'Executive'},{id:'master',name:'Master'}])

.constant('defaultPaginationOptions', {currentPage:1,totalItems:1,maxSize:5,itemsPerPage:20})

;
angular.module('app.marketplace.elements', ['app.config']);

angular.module('app.marketplace', ['app.config',
                                   'app.marketplace.system',
                                   'app.marketplace.support',
                                   'app.marketplace.elements',
                                   'ui.keypress']);

angular.module('app.marketplace.support', []);

angular.module('app.marketplace.system', []);

angular.module('app.marketplace.ui', []);

angular.module('app.shared', ['app.config', 'ui.keypress', 'app.shared.ui', 'app.shared.system', 'app.shared.support']);

angular.module('app.shared.support', []);

angular.module('app.shared.system.api', []);

angular.module('app.shared.system', ['app.shared.system.api']);

angular.module('app.shared.ui', []);

/*
 * Front end model of an account.
 * Singleton service used for reference by the element manager and generic controllers/directives.
 * 
 */
angular.module("app.marketplace.elements").service("accountModel",
    ["serverAPI",
        function(serverAPI) {
          var _this = this;

          //High level model information for use in API calls, local storage reference, generic HTML generation, etc. 
          this.model_data = {
            //Model name and API reference name
            "name" : "account",
            "display_name" : "Account",
            "api" : {
              //Different path types which correspond to different endpoints.
              "multiple" : function(options){
                return "accounts";
              },
              "single" : function(options){
                if(!checkNested(options,'data','account_id')){
                  throw "Missing option(s) for account path 'single'. Options: " + options;
                }
                return "account/" + options.data.account_id;
              }
            },

            //Local storage reference
            "STORAGE_ID" : "account",
            "STORAGE_ID_LAST" : "account-LastLogin",

            //Display details for generating a table of accounts
            "table_display" : {
            }
          };

          //Field information
          this.fields = {
            "id" : {
              "display_name" : "id",
              "required" : true,
              "api" : {
                "submit" : true
              },
              "type" : "string"
            },
            "name" : {
              "display_name" : "Login name",
              "required" : true,
              "api" : {
                "submit" : true
              },
              "type" : "string"
            },
            "password" : {
              "display_name" : "Login password",
              "required" : true,
              "api" : {
                "submit" : true
              },
              "type" : "password"
            },
            "type" : {
              "display_name" : "Login type",
              "required" : false,
              "type" : "code",
              "values" : [ {
                "name" : "admin",
                "display_name" : "Admin"
              } ],
              "api" : {
                "submit" : true
              }
            }
          };

          //Fields and functions replicated for each instance.
          this.data = {
            "params" : {
              "model_name" : "account"
            }
          };

        } ]);
/* 
 *  Stripped example service for demo purposes.
 *  
 */   
angular.module("app")
		.service(
				"accountService", 
				[ 
						function() { 
							
						} ]);
  
// Note: not currently used. Here to show the team.

angular.module("app.marketplace.elements")

// Treated like an element due to its model-like nature. //TODO reassess either
// this manager or all others.
// Element/Class/Service for managing the element display tree
.service("elementTreeManager", [ "serverAPI", "apiUtils", function(serverAPI, apiUtils) {
  var self = this;
  this.modelData = {
    "name" : "elementTree",
    "STORAGE_ID" : "elementTree"
  };

  this.elementTree = {
    "params" : {
      "name" : "elementTree",
      "server" : false,
      "fields" : {
        "treeMap" : {
          "display_name" : "treeMap",
          "type" : "hashmap"
        },
        "treeArrayMap" : {
          "display_name" : "treeArrayMap",
          "type" : "hashmap"
        },
        "rootType" : {
          "display_name" : "rootType",
          "type" : "text"

        },
        "exceptionType" : {
          "display_name" : "rootType",
          "type" : "text"
        }
      }
    },
    "f_data" : {
      // Tree map, where keys are the luids of parents
      // Private
      "treeMap" : {
        0 : {}
      // root
      },
      // Public
      "treeArrayMap" : {
        0 : []
      // root
      }
    },
    "createTree" : function(elements) {
      var currElement = null;
      var parentKey = null;
      var treeIns = this;

      // Stage 1. Create hash maps
      // Go through elements and categorize them by parent luid
      for ( var key in elements) {
        currElement = elements[key];

        // Get parent hash map key
        parentKey = currElement.f_data.parentKey || currElement.f_data.parent_luid;
        if (!parentKey && currElement.f_data.parent_vLuid) {
          parentKey = ("v" + currElement.f_data.parent_vLuid);
        } else if (!parentKey) {
          if (this.f_data.rootType) {
            if (currElement.f_data.type === this.f_data.rootType) {
              parentKey = 0;
            } else {
              parentKey = null;
            }
          } else {
            parentKey = 0;
          }
        }

        if (parentKey !== null) {
          if (!this.f_data.treeMap[parentKey]) {
            this.f_data.treeMap[parentKey] = {};
            this.f_data.treeArrayMap[parentKey] = [];
          }

          if (parentKey && elements[parentKey]) {
            elements[parentKey].f_data.hasChildren = true;
          }

          // Set in hash map
          this.f_data.treeMap[parentKey][key] = currElement;
        }
      }

      // Stage 2. Create ordering arrays
      // Need to do ordering here to allow for efficient and
      // complete ordering
      var currChildMap = null;
      var currChildArrayMap = null;
      var currChildMapIndex = null;
      var currChildMapCount = null;
      var originalChildMapLength = null;
      var inserted = false;
      var currKey = null;
      for (key in this.f_data.treeMap) {
        currChildMap = $.extend(true, {}, this.f_data.treeMap[key]); // Need
        // to
        // extend
        // to
        // allow
        // for
        // removal
        currChildArrayMap = this.f_data.treeArrayMap[key];
        currChildMapIndex = 0;
        currChildMapCount = 0;
        originalChildMapLength = Object.keys(currChildMap).length;

        // Do while elements exist or has reached an error. Should
        // never take n*n time.
        while (Object.keys(currChildMap).length !== 0 && currChildMapCount < (originalChildMapLength * originalChildMapLength)) {
          currKey = Object.keys(currChildMap)[currChildMapIndex];
          currElement = this.f_data.treeMap[key][currKey]; // Important
          // to use
          // "this.f_data.treeMap[key]"
          // to allow
          // for data
          // linking
          inserted = false;

          // Specify key if missing
          if (!currElement.f_data.key) {
            currElement.f_data.key = currKey;
          }

          // Case 0. Root array mismatch
          if ((treeIns.f_data.rootType && currElement.f_data.type !== treeIns.f_data.rootType) && key === "0") {
            // Case 0. Mismatch so add to 'misc'

            if (!treeIns.f_data.exceptionType || !currElement.f_data[treeIns.f_data.exceptionType]) {
              if (!this.f_data.treeArrayMap['misc']){
                this.f_data.treeArrayMap['misc'] = [];
              }
              this.f_data.treeArrayMap['misc'].push(currElement);
            }
            inserted = true;
          } else if (currElement.f_data.previousKey) { // Insert
            // according to
            // order.
            // Dictated by
            // previousKey
            // field
            // Case 1. Previous key indicated.
            // Search array for insertion point
            var currChild = null;
            for ( var currChildIndex in currChildArrayMap) {
              currChild = currChildArrayMap[currChildIndex];
              if (currChild.f_data.key === currElement.f_data.previousKey) {
                // Case 1a. Previous child found
                currChildArrayMap.splice((parseInt(currChildIndex,10) + 1), 0, currElement);
                inserted = true;
                break;
              }
            }
          } else if (currChildArrayMap.length) {
            // Case 2. No previous key but elements exist in array
            // Insert at start
            currChildArrayMap.splice(0, 0, currElement);
            inserted = true;
          } else {
            // Case 3. No previous key and no elements in array.
            currChildArrayMap.push(currElement);
            inserted = true;

          }

          if (inserted) {
            // Case 4. Not inserted. Likely due to previous element not
            // being inserted yet.
            delete currChildMap[currKey];

          }

          currChildMapIndex++;
          currChildMapCount++;
          if (currChildMapIndex >= Object.keys(currChildMap).length){
            currChildMapIndex = 0;
          }
        }

        // Case 5 elements with errors or missing parents or missing
        // previous. Put all into misc array
        if (Object.keys(currChildMap).length) {
          if (!this.f_data.treeArrayMap['misc']) {
            this.f_data.treeArrayMap['misc'] = [];
          }
          for ( var currLuid in currChildMap) {
            this.f_data.treeArrayMap['misc'].push(currChildMap[currLuid]);
          }
        }
      }

      // Bind to scope for directive use
      // scope.treeArrayMap = this.f_data.treeArrayMap;
      this.elements = elements; // For internal reference;
    },
    "getTree" : function() {
      return this.f_data.treeArrayMap;
    },
    "createKey" : function(newElement, elements) {
      var increment = 0;
      while (!newElement.f_data.key || (elements[newElement.f_data.key] && elements[newElement.f_data.key] !== newElement)) {
        newElement.f_data.key = newElement.f_data.luid || ('v' + (newElement.f_data.vLuid + increment));

        if (increment > 0 && newElement.f_data.luid) {
//          debugger;// TODO
        }
        increment++;

      }
    },
    "addEle" : function(newElement, baseElement) {
      if (!newElement || !newElement.f_data.key){
        return null;
      }

      var parentKey = 0;
      if (baseElement) {
        // Set parent vars
        if (baseElement.f_data.luid) {
          newElement.f_data.parent_luid = baseElement.f_data.luid;
          newElement.f_data.parentKey = baseElement.f_data.luid;
        } else {
          newElement.f_data.parent_vLuid = baseElement.f_data.vLuid;
          newElement.f_data.parentKey = baseElement.f_data.key || ("v" + newElement.f_data.parent_vLuid);
        }
        parentKey = newElement.f_data.parentKey;
        newElement.f_data.parent_element = baseElement;
        baseElement.f_data.hasChildren = true;

      }
      if (!this.f_data.treeMap[parentKey]) {
        this.f_data.treeMap[parentKey] = {};
      }
      if (!this.f_data.treeArrayMap[parentKey]) {
        this.f_data.treeArrayMap[parentKey] = [];
      }
      this.f_data.treeMap[parentKey][newElement.f_data.key] = newElement;
      this.f_data.treeArrayMap[parentKey].push(newElement);

      // Set previous vars
      if (this.f_data.treeArrayMap[parentKey].length > 1) {
        var prevElement = this.f_data.treeArrayMap[parentKey][this.f_data.treeArrayMap[parentKey].length - 2];
        newElement.f_data.previous_luid = prevElement.f_data.luid;
        newElement.f_data.previousKey = prevElement.f_data.key;
      }
    },
    "removeElement" : function(currElement) {
      if (!currElement){
        return false;
      }

      var parentKey = (currElement.f_data.parentKey || 0);
      delete this.f_data.treeMap[parentKey][currElement.f_data.key];

      var childArray = this.f_data.treeArrayMap[parentKey];
      for ( var index in childArray) {
        if (childArray[index] === currElement) {
          index = parseInt(index,10);

          // Update subsequent element if there is one.
          if ((index + 1) < childArray.length) {
            var prevLuid = index > 0 ? childArray[(index - 1)].f_data.luid : null;
            var prevKey = index > 0 ? childArray[(index - 1)].f_data.key : null;
            childArray[(index + 1)].f_data.previous_luid = prevLuid;
            childArray[(index + 1)].f_data.previousKey = prevKey;
          }

          childArray.splice(index, 1); //TODO check if side effect or if it need to be set. Also see if setting breaks other pointers.
        }
      }

    },
    "updateElement" : function(currElementKey, newChildArray, newParent, end, oldChildArray, start) {
      if (!currElementKey || !(newChildArray || newParent) || end === null || end === undefined || !oldChildArray || start === null || start === undefined) {
        console.log('error: updateElement', arguments);
        return false;
      }

      //Insure that start is an integer
      start = parseInt(start,10);
      var currElement = this.elements[currElementKey];
      var oldParentKey = currElement.f_data.parentKey;
      var newParentKey = 0;
      if (newParent){
        newParentKey = newParent.f_data.key;
      }
      var newParentLuid = null;
      if (newParent){
        newParentLuid = newParent.f_data.luid;
      }

      //Make newChildArray if missing and parent present
      if (!newChildArray && newParentKey) {
        var parentKey = newParentKey;
        if (!this.f_data.treeMap[parentKey]){
          this.f_data.treeMap[parentKey] = {};
        }
        if (!this.f_data.treeArrayMap[parentKey]){
          this.f_data.treeArrayMap[parentKey] = [];
        }
        newChildArray = this.f_data.treeArrayMap[parentKey];

        //Open element
        newParent.open = true;
      }

      //Save new location to hash map
      if (newChildArray !== oldChildArray) {
        var oldHashMap = this.f_data.treeMap[(currElement.f_data.parentKey || 0)];
        var newHashMap = this.f_data.treeMap[newParentKey];

        newHashMap[currElementKey] = oldHashMap[currElementKey];
        delete oldHashMap[currElementKey];

        currElement.f_data.parentKey = newParentKey;
        currElement.f_data.parent_luid = newParentLuid;
      }

      //Check is to make sure update of prev element references is necessary
      if (newChildArray !== oldChildArray || start !== end) {
        //Update prev element references
        /*
         * Have to update
         * 1) currElement
         * 2) possibly next element from old list
         * 3) possibly next element from new list
         */

        //Update subsequent element in new list if there is one.
        var prevLuid = null;
        var prevKey = null;
        if (end < newChildArray.length) {
          prevLuid = currElement.f_data.luid;
          prevKey = currElement.f_data.key;
          newChildArray[end].f_data.previous_luid = prevLuid;
          newChildArray[end].f_data.previousKey = prevKey;
        }
        //Update subsequent element in old list if there is one.
        if ((start + 1) < oldChildArray.length) {
          prevLuid = start > 0 ? oldChildArray[(start - 1)].f_data.luid : null;
          prevKey = start > 0 ? oldChildArray[(start - 1)].f_data.key : null;
          oldChildArray[(start + 1)].f_data.previous_luid = prevLuid;
          oldChildArray[(start + 1)].f_data.previousKey = prevKey;
        }
        //Update currElement
        if (end > 0) {
          prevLuid = newChildArray[(end - 1)].f_data.luid;
          prevKey = newChildArray[(end - 1)].f_data.key;
          currElement.f_data.previous_luid = prevLuid;
          currElement.f_data.previousKey = prevKey;
        } else {
          currElement.f_data.previous_luid = null;
          currElement.f_data.previousKey = null;
        }

      }

      //Save position to array map and update parent fields
      if (!newChildArray.length && newParent){
        newParent.f_data.hasChildren = true;
      }
      newChildArray.splice(end, 0, oldChildArray.splice(start, 1)[0]);
      if (!oldChildArray.length && oldChildArray !== newChildArray && oldParentKey){
        this.elements[oldParentKey].f_data.hasChildren = false;
      }
    }

  };

} ]);
angular
    .module("app.marketplace.elements")
    /*
     * Service for accessing, maintaining, and updating element types and
     * instances.
     * 
     * TODO assess if/can this service be moved to shared
     * 
     */
    .service(
        "elementSrv",
        [
            "onlineUtils",
            "serverAPI",
            "accountModel",
            "productModel",
            "$rootScope",
            "$q",
            "$timeout",
            "apiUrl",
            function(onlineUtils, serverAPI, accountModel, productModel, $rootScope, $q, $timeout, apiUrl) {

              // Element model/class vars and initialization
              var _elementNameMap = { // Name to element service
                // "elementTree": elementTreeManager,
                "account" : accountModel,
                "product" : productModel
              };
              var _elementVCount = {}; // Vid count tracking for all elements
              var _elementMaps = {};// Instance tracking
              var _elementTypeList = [];
              var _elements = null;
              for ( var i in _elementNameMap) {
                _elementVCount[i] = 1;
                _elementMaps[i] = {};
                _elementTypeList.push(i);
              }

              var _compareUpdate = null;
              var _validateFields = null;
              var _createInstance = null;
              var _submit = null;
              var _updateInstance = null;

              /*
               * Get model service for element type
               */
              var _getModel = function(elementName) {
                if (!elementName || !_elementNameMap[elementName]) {
                  return false;
                }
                return _elementNameMap[elementName];
              };

              /*
               * Create new instance of element type
               */
              var _create = function(elementSrv, options) {
                if (!options) {
                  options = {};
                }

                var newElement = $.extend(true, options || {}, elementSrv.data);
                _setGenMethods(elementSrv, newElement); // Set generic methods for
                // instance

                // Call autofill fn if model/class has one.
                if (elementSrv.autofill) {
                  elementSrv.autofill(newElement);
                }

                newElement.vID = _elementVCount[elementSrv.model_data.name]++;
                var trackID = newElement.id || "v" + newElement.vID;

                // Save UI vars
                var trackUI = _elementMaps[elementSrv.model_data.name][trackID] && _elementMaps[elementSrv.model_data.name][trackID].UI ? _elementMaps[elementSrv.model_data.name][trackID].UI
                    : {};
                newElement.UI = trackUI;

                // Update tracking map
                if(_elementMaps[elementSrv.model_data.name][trackID]){
                  //Copy without loosing reference.
                  angular.copy(newElement, _elementMaps[elementSrv.model_data.name][trackID]);
                }else{
                  _elementMaps[elementSrv.model_data.name][trackID] = newElement;
                }

                return _elementMaps[elementSrv.model_data.name][trackID];
              };
              var _createElements = function(elements, elementSrv) {
                if (elements && elements.length && elementSrv) {
                  for ( var key in elements) {
                    elements[key] = _create(elementSrv, elements[key]);
                  }
                }
                return elements;
              };

              // Sets generic methods for instance that every instance should
              // have.
              var _setGenMethods = function(elementSrv, elementIns) {

                elementIns.get = function(name) {
                  if (!elementSrv.fields[name]) {
                    throw "Field " + name + " does not exist in model.";
                  }
                  _validateInitField(elementSrv, elementIns, name);
                  return elementIns[name];
                };
                elementIns.set = function(name, value) {
                  if (!elementSrv.fields[name]) {
                    throw "Field " + name + " does not exist in model.";
                  }
                  if (elementSrv.fields[name].type === "object" || elementSrv.fields[name].type === "array") {
                    if (value) {
                      // Copies values while maintaining reference links to elementIns[name]
                      angular.copy(value, elementIns[name]);
                    }
                  } else {
                    elementIns[name] = value;
                  }
                };
                elementIns.getFieldParams = function(name) {
                  if (!elementSrv.fields[name]) {
                    throw "Field " + name + " does not exist in " + elementSrv.model_data.name + " model.";
                  }
                  return elementSrv.fields[name];
                };
              };
              // Helps initialized and check fields
              var _validateInitField = function(elementSrv, elementIns, name) {
                var fieldType = elementSrv.fields[name].type;
                if (!elementIns[name]) {
                  if (fieldType === "object") {
                    elementIns[name] = {};
                  }
                  if (fieldType === "array") {
                    elementIns[name] = [];
                  }

                  if (elementSrv.fields[name].default_value) {
                    if (fieldType === "object" || fieldType === "array") {
                      elementIns[name] = $.extend(true, elementIns[name], elementSrv.fields[name].default_value);
                    }
                    // May not want to store date object in the field
                    // else if (fieldType === "date" || fieldType ===
                    // "duration") {
                    // elementIns[name] = new Date(elementIns[name]);
                    // }
                    else {
                      elementIns[name] = elementSrv.fields[name].default_value;
                    }
                  }
                }
              };

              /*
               * Update backend data object
               * 
               * options.fields used to only update certain fields
               */
              var _updateBdata = function(elementIns, elementType, options) {
                if (!elementIns || !elementIns || !elementType) {
                  return false;
                }

                var elementSrv = _getModel(elementType)[elementType];

                var fields = elementSrv.fields;

                var currBdata = elementIns.b_data || {};
                var bDataUpdate = {};
                var currFieldParams = null;
                // Get all fields that should be submitted to the api (have
                // api.submit==true)
                for ( var fieldName in elementIns) {
                  currFieldParams = elementSrv.fields[fieldName];
                  if (currFieldParams && currFieldParams.api && currFieldParams.api.submit && (!fields || fields[fieldName])) {
                    currBdata[fieldName] = elementIns[fieldName];
                    bDataUpdate[fieldName] = elementIns[fieldName];
                  }
                }

                return bDataUpdate;
              };

              // -----------------------------------------------------------------------------------

              /*
               * General method for retrieving _elements from db and local
               * storage
               * 
               * TODO add acceptable list of path types
               */
              var _get = function(elementType, id, options) {
                if (!elementType || (!id && !options || !options.pathType || (options.pathType === "single" && !options.id))) {
                  throw "Missing field or option for api get.";
                }
                // If single instance is requested, there is no force, and it
                // exists in memory, then provide the instance in memory.
                if (id && (!options || !options.forceAPI) && _elementMaps[elementType][id]) {
                  return $q(function(resolve, reject) {
                    resolve(_elementMaps[elementType][id]);
                  });
                } else if (id) {
                  // If id is provided, and force is applied or does not exist
                  // in memory, then setup options to do an api call.
                  if (!options) {
                    options = {};
                  }
                  options.pathType = "single";
                }

                var elementSrv = _getModel(elementType);
                if (!elementSrv.model_data.api || !elementSrv.model_data.api[options.pathType]) {
                  throw "Path type, " + options.pathType + ", does not exist for " + elementType;
                }

                var path = elementSrv.model_data.api[options.pathType](options);
                if (path === false) {
                  // Assumed error was thrown by api pathType fn.
                  return false;
                }else{
                  path = apiUrl + path;
                }

                var params = options || {
                // Example "page" : 0,
                // "rows" : 20
                };

                return serverAPI.doAPICall(path, options).then(function(response) {
                  if (!response || response.success === false || response.success === "failed") {
                    throw "Path " + path + " returned a failure response.";
                  }

                  var elements = response.data ? response.data : response;
                  if (!elements) {
                    return;
                  }
                  if (!$.isArray(elements)) {
                    elements = [ elements ];
                  }

                  var allElementInsMap = {}; // Map of new _elements
                  for ( var i in elements) {
                    var currElementIns = elements[i];
                    currElementIns.b_data = $.extend(true, {}, elements[i]);
                    // Create element while keeping untouched b-data
                    currElementIns = _create(elementSrv, currElementIns);
                    allElementInsMap[currElementIns.id] = currElementIns;
                  }

                  return allElementInsMap;
                });
              };
              var _getElements = function(elementType, options) {
                if (!elementType || !_getModel(elementType)) {
                  throw "_getElements: Missing elementType.";
                }
                var elementSrv = _getModel(elementType);

                if (!options) {
                  options = {};
                }
                if (!options.pathType) {
                  options.pathType = "multiple";
                }
                return _get(elementType, null, options);
              };
              /*
               * General method for posting new/modified _elements to api
               */
              _submit = function(elementType, options) {
                if (!elementType || !options || !options.pathType || (options.pathType === "single" && !options.element)) {
                  throw "_submit: Missing field or option.";
                }

                var elementSrv = _getModel(elementType);
                if (!elementSrv.model_data.api || !elementSrv.model_data.api[options.pathType]) {
                  throw "Path type, " + options.pathType + ", does not exist for " + elementType;
                }

                var postElements = [];
                if (!options.elements && options.element) {
                  postElements.push(options.element);
                } else if (options.elements) {
                  postElements = options.elements;
                }

                // Separate fn required to avoid pointer issues.
                var serverSubmitElement = function(path, currOptions, currElementIns) {
                  return serverAPI.doAPICall(path, currOptions).then(function(response) {
                    if (!response || response.success === false || response.success === "failed") {
                      throw "Path " + path + " returned a failure response.";
                    }

                    var newElementData = response.data ? response.data : response;
                    if (!newElementData) {
                      return;
                    }

                    var currReElementIns = _updateInstance(currElementIns, newElementData);

                    // update _elementMaps. Should be unnecessary with currReElementIns
                    _elementMaps[elementType][currReElementIns.id] = currReElementIns;
                  });
                };

                var reElementIns = [];
                var allCalls = [];

                var currElementIns = null;
                var currOptions = null;
                // Go through element instances and update if necessary.
                for ( var i in postElements) {
                  currElementIns = postElements[i];
                  currOptions = {};
                  currOptions.isAsync = true;

                  // Get set of fields to pass to api
                  var bDataUpdate = _updateBdata(currElementIns, elementType, options);
                  currOptions = $.extend(currOptions, bDataUpdate);

                  var path = elementSrv.model_data.api[options.pathType](currOptions);
                  if (path === false) {
                    // Assumed error was thrown by api pathType fn.
                    return false;
                  }

                  // Would do comparison here to see if update is necessary.
                  allCalls.push(serverSubmitElement(path, currOptions, currElementIns));
                }

                if (allCalls && allCalls.length > 0) {
                  return $q.all(allCalls).then(function(arrayOfResults) {
                    if (arrayOfResults && arrayOfResults.length === 1) {
                      return arrayOfResults[0];
                    } else {
                      return arrayOfResults;
                    }
                  });
                } else {
                  return true;
                }
              };

              // Validate instance's fields against their parameters (correct
              // type etc.)
              // TODO
              _validateFields = function(elementType, currElement, options) {
                if (!options) {
                  options = {};
                }
                if (!elementType || !currElement) {
                  throw "_validateFields: Missing type or instance.";
                }
                var elementSrv = _getModel(elementType);

                var valResult = null;
                var valResutls = [];
                for ( var currField in elementSrv.fields) {
                  // valResult = validateSrv.validateField(currElement[currField],
                  // fieldParams[currField]); TODO
                  valResult = {
                    "pass" : true
                  };
                  if (!valResult || !valResult.pass) {
                    valResutls.push(valResult);
                  }
                }

                if (valResutls.length > 0) {
                  return valResutls[0];
                  // TODO
                } else {
                  return {
                    "pass" : true
                  };
                }
              };
              
              //Update element object without loosing fields or references.
              _updateInstance = function(element, newData) {
                element.b_data = $.extend(true, element.b_data || {}, newData);
                element = $.extend(true, element || {}, newData);
                return element;
              };
              
              // Remove instance from global map. Also remove from backend if
              // apiRemove==true
              var _remove = function(elementType, currElement, apiRemove) {
                var elementSrv = _getModel(elementType);
                if (!elementType || !currElement || !elementSrv) {
                  throw "_remove: Missing type, model, or instance.";
                }
                if (apiRemove && (!elementSrv.model_data.api || !elementSrv.model_data.api.remove)) {
                  throw "_remove: Missing remove api path type.";
                }

                if (apiRemove && currElement.id) {
                  var path = elementSrv.model_data.api.remove(currElement);
                  if (path === false) {
                    // Assumed error was thrown by api pathType fn.
                    return false;
                  }
                  return serverAPI.doAPICall(path, currElement).then(function(response) {
                    if (!response || response.success === false || response.success === "failed") {
                      throw "Path " + path + " returned a failure response.";
                    }
                    delete _elementMaps[elementType][currElement.id];
                  });
                } else {
                  delete _elementMaps[elementType][currElement.id];
                }

                return true;
              };

              // ---------------------------------------

              // Init universal methods for element models
              var _initModelMethods = function() {
                for ( var i in _elementNameMap) {
                  // TODO would put generic fns or params here. (like local
                  // store methods)
                }
              };
              // Would put various listeners here. (Like one for the web socket)
              var _initListeners = function() {
              };
              var _initRootMethods = function() {
                $rootScope.get = _get;
              };
              var _initService = function() {
                _initModelMethods();
                _initRootMethods();
                _initListeners();
              };
              _initService();

              /*
               * Public methods
               */
              return {

                create : _create,
                remove : _remove,

                /*
                 * Validate elment fields for db submission
                 */
                validateFields : _validateFields,

                get : _get, //Element(s) Retrieval method 
                getElements : _getElements, //Get all elements of a type. (Convience funciton)
                submit : _submit, //Element(s) update method

                elementNameMap : _elementNameMap,
                elementTypeList : _elementTypeList,
                elementMaps : _elementMaps,
                elements : _elements

              };

            } ]);

angular.module("app")

.service("productModel", [ function() {
  var _this = this;
  this.model_data = {
    "name" : "product",
    "display_name" : "Product",
    "api" : {
      //Different path types which correspond to different endpoints.
      "multiple" : function(options){
        return "/products";
      },
      "single" : function(options){
        if(!checkNested(options,'data','product_id')){
          throw "Missing option(s) for account path 'single'. Options: " + options;
        }
        return "/product/" + options.data.product_id;
      }

    }

  };

  this.autofill = function(element) {
  };
  
  this.fields = {
    "id" : {
      "display_name" : "id",
      "required" : true,
      "api" : {
        "submit" : true
      },
      "type" : "integer"
    },
    "name" : {
      "display_name" : "name",
      "required" : true,
      "api" : {
        "submit" : true
      },
      "type" : "text"
    }
  };

  this.data = {
    "params" : {
      "model_name" : "appliance"
    },
    "getStatus" : function() { //Example function
      return this.last_state;
    }
  };

} ]);
angular.module('d3', [])
.factory('d3Service', ['$document', '$window', '$q', '$rootScope',
  function($document, $window, $q, $rootScope) {
    var d = $q.defer(),
        d3service = {
          d3: function() { return d.promise; }
        };
  function onScriptLoad() {
    // Load client in the browser
    $rootScope.$apply(function() { d.resolve($window.d3); });
  }
  var scriptTag = $document[0].createElement('script');
  scriptTag.type = 'text/javascript'; 
  scriptTag.async = true;
  scriptTag.src = 'http://d3js.org/d3.v3.js';
  scriptTag.onreadystatechange = function () {
    if (this.readyState === 'complete'){
      onScriptLoad();
    }
  };
  scriptTag.onload = onScriptLoad;
 
  var s = $document[0].getElementsByTagName('body')[0];
  s.appendChild(scriptTag);
 
  return d3service;
}]);
/*
 *  Controls and manages top level task app
 * 
 */
angular.module("app.marketplace.system").controller("SystemController",
    [ "$scope", "$location","elementSrv", function($scope, $location, elementSrv) {

      //							socketSrv.init((window.location.protocol == "https:" ? 'wss:' : 'ws:') + '//' + window.location.host);

      //init services here
//      accountService.init($scope);
      
      //For demo TODO remove
      elementSrv.getElements('product').then(function(products){
        $scope.products = products;
      });

      $scope.$watch('account.id', function(newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          //Account change, reload elements and services.
        }
      });
    } ]);

angular.module("app.marketplace.system").service("systemService", [ function() {

} ]);
//TODO create alertDirective ?
angular.module("app.shared.support")
.controller("AlertCtrl",
    [ "$scope", "alertSrv", function($scope, alertSrv) {
      $scope.alertSrv = alertSrv;

      $scope.closeAlert = function(index) {
        $scope.alert = null;
      };

    } ]);
angular.module("app.shared.support")
    // Alert service for displaying bootstrap alerts
    .service("alertSrv", [ "$timeout", function($timeout) {

      var _setAlert = function(scope, message, type, ignoreTimeout, override) {
        // - If a new scan occurs during 10 seconds, go back to white for 1
        // second, then show colour
        if (timeoutActive && !ignoreTimeout) {
          scope.alert = {
            type : 'info',
            msg : ""
          };
          $timeout(function() {
            _setAlert(scope, message, type, true, override);
          }, 1000);
          return false;
        }

        scope.alert = {
          type : (type || 'error'),
          msg : (message)
        };
        // scope.$apply();

        scope.showOverrideOpt = override;
      };

      var _closeAlert = function(scope) {
        scope.alert.msg = "";
      };

      // Use count to allow for multiple timeouts with non-conflicting check
      // values.
      var timeoutCount = 0;
      var timeoutActive = false;

      return {
        timedChange : function(scope, message, type, time) {
          timeoutCount++;
          var myTC = timeoutCount;
          timeoutActive = true;
          $timeout(function() {
            if (myTC === timeoutCount) {
              _setAlert(scope, message, type);
              timeoutActive = false;
            }
          }, time);
        },

        setAlert : _setAlert,
        closeAlert : _closeAlert
      };

    } ]);
//Shared general purpose directives
angular.module("app.shared.support")
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
    };
  }])

;

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
// Web server api service. Single point for api calls.
angular.module("app.shared.system.api").service("serverAPI", [ "$http", function($http) {

  /**
   * Single point for http calls
   * 
   * @param options =
   *          {isAsync, dataType, checkCache, doCache, dbRef,
   *          elementType, dataContent, POST, noLoadingImg}
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


angular.module("app.shared.system.api")
// Web socket service
.service("socketSrv", [ "$rootScope", function($rootScope) {
  var connection = null;
  var attempts = 1;
  var msgCount = 0;
  var callbacks = {};
  var address = null;
  var scope = $rootScope;

  var _init = function(newAddress, newScope) {
    address = newAddress;
    if (newScope) {
      scope = newScope;
    }
    _createWebSocket();
  };

  var _createWebSocket = function() {
    if (!address) {
      return false;
    }
    connection = new WebSocket(address);

    connection.onopen = function() {
      scope.$emit("websocket-status", {
        "status" : "open",
        "message" : "Websocket Open"
      });
      console.log("Opened websocket");
      attempts = 1;

      this.send('{ "type": "login", "account_type": "client", "token" : "' + $rootScope.account.token + '"}');

    };

    connection.onclose = function() {
      scope.$emit("websocket-status", {
        "status" : "error",
        "message" : "Websocket closed"
      }); // close
      var time = _generateInterval(attempts);
      setTimeout(function() {
        attempts++;
        _createWebSocket();
      }, time);
    };

    connection.onerror = function(error) {
      scope.$emit("websocket-status", {
        "status" : "error",
        "message" : "Websocket error"
      });
      console.log("Websocket error: " + error);
    };

    connection.onmessage = function(e) {
      console.log("Websocket message: ", e.data);
      var message = JSON.parse(e.data);
      if ($.isPlainObject(message) && message.body) {
        message.body.datetime = (new Date()).toString();
        message.body.id = msgCount++;
      }
      _dispatchMessage(message);
    };
  };

  var _sendMessage = function(message, callback, timeout) {
    if ("tag" in message) {
      if (message.tag in this.callbacks) {
        console.log("Problem! Tag already exists in callbacks");
      }
      this.callbacks[message.tag] = {
        timeout : timeout || 60,
        callback : callback
      };
    }
    connection.send(JSON.stringify(message));
  };

  var _dispatchMessage = function(message) {
    switch (message.type) {
    case "command_response":
      if (message.command_tag in callbacks) {
        callbacks[message.command_tag].callback(message);
      } else {
        console.log("No callback for tag <" + message.tag + "> in the callback queue");
      }
      break;
    case "command":
      break;
    case "status_update":
      scope.$emit("websocket-status_update", message.body);
      break;
    default:
      console.log("Unknown message from websocket");
    }
  };

  var _removeTag = function(tag) {
    delete this.callbacks[tag];
  };

  var _generateInterval = function(k) {
    var maxInterval = (Math.pow(2, k) - 1) * 1000;

    if (maxInterval > 30 * 1000) {
      maxInterval = 30 * 1000; // If the generated interval is more
      // than 30 seconds, truncate it down to
      // 30 seconds.
    }
    // generate the interval to a random number between 0 and the
    // maxInterval determined from above
    return Math.random() * maxInterval;
  };

  return {
    init : _init,
    createWebSocket : _createWebSocket,
    sendMessage : _sendMessage,
    generateInterval : _generateInterval,
    dispatchMessage : _dispatchMessage,
    removeTag : _removeTag

  };

} ]);

angular.module("app.shared")
.controller("TestingController", [ "$scope", function($scope) {
} ])

.controller("AboutController", [ "$scope", function($scope) {
} ]);

angular.module("app.shared.system")
// TODO reassess. Provides service for accessing global variables.
.service("globalVariablesSrv", [ "$timeout", function($timeout) {
  var globalVariables = {
    "currTimeVal" : new Date().getTime(),
    "currTimeValUTC" : moment().utc().valueOf()

  };

  $timeout(function() {
    globalVariables["currTimeVal"] = new Date().getTime();
    globalVariables["currTimeValUTC"] = moment().utc().valueOf();
  }, 1000);

  return {
    getVar : function(name) {
      return globalVariables[name];
    }

  };

} ])

// Service that provides functions for checking the online status of the app
.service("onlineUtils", [ "$window", "$rootScope", function($window, $rootScope) {

  $rootScope.online = navigator.onLine;
  $window.addEventListener("offline", function() {
    $rootScope.$apply(function() {
      $rootScope.online = false;
    });
  }, false);
  $window.addEventListener("online", function() {
    $rootScope.$apply(function() {
      $rootScope.online = true;
    });
  }, false);

  return {
    isOnline : function() {
      if ($rootScope.db.active) {
        return $rootScope.online;
      } else {
        return false;
      }
    }
  };
} ])

// Other general services
.service("generalUtils", [ function() {
  var fixDate = function(d, check) { // force d to be on check's YMD,
    // for daylight savings purposes
    if (+d) { // prevent infinite looping on invalid dates
      while (d.getDate() !== check.getDate()) {
        d.setTime(+d + (d < check ? 1 : -1) * 3600000);
      }
    }
  };
  return {
    parseISO8601 : function(s, ignoreTimezone) { // ignoreTimezone
      // defaults to false
      // derived from http://delete.me.uk/2005/03/iso8601.html
      // TODO: for a know glitch/feature, read
      // tests/issue_206_parseDate_dst.html
      var m = s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
      if (!m) {
        return null;
      }
      var date = new Date(m[1], 0, 1);
      if (ignoreTimezone || !m[13]) {
        var check = new Date(m[1], 0, 1, 9, 0);
        if (m[3]) {
          date.setMonth(m[3] - 1);
          check.setMonth(m[3] - 1);
        }
        if (m[5]) {
          date.setDate(m[5]);
          check.setDate(m[5]);
        }
        fixDate(date, check);
        if (m[7]) {
          date.setHours(m[7]);
        }
        if (m[8]) {
          date.setMinutes(m[8]);
        }
        if (m[10]) {
          date.setSeconds(m[10]);
        }
        if (m[12]) {
          date.setMilliseconds(Number("0." + m[12]) * 1000);
        }
        fixDate(date, check);
      } else {
        date.setUTCFullYear(m[1], m[3] ? m[3] - 1 : 0, m[5] || 1);
        date.setUTCHours(m[7] || 0, m[8] || 0, m[10] || 0, m[12] ? Number("0." + m[12]) * 1000 : 0);
        if (m[14]) {
          var offset = Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0);
          offset *= m[15] === '-' ? 1 : -1;
          date = new Date(+date + (offset * 60 * 1000));
        }
      }
      return date;
    },
    one_day : (24 * 60 * 60 * 1000),
    one_hour : (60 * 60 * 1000)
  };
} ])

.service("localStorageService", [ "onlineUtils", "$rootScope", function(onlineUtils, $rootScope) {
  var appID = "WP-"; // String to go before every storage id.

  var getStorageID = function(STORAGE_ID, ignoreAccount) {
    var combinedID = appID + STORAGE_ID;
    if (!ignoreAccount && $rootScope && $rootScope.account && $rootScope.account.name) {
      combinedID = $rootScope.account.name + "_" + combinedID;
    }
    return combinedID;
  };

  this.getItem = function(STORAGE_ID, ignoreAccount) {
    return localStorage.getItem(getStorageID(STORAGE_ID, ignoreAccount));
  };
  this.setItem = function(STORAGE_ID, data, ignoreAccount) {
    return localStorage.setItem(getStorageID(STORAGE_ID, ignoreAccount), JSON.stringify(data));
  };

} ]);
