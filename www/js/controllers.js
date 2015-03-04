;function stopSpinner($scope) {
  $scope.$broadcast('scroll.refreshComplete'); // stops the ion-refresher from spinning
}

angular.module('encore.controllers', [])

.controller('AppCtrl', function($rootScope, $networkConnection, $scope, $state, $api) {
  $scope.logout = function () {
    $api.logout();
  };

  $scope.reloadAlerts = function () {
    $rootScope.$emit('reloadAlerts');
  };
})

.controller('LoginCtrl', function ($rootScope, $scope, $filter, $http, $api, $state, $localStorage, $ionicBackdrop, $ionicPopup, $networkConnection, API_URL) {
  $scope.loginData = {
    email: '',
    password: ''
  };

  var currentUser = $localStorage.getObject('currentUser');
  if (currentUser) {
    $scope.loginData.email = currentUser.email;
  }

  $scope.doLogin = function() {
    $ionicBackdrop.retain();
    $http.post(API_URL + '/login',
    { user: {email: $scope.loginData.email, password: $scope.loginData.password},
      device: window.apiClientDevice
    }).
    success(function(user, status, headers, config) {
      $localStorage.setObject('currentUser', user);
      $api.get('/businesses',
        function onSuccess(businesses) {
          $rootScope.businesses = businesses;
          $localStorage.setObject('currentBusiness', $filter('getById')(businesses, user.current_business_id));
          $state.go('app.timeline');
        },
        function onError(e) {
          alert('Error loading brand list.')
          console.log(e);
        }
      );
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

.controller('TimelineCtrl', [
           '$state', '$scope', '$rootScope', '$localStorage', '$filter', '$ionicBackdrop', '$ionicLoading', '$api', '$networkConnection', 'SERVER_URL',
  function( $state,   $scope,   $rootScope,   $localStorage,   $filter,   $ionicBackdrop,   $ionicLoading,   $api,   $networkConnection,   SERVER_URL) {

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      $scope.forcePageTitle();
      if (!$scope.alerts || $scope.alerts.length === 0) {
        $scope.loadAlerts();
      }
    });

    // Opens the Alert in web Feed, hiding the menu and missions bar.
    $scope.viewAlert = function (id) {
      if (!$networkConnection.check()) {
        return;
      }
      var ref = window.open(SERVER_URL + $api.signature('/alerts/'+ id), '_blank', 'location=yes,toolbarposition=top,transitionstyle=fliphorizontal');
      iabCustomizeCSS = function (event) {
        var css = [];
        css.push('#side-bar, #mission-wrapper {display:none}');
        css.push('#content-wrapper {margin-top:0}');
        css.push('#content-wrapper-inner {padding:10px 36px}');
        ref.insertCSS({
          code: css.join(' ')
        }, function () {
          // styles altered
        });
      };
      iabClose = function (event) {
        ref.removeEventListener('loadstop', iabCustomizeCSS);
        ref.removeEventListener('exit', iabClose);
      };
      ref.addEventListener('loadstop', iabCustomizeCSS);
      ref.addEventListener('exit', iabClose);
    };

    $scope.loadAlerts = function () {
      if (!$networkConnection.check()) {
        stopSpinner($scope);
        return;
      }

      $scope.statusText = '';
      $ionicLoading.show({
        template: 'Loading alerts...'
      });
      $ionicBackdrop.retain();
      $scope.alerts = [];
      var businessId = $localStorage.getObject('currentBusiness').id;
      var queryString = '?business_id=' + businessId;
      $scope.allAlerts = $scope.allAlerts || [];
      $scope.allAlerts[businessId] = $scope.allAlerts[businessId] || [];

      if ($scope.allAlerts[businessId][0]) {
        queryString += '&skipTo=' + $scope.allAlerts[businessId][0].id;
      }

      $api.get('/alerts' + queryString,
        function onSuccess(alerts) {
          angular.forEach(alerts, function (alert) {
            if(!$filter('getById')($scope.allAlerts[businessId], alert.id)) {
              $scope.allAlerts[businessId].unshift(alert);
            }
          });
          $scope.alerts = $scope.allAlerts[businessId];
          $ionicLoading.hide();
          if ($scope.alerts.length === 0) {
            $scope.statusText = "Looks like you don't have any alerts yet!";
          }
        },
        function onError(error) {
          console.log(error);
        }
      );
      stopSpinner($scope);
      $ionicBackdrop.release();
    };

    $scope.forcePageTitle = function () {
      var els = document.querySelectorAll('.title.title-center.header-item');
      angular.forEach(els, function (el) {
        if (el.textContent.indexOf('Feed') > -1) {
          el.textContent = $localStorage.getObject('currentBusiness').name + "'s Feed";
        }
      });
    };

    $rootScope.$on('reloadAlerts', $scope.loadAlerts);
    $rootScope.$on('viewAlert', function (event, id) {
      $scope.viewAlert(id);
    });
  }
])

.controller('SettingsCtrl', function ($rootScope, $scope, $state, $api, $localStorage, $networkConnection) {

  $scope.loadSettings = function () {
    if (!$networkConnection.check()) {
      stopSpinner($scope);
      return;
    }
    $api.get('/businesses',
      function onSuccess(businesses) {
        $scope.businesses = businesses;
      },
      function onError(e) {
        alert('Error loading brand list.')
        console.log(e);
      }
    );
    stopSpinner($scope);
  };

  $scope.setCurrentBusiness = function (index) {
    $localStorage.setObject('currentBusiness', $scope.businesses[index]);
    $rootScope.$emit('reloadAlerts');
  };

  $scope.$on('$stateChangeSuccess', function () {
    if (!$scope.businesses || $scope.businesses.length === 0) {
      $scope.loadSettings();
    }
    $scope.currentBusinessId = $localStorage.getObject('currentBusiness').id;
  });

})

;
