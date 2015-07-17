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
