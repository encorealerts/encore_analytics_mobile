angular.module('encore.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $state, $api) {
  $scope.logout = function () {
    $rootScope.authenticatedUser = null;
    $api.logout();
  };

  $scope.reloadAlerts = function () {
    $rootScope.$emit('reloadAlerts');
  };
})

.controller('LoginCtrl', function ($rootScope, $scope, $http, $api, $state, $localstorage, $ionicBackdrop, $ionicPopup, $networkConnection, API_URL) {
  $scope.loginData = {
    email: '',
    password: ''
  };

  var currentUser = $localstorage.getObject('currentUser');
  if (currentUser) {
    $scope.loginData.email = currentUser.email;
  }

  $scope.doLogin = function() {
    $ionicBackdrop.retain();
    $http.post(API_URL + '/login', {user: {email: $scope.loginData.email, password: $scope.loginData.password}}).
    success(function(user, status, headers, config) {
      $localstorage.setObject('currentUser', {
        name: user.name,
        email: user.email,
        authentication_token: user.authentication_token
      });
      $rootScope.authenticatedUser = user;
      $state.go('app.timeline');
    }).
    error(function(data, status, headers, config) {
      if ($networkConnection.check()) {
        $ionicPopup.alert({
          title: 'Invalid Login',
          template: 'Check your credentials.'
        });
      }
      $api.logout();
    }).
    finally($ionicBackdrop.release);
    $scope.loginData.password = '';
  };

})

.controller('TimelineCtrl', function($scope, $rootScope, $localNotification, $ionicBackdrop, $api, SERVER_URL) {

  $scope.viewAlert = function (id) {
    window.open(SERVER_URL + $api.signature('/alerts/'+ id), '_blank', 'location=yes');
  };

  $scope.loadAlerts = function () {
    $ionicBackdrop.retain();
    var queryString = ($rootScope.alerts && $rootScope.alerts[0]) ? ('?skipTo=' + $rootScope.alerts[0].id) : '';
    $api.get('/alerts' + queryString,
    function onSuccess(alerts) {
      if (queryString == '') { // first run
        $scope.alerts = alerts;
      } else { // notify new alerts
        var
          i = 0,
          j = alerts.length,
          alert = null;
        for (; i<j; i++) {
          alert = alerts[i];
          $scope.alerts.unshift(alert);
          $localNotification.add({
            autoCancel: true,
            message: alert.subject,
            json:    { alertId: alert.id }
          });
        }
      }
      $rootScope.alerts = $scope.alerts;
    },
    function onError(error) {
      console.log(error);
    });
    $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
    $ionicBackdrop.release();
  };

  $scope.loadAlerts();
  $rootScope.$on('reloadAlerts', $scope.loadAlerts);
  $rootScope.$on('onClickNotification', function (event, id, state, json, data) {
    $scope.viewAlert((JSON.parse(json)).alertId);
  });

})

.controller('AlertCtrl', function($scope, $rootScope, $stateParams, $filter) {
  $scope.alert = $filter('getById')($rootScope.alerts, $stateParams.alertId);
})

;
