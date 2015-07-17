
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
