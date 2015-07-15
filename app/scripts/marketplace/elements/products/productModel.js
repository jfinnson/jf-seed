"use strict";

angular.module("app")

.service("productModel", [ function() {
  var _this = this;
  this.modelData = {
    "name" : "appliance",
    "display_name" : "Appliance",
    "api" : {

    }

  };

  this.autofill = function(ele) {
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
  }

  this.data = {
    "params" : {
      "model_name" : "appliance"
    },
    "getStatus" : function() { //Example function
      return this.last_state;
    }
  }

} ]);