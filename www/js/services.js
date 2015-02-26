angular.module('encore.services', [])

.factory('$localStorage', ['$window', function ($window) {
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

.factory('$api', ['$http', '$state', '$localStorage', 'API_URL', function ($http, $state, $localStorage, API_URL) {
  return {
    authenticated: function () {
      var user = $localStorage.getObject('currentUser');
      return (user && user.authentication_token) ? true : false;
    },
    signature: function (path) {
      var user = $localStorage.getObject('currentUser');
      var business = $localStorage.getObject('currentBusiness');
      var business_id = business ? business.id : user.current_business_id;
      var business_param = business_id ? '&business_id=' + business_id : '';
      var connector = path.indexOf('?') > -1 ? '&' : '?';
      var signedUrl = path + connector + 'user_email=' + encodeURIComponent(user.email) + business_param + '&user_token=' + user.authentication_token;
      console.log('signedUrl: ' + signedUrl);
      return signedUrl;
    },
    logout: function () {
      var user = $localStorage.getObject('currentUser');
      user.authentication_token = null;
      $localStorage.setObject('currentUser', user);
      $state.go('login');
    },
    get: function (path, onSuccess, onError) {
      var user = $localStorage.getObject('currentUser');
      $http.get(API_URL + this.signature(path)).
      success(function(data, status, headers, config) {
        onSuccess(data);
      }).
      error(function(data, status, headers, config) {
        onError(data);
      });
    },
    post: function (path, postData, onSuccess, onError) {
      $http.post(API_URL + this.signature(path), postData).
      success(function(user, status, headers, config) {
      }).
      error(function(data, status, headers, config) {
      });
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
