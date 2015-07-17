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