angular
    .module("app.marketplace.elements")
    /*
     * Service for accessing, maintaining, and updating element types and
     * instances.
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
            function(onlineUtils, serverAPI, accountModel, productModel, eleTreeManager, $rootScope, $q, $timeout) {

              // Ele model/class vars and initialization
              var _eleNameMap = { // Name to ele service
                // "eleTree": eleTreeManager,
                "account" : accountModel,
                "product" : productModel
              };
              var _eleVCount = {}; // Vid count tracking for all eles
              var _eleMaps = {};// Instance tracking
              var _eleTypeList = [];
              var _elements = null;
              for ( var i in _eleNameMap) {
                _eleVCount[i] = 1;
                _eleMaps[i] = {};
                _eleTypeList.push(i);
              }

              var _compareUpdate = null;
              var _validateFields = null;
              var _createInstance = null;
              var _submit = null;
              var _updateInstance = null;

              /*
               * Get model service for element type
               */
              var _getModel = function(eleName) {
                if (!eleName || !_eleNameMap[eleName]) {
                  return false;
                }
                return _eleNameMap[eleName];
              };

              /*
               * Create new instance of element type
               */
              var _create = function(eleSrv, options) {
                if (!options) {
                  options = {};
                }

                var newEle = $.extend(true, options || {}, eleSrv.data);
                _setGenMethods(eleSrv, newEle); // Set generic methods for
                // instance

                // Call autofill fn if model/class has one.
                if (eleSrv.autofill) {
                  eleSrv.autofill(newEle);
                }

                newEle.vID = _eleVCount[eleSrv.model_data.name]++;
                var trackID = newEle.id || "v" + newEle.vID;

                // Save UI vars
                var trackUI = _eleMaps[eleSrv.model_data.name][trackID] && _eleMaps[eleSrv.model_data.name][trackID].UI ? _eleMaps[eleSrv.model_data.name][trackID].UI
                    : {};
                newEle.UI = trackUI;

                // Update tracking map
                _eleMaps[eleSrv.model_data.name][trackID] = newEle;

                return newEle;
              };
              var _createEles = function(eles, eleSrv) {
                if (eles && eles.length && eleSrv) {
                  for ( var key in eles) {
                    eles[key] = _create(eleSrv, eles[key]);
                  }
                }
                return eles;
              };

              // Sets generic methods for instance that every instance should
              // have.
              var _setGenMethods = function(eleSrv, eleIns) {

                eleIns.get = function(name) {
                  if (!eleSrv.fields[name]) {
                    throw "Field " + name + " does not exist in model.";
                  }
                  _validateInitField(eleSrv, eleIns, name);
                  return eleIns[name];
                };
                eleIns.set = function(name, value) {
                  if (!eleSrv.fields[name]) {
                    throw "Field " + name + " does not exist in model.";
                  }
                  if (eleSrv.fields[name].type === "object" || eleSrv.fields[name].type === "array") {
                    if (value) {
                      // Copies values while maintaining reference links to eleIns[name]
                      angular.copy(value, eleIns[name]);
                    }
                  } else {
                    eleIns[name] = value;
                  }
                };
                eleIns.getFieldParams = function(name) {
                  if (!eleSrv.fields[name]) {
                    throw "Field " + name + " does not exist in " + eleSrv.model_data.name + " model.";
                  }
                  return eleSrv.fields[name];
                };
              };
              // Helps initialized and check fields
              var _validateInitField = function(eleSrv, eleIns, name) {
                var fieldType = eleSrv.fields[name].type;
                if (!eleIns[name]) {
                  if (fieldType === "object") {
                    eleIns[name] = {};
                  }
                  if (fieldType === "array") {
                    eleIns[name] = [];
                  }

                  if (eleSrv.fields[name].default_value) {
                    if (fieldType === "object" || fieldType === "array") {
                      eleIns[name] = $.extend(true, eleIns[name], eleSrv.fields[name].default_value);
                    }
                    // May not want to store date object in the field
                    // else if (fieldType === "date" || fieldType ===
                    // "duration") {
                    // eleIns[name] = new Date(eleIns[name]);
                    // }
                    else {
                      eleIns[name] = eleSrv.fields[name].default_value;
                    }
                  }
                }
              };

              /*
               * Update backend data object
               * 
               * options.fields used to only update certain fields
               */
              var _updateBdata = function(eleIns, eleType, options) {
                if (!eleIns || !eleIns || !eleType) {
                  return false;
                }

                var eleSrv = _getModel(eleType)[eleType];

                var fields = eleSrv.fields;

                var currBdata = eleIns.b_data || {};
                var bDataUpdate = {};
                var currFieldParams = null;
                // Get all fields that should be submitted to the api (have
                // api.submit==true)
                for ( var fieldName in eleIns) {
                  currFieldParams = eleSrv.fields[fieldName];
                  if (currFieldParams && currFieldParams.api && currFieldParams.api.submit && (!fields || fields[fieldName])) {
                    currBdata[fieldName] = eleIns[fieldName];
                    bDataUpdate[fieldName] = eleIns[fieldName];
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
              var _get = function(eleType, id, options) {
                if (!eleType || (!id && !options || !options.pathType || (options.pathType === "single" && !options.id))) {
                  throw "Missing field or option for api get.";
                }
                // If single instance is requested, there is no force, and it
                // exists in memory, then provide the instance in memory.
                if (id && (!options || !options.forceAPI) && _eleMaps[eleType][id]) {
                  return $q(function(resolve, reject) {
                    resolve(_eleMaps[eleType][id]);
                  });
                } else if (id) {
                  // If id is provided, and force is applied or does not exist
                  // in memory, then setup options to do an api call.
                  if (!options) {
                    options = {};
                  }
                  options.pathType = "single";
                }

                var eleSrv = _getModel(eleType);
                if (!eleSrv.model_data.api || !eleSrv.model_data.api[options.pathType]) {
                  throw "Path type, " + options.pathType + ", does not exist for " + eleType;
                }

                var path = eleSrv.model_data.api[options.pathType](options);
                if (path === false) {
                  // Assumed error was thrown by api pathType fn.
                  return false;
                }

                var params = options || {
                // Example "page" : 0,
                // "rows" : 20
                };

                return serverAPI.doAPICall(path, options).then(function(response) {
                  if (!response || response.success === false || response.success === "failed") {
                    throw "Path " + path + " returned a failure response.";
                  }

                  var eles = response.data ? response.data : response;
                  if (!eles) {
                    return;
                  }
                  if (!$.isArray(eles)) {
                    eles = [ eles ];
                  }

                  var allEleInsMap = {}; // Map of new _elements
                  for ( var i in eles) {
                    var currEleIns = eles[i];
                    currEleIns.b_data = $.extend(true, {}, eles[i]);
                    // Create ele while keeping untouched b-data
                    currEleIns = _create(eleSrv, currEleIns);

                    allEleInsMap[currEleIns.id] = currEleIns;
                  }

                  return _createEles(allEleInsMap, eleSrv);
                });
              };
              var _getEles = function(eleType, options) {
                if (!eleType || !_getModel(eleType)) {
                  throw "_getEles: Missing eleType.";
                }
                var eleSrv = _getModel(eleType);

                if (!options) {
                  options = {};
                }
                if (!options.pathType) {
                  options.pathType = "multiple";
                }
                return _get(eleType, null, options);
              };
              /*
               * General method for posting new/modified _elements to api
               */
              _submit = function(eleType, options) {
                if (!eleType || !options || !options.pathType || (options.pathType === "single" && !options.ele)) {
                  throw "_submit: Missing field or option.";
                }

                var eleSrv = _getModel(eleType);
                if (!eleSrv.model_data.api || !eleSrv.model_data.api[options.pathType]) {
                  throw "Path type, " + options.pathType + ", does not exist for " + eleType;
                }

                var postEles = [];
                if (!options.eles && options.ele) {
                  postEles.push(options.ele);
                } else if (options.eles) {
                  postEles = options.eles;
                }

                // Separate fn required to avoid pointer issues.
                var serverSubmitEle = function(path, currOptions, currEleIns) {
                  return serverAPI.doAPICall(path, currOptions).then(function(response) {
                    if (!response || response.success === false || response.success === "failed") {
                      throw "Path " + path + " returned a failure response.";
                    }

                    var newEleData = response.data ? response.data : response;
                    if (!newEleData) {
                      return;
                    }

                    var currReEleIns = _updateInstance(currEleIns, newEleData);

                    // update _eleMaps
                    _eleMaps[eleType][currReEleIns.id] = currReEleIns;
                  });
                };

                var reEleIns = [];
                var allCalls = [];

                var currEleIns = null;
                var currOptions = null;
                // Go through ele instances and update if necessary.
                for ( var i in postEles) {
                  currEleIns = postEles[i];
                  currOptions = {};
                  currOptions.isAsync = true;

                  // Get set of fields to pass to api
                  var bDataUpdate = _updateBdata(currEleIns, eleType, options);
                  currOptions = $.extend(currOptions, bDataUpdate);

                  var path = eleSrv.model_data.api[options.pathType](currOptions);
                  if (path === false) {
                    // Assumed error was thrown by api pathType fn.
                    return false;
                  }

                  // Would do comparison here to see if update is necessary.
                  allCalls.push(serverSubmitEle(path, currOptions, currEleIns));
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
              _validateFields = function(eleType, currEle, options) {
                if (!options) {
                  options = {};
                }
                if (!eleType || !currEle) {
                  throw "_validateFields: Missing type or instance.";
                }
                var eleSrv = _getModel(eleType);

                var valResult = null;
                var valResutls = [];
                for ( var currField in eleSrv.fields) {
                  // valResult = validateSrv.validateField(currEle[currField],
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

              _updateInstance = function(ele, newData) {
                ele.b_data = $.extend(true, ele.b_data || {}, newData);
                ele = $.extend(true, ele || {}, newData);
                return ele;
              };
              // Remove instance from global map. Also remove from backend if
              // apiRemove==true
              var _remove = function(eleType, currEle, apiRemove) {
                var eleSrv = _getModel(eleType);
                if (!eleType || !currEle || !eleSrv) {
                  throw "_remove: Missing type, model, or instance.";
                }
                if (apiRemove && (!eleSrv.model_data.api || !eleSrv.model_data.api.remove)) {
                  throw "_remove: Missing remove api path type.";
                }

                if (apiRemove && currEle.id) {
                  var path = eleSrv.model_data.api.remove(currEle);
                  if (path === false) {
                    // Assumed error was thrown by api pathType fn.
                    return false;
                  }
                  return serverAPI.doAPICall(path, currEle).then(function(response) {
                    if (!response || response.success === false || response.success === "failed") {
                      throw "Path " + path + " returned a failure response.";
                    }
                    delete _eleMaps[eleType][currEle.id];
                  });
                } else {
                  delete _eleMaps[eleType][currEle.id];
                }

                return true;
              };

              // ---------------------------------------

              // Init universal methods for ele models
              var _initModelMethods = function() {
                for ( var i in _eleNameMap) {
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

              /*
               * Public methods
               */
              return {
                initService : _initService, //Inits service and ele models

                create : _create,
                remove : _remove,

                /*
                 * Validate elment fields for db submission
                 */
                validateFields : _validateFields,

                get : _get, //Element(s) Retrieval method 
                getEles : _getEles, //Get all elements of a type. (Convience funciton)
                submit : _submit, //Element(s) update method

                eleNameMap : _eleNameMap,
                eleTypeList : _eleTypeList,
                eleMaps : _eleMaps,
                eles : _elements

              };

            } ]);
