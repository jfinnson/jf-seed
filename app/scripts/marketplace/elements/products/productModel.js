angular.module("app")

.service("productModel", [ function() {
  var _this = this;
  this.model_data = {
    "name" : "product",
    "display_name" : "Product",
    "api" : {
      //Different path types which correspond to different endpoints.
      "multiple" : function(options){
        if(!checkNested(options)){
          throw "Missing option(s) for account path 'single'. Options: " + options;
        }
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