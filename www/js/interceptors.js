angular.module('encore.interceptors', [])

  .factory('TokenAuthInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
      request: function (config) {
        if (config.url.indexOf('/login') < 0) {
          if (!$rootScope.authenticatedUser) {
            $location.path('/login');
            return $q.reject(config);
          }
        }
        return config;
      },
      responseError: function (rejection) {
        if (rejection.status === 401 || !$rootScope.authenticatedUser) {
          $location.path('/login');
        }
        return $q.reject(rejection);
      }
    }
  }])

;
