// Note: not currently used. Here to show the team.

angular.module("app.marketplace.elements")

// Treated like an ele due to its model-like nature. //TODO reassess either
// this manager or all others.
// Ele/Class/Service for managing the ele display tree
.service("eleTreeManager", [ "serverAPI", "apiUtils", function(serverAPI, apiUtils) {
  var self = this;
  this.modelData = {
    "name" : "eleTree",
    "STORAGE_ID" : "eleTree"
  };

  this.eleTree = {
    "params" : {
      "name" : "eleTree",
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
    "createTree" : function(eles) {
      var currEle = null;
      var parentKey = null;
      var treeIns = this;

      // Stage 1. Create hash maps
      // Go through eles and categorize them by parent luid
      for ( var key in eles) {
        currEle = eles[key];

        // Get parent hash map key
        parentKey = currEle.f_data.parentKey || currEle.f_data.parent_luid;
        if (!parentKey && currEle.f_data.parent_vLuid) {
          parentKey = ("v" + currEle.f_data.parent_vLuid);
        } else if (!parentKey) {
          if (this.f_data.rootType) {
            if (currEle.f_data.type === this.f_data.rootType) {
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

          if (parentKey && eles[parentKey]) {
            eles[parentKey].f_data.hasChildren = true;
          }

          // Set in hash map
          this.f_data.treeMap[parentKey][key] = currEle;
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
          currEle = this.f_data.treeMap[key][currKey]; // Important
          // to use
          // "this.f_data.treeMap[key]"
          // to allow
          // for data
          // linking
          inserted = false;

          // Specify key if missing
          if (!currEle.f_data.key) {
            currEle.f_data.key = currKey;
          }

          // Case 0. Root array mismatch
          if ((treeIns.f_data.rootType && currEle.f_data.type !== treeIns.f_data.rootType) && key === "0") {
            // Case 0. Mismatch so add to 'misc'

            if (!treeIns.f_data.exceptionType || !currEle.f_data[treeIns.f_data.exceptionType]) {
              if (!this.f_data.treeArrayMap['misc']){
                this.f_data.treeArrayMap['misc'] = [];
              }
              this.f_data.treeArrayMap['misc'].push(currEle);
            }
            inserted = true;
          } else if (currEle.f_data.previousKey) { // Insert
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
              if (currChild.f_data.key === currEle.f_data.previousKey) {
                // Case 1a. Previous child found
                currChildArrayMap.splice((parseInt(currChildIndex,10) + 1), 0, currEle);
                inserted = true;
                break;
              }
            }
          } else if (currChildArrayMap.length) {
            // Case 2. No previous key but eles exist in array
            // Insert at start
            currChildArrayMap.splice(0, 0, currEle);
            inserted = true;
          } else {
            // Case 3. No previous key and no eles in array.
            currChildArrayMap.push(currEle);
            inserted = true;

          }

          if (inserted) {
            // Case 4. Not inserted. Likely due to previous ele not
            // being inserted yet.
            delete currChildMap[currKey];

          }

          currChildMapIndex++;
          currChildMapCount++;
          if (currChildMapIndex >= Object.keys(currChildMap).length){
            currChildMapIndex = 0;
          }
        }

        // Case 5 eles with errors or missing parents or missing
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
      this.eles = eles; // For internal reference;
    },
    "getTree" : function() {
      return this.f_data.treeArrayMap;
    },
    "createKey" : function(newEle, eles) {
      var increment = 0;
      while (!newEle.f_data.key || (eles[newEle.f_data.key] && eles[newEle.f_data.key] !== newEle)) {
        newEle.f_data.key = newEle.f_data.luid || ('v' + (newEle.f_data.vLuid + increment));

        if (increment > 0 && newEle.f_data.luid) {
//          debugger;// TODO
        }
        increment++;

      }
    },
    "addEle" : function(newEle, baseEle) {
      if (!newEle || !newEle.f_data.key){
        return null;
      }

      var parentKey = 0;
      if (baseEle) {
        // Set parent vars
        if (baseEle.f_data.luid) {
          newEle.f_data.parent_luid = baseEle.f_data.luid;
          newEle.f_data.parentKey = baseEle.f_data.luid;
        } else {
          newEle.f_data.parent_vLuid = baseEle.f_data.vLuid;
          newEle.f_data.parentKey = baseEle.f_data.key || ("v" + newEle.f_data.parent_vLuid);
        }
        parentKey = newEle.f_data.parentKey;
        newEle.f_data.parent_ele = baseEle;
        baseEle.f_data.hasChildren = true;

      }
      if (!this.f_data.treeMap[parentKey]) {
        this.f_data.treeMap[parentKey] = {};
      }
      if (!this.f_data.treeArrayMap[parentKey]) {
        this.f_data.treeArrayMap[parentKey] = [];
      }
      this.f_data.treeMap[parentKey][newEle.f_data.key] = newEle;
      this.f_data.treeArrayMap[parentKey].push(newEle);

      // Set previous vars
      if (this.f_data.treeArrayMap[parentKey].length > 1) {
        var prevEle = this.f_data.treeArrayMap[parentKey][this.f_data.treeArrayMap[parentKey].length - 2];
        newEle.f_data.previous_luid = prevEle.f_data.luid;
        newEle.f_data.previousKey = prevEle.f_data.key;
      }
    },
    "removeEle" : function(currEle) {
      if (!currEle){
        return false;
      }

      var parentKey = (currEle.f_data.parentKey || 0);
      delete this.f_data.treeMap[parentKey][currEle.f_data.key];

      var childArray = this.f_data.treeArrayMap[parentKey];
      for ( var index in childArray) {
        if (childArray[index] === currEle) {
          index = parseInt(index,10);

          // Update subsequent ele if there is one.
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
    "updateEle" : function(currEleKey, newChildArray, newParent, end, oldChildArray, start) {
      if (!currEleKey || !(newChildArray || newParent) || end === null || end === undefined || !oldChildArray || start === null || start === undefined) {
        console.log('error: updateEle', arguments);
        return false;
      }

      //Insure that start is an integer
      start = parseInt(start,10);
      var currEle = this.eles[currEleKey];
      var oldParentKey = currEle.f_data.parentKey;
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

        //Open ele
        newParent.open = true;
      }

      //Save new location to hash map
      if (newChildArray !== oldChildArray) {
        var oldHashMap = this.f_data.treeMap[(currEle.f_data.parentKey || 0)];
        var newHashMap = this.f_data.treeMap[newParentKey];

        newHashMap[currEleKey] = oldHashMap[currEleKey];
        delete oldHashMap[currEleKey];

        currEle.f_data.parentKey = newParentKey;
        currEle.f_data.parent_luid = newParentLuid;
      }

      //Check is to make sure update of prev ele references is necessary
      if (newChildArray !== oldChildArray || start !== end) {
        //Update prev ele references
        /*
         * Have to update
         * 1) currEle
         * 2) possibly next ele from old list
         * 3) possibly next ele from new list
         */

        //Update subsequent ele in new list if there is one.
        var prevLuid = null;
        var prevKey = null;
        if (end < newChildArray.length) {
          prevLuid = currEle.f_data.luid;
          prevKey = currEle.f_data.key;
          newChildArray[end].f_data.previous_luid = prevLuid;
          newChildArray[end].f_data.previousKey = prevKey;
        }
        //Update subsequent ele in old list if there is one.
        if ((start + 1) < oldChildArray.length) {
          prevLuid = start > 0 ? oldChildArray[(start - 1)].f_data.luid : null;
          prevKey = start > 0 ? oldChildArray[(start - 1)].f_data.key : null;
          oldChildArray[(start + 1)].f_data.previous_luid = prevLuid;
          oldChildArray[(start + 1)].f_data.previousKey = prevKey;
        }
        //Update currEle
        if (end > 0) {
          prevLuid = newChildArray[(end - 1)].f_data.luid;
          prevKey = newChildArray[(end - 1)].f_data.key;
          currEle.f_data.previous_luid = prevLuid;
          currEle.f_data.previousKey = prevKey;
        } else {
          currEle.f_data.previous_luid = null;
          currEle.f_data.previousKey = null;
        }

      }

      //Save position to array map and update parent fields
      if (!newChildArray.length && newParent){
        newParent.f_data.hasChildren = true;
      }
      newChildArray.splice(end, 0, oldChildArray.splice(start, 1)[0]);
      if (!oldChildArray.length && oldChildArray !== newChildArray && oldParentKey){
        this.eles[oldParentKey].f_data.hasChildren = false;
      }
    }

  };

} ]);