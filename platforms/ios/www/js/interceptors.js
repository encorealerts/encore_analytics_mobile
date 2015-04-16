angular.module('encore.interceptors', [])

  .factory('TokenAuthInterceptor', ['$q', '$rootScope', '$localStorage', '$location', function ($q, $rootScope, $localStorage, $location) {
    return {
      request: function (config) {
        if (config.url.indexOf('/login') < 0) {
          var currentUser = $localStorage.getObject('currentUser');
          if (!currentUser || !currentUser.authentication_token) {
            $location.path('/login');
            return $q.reject(config);
          }
        }
        return config;
      },
      responseError: function (rejection) {
        var currentUser = $localStorage.getObject('currentUser');
        if (rejection.status === 401 || !currentUser || !currentUser.authentication_token) {
          $location.path('/login');
        }
        return $q.reject(rejection);
      }
    }
  }])

;
