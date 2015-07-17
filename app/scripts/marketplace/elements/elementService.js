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
