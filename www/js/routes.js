App.config(function($httpProvider, $stateProvider, $urlRouterProvider) {

  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common["X-Requested-With"];

  $httpProvider.interceptors.push('TokenAuthInterceptor');

  $stateProvider

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl'
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.publish', {
    url: "/publish",
    views: {
      'menuContent': {
        templateUrl: "templates/publish.html"
      }
    }
  })

  .state('app.timeline', {
    url: "/timeline",
    views: {
      'menuContent': {
        templateUrl: "templates/timeline.html",
        controller: 'TimelineCtrl'
      }
    }
  })

  .state('app.alert', {
    url: "/alerts/:alertId",
    views: {
      'menuContent': {
        templateUrl: "templates/alert.html",
        controller: 'AlertCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/timeline');
})

;
