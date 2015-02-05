angular.module('encore.services', [])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function (key, value) {
      $window.localStorage[key] = value;
    },
    get: function (key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function (key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function (key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    delete: function (key) {
      delete $window.localStorage[key];
    }
  };
}])

.factory('$api', ['$http', '$state', '$localstorage', 'API_URL', function ($http, $state, $localstorage, API_URL) {
  return {
    authenticated: function () {
      var user = $localstorage.getObject('currentUser');
      return (user && user.authentication_token) ? true : false;
    },
    signature: function (path) {
      var user = $localstorage.getObject('currentUser');
      var connector = path.indexOf('?') > -1 ? '&' : '?';
      return path + connector + 'user_email=' + encodeURIComponent(user.email) + '&user_token=' + user.authentication_token
    },
    logout: function () {
      var user = $localstorage.getObject('currentUser');
      user.authentication_token = null;
      $localstorage.setObject('currentUser', user);
      $state.go('login');
    },
    get: function (path, onSuccess, onError) {
      var user = $localstorage.getObject('currentUser');
      $http.get(API_URL + this.signature(path)).
      success(function(data, status, headers, config) {
        onSuccess(data);
      }).
      error(function(data, status, headers, config) {
        onError(data);
      });
    }
  };
}])

.factory('$localNotification', ['$rootScope', '$window', function ($rootScope, $window) {
  return {
    init: function () {
      cordova.plugins.notification.local.hasPermission(function (granted) {
        if (!granted) {
          cordova.plugins.notification.local.registerPermission(function (granted) {});
        }
      });

      // cordova.plugins.notification.local.onadd = function (id, state, json) {
      //   console.log('---- onadd');
      //   console.log(arguments);
      //   alert('on add\n' + Array.apply(null, arguments).join("\n"));
      // };

      // cordova.plugins.notification.local.ontrigger = function (id, state, json) {
      //   console.log('---- ontrigger');
      //   console.log(arguments);
      //   alert('on trigger\n' + Array.apply(null, arguments).join("\n"));
      // };

      cordova.plugins.notification.local.onclick = function (id, state, json, data) {
        $rootScope.$emit('onClickNotification', id, state, json, data);
      };

      // cordova.plugins.notification.local.oncancel = function (id, state, json) {
      //   console.log('---- oncancel');
      //   console.log(arguments);
      //   alert('on cancel\n' + Array.apply(null, arguments).join("\n"));
      // };

      $window.notificationId = Date.now();

      $window.addNotification = function (notification) {
        notification.id = ++$window.notificationId;
        cordova.plugins.notification.local.add(notification);
      };
    },
    add: function (notification) {
      cordova.plugins.notification.local.add(notification);
      console.log('notification added;');
    }
  };
}])

.factory('$networkConnection', ['$ionicPopup', function ($ionicPopup) {
  return {
    check: function () {
      if(window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
          $ionicPopup.confirm({
            title: "Internet Disconnected",
            content: "The internet is disconnected on your device."
          })
          .then(function(result) {
            if(!result) {
              ionic.Platform.exitApp();
            }
          });
          return false;
        }
      }
      return true;
    }
  };
}])

;
