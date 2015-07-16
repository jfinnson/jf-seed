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
                if(!options || !options.account_id){
                  throw "Missing option(s) for account path 'single'. Options: " + options;
                }
                return "account/" + options.account_id;
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