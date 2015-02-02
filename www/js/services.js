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

.factory('$localNotification', ['$window', function ($window) {
  return {
    init: function () {

      // document.addEventListener('deviceready', function () {
      //   cordova.plugins.notification.local.hasPermission(function (granted) {
      //     console.log('hasPermission: ' + granted);
      //     if (!granted) {
      //       cordova.plugins.notification.local.registerPermission(function (granted) {});
      //     }
      //   });
      //
      //   cordova.plugins.notification.local.onadd = function (id, state, json) {
      //     console.log('---- onadd');
      //     console.log(arguments);
      //     alert('on add\n' + Array.apply(null, arguments).join("\n"));
      //   };
      //
      //   cordova.plugins.notification.local.ontrigger = function (id, state, json) {
      //     console.log('---- ontrigger');
      //     console.log(arguments);
      //     alert('on trigger\n' + Array.apply(null, arguments).join("\n"));
      //   };
      //
      //   cordova.plugins.notification.local.onclick = function (id, state, json) {
      //     console.log('---- onclick');
      //     console.log(arguments);
      //     alert('on click\n' + Array.apply(null, arguments).join("\n"));
      //   };
      //
      //   cordova.plugins.notification.local.oncancel = function (id, state, json) {
      //     console.log('---- oncancel');
      //     console.log(arguments);
      //     alert('on cancel\n' + Array.apply(null, arguments).join("\n"));
      //   };
      //
      //   console.log('---- events binded');
      //
      // }, false);


      // $window.plugin.notification.local.hasPermission(function (granted) {
      //   // console.log('Permission has been granted: ' + granted);
      //   if (!granted) {
      //     $window.plugin.notification.local.promptForPermission(function (granted) {
      //       // console.log('Permission has registered granted: ' + granted);
      //       // this will ask only once for user's permission to display notifications.
      //     });
      //   }
      // });
      //
      // $window.plugin.notification.local.onadd     = function (id, state, json) {};
      // $window.plugin.notification.local.oncancel  = function (id, state, json) {};
      // $window.plugin.notification.local.ontrigger = function (id, state, json) {};
      // $window.plugin.notification.local.onclick   = function (id, state, json) {
      //   $rootScope.$broadcast('localNotificationClicked', id, state, json);
      // };
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
