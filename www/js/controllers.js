angular.module('encore.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $state, $api) {
  $scope.logout = function () {
    $rootScope.authenticatedUser = null;
    $rootScope.currentUser = null;
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
      $localStorage.setObject('currentUser', {
        id: user.id,
        name: user.name,
        email: user.email,
        authentication_token: user.authentication_token
      });
      $rootScope.authenticatedUser = user;
      $api.get('/businesses',
        function onSuccess(businesses) {
          $rootScope.businesses = businesses;
          window.businesses = businesses;
          window.currentBusiness = $filter('getById')(businesses, user.current_business_id);
          $localStorage.setObject('currentBusiness', window.currentBusiness);
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
           '$state', '$scope', '$rootScope', '$localStorage', '$filter', '$ionicBackdrop', '$ionicLoading', '$api', 'SERVER_URL',
  function( $state,   $scope,   $rootScope,   $localStorage,   $filter,   $ionicBackdrop,   $ionicLoading,   $api,   SERVER_URL) {

    // Opens the Alert in web Feed, hiding the menu.
    $scope.viewAlert = function (id) {
      var ref = window.open(SERVER_URL + $api.signature('/alerts/'+ id), '_blank', 'location=yes,toolbarposition=top,transitionstyle=fliphorizontal');
      iabCustomizeCSS = function (event) {
        var css = [];
        css.push('.inAppBrowserWrap {background: #ef473a}');
        css.push('.inAppBrowserWrap menu {background: #ef473a}');
        css.push('.inAppBrowserWrap menu li {color: #fff; background: #ef473a;}');
        css.push('.inAppBrowserWrap menu li.disabled {color: #777}');
        css.push('#side-bar {display:none}');
        css.push('#content-wrapper {margin-top:0}');
        css.push('#content-wrapper-inner {padding:10px 36px}');
        ref.insertCSS({
          code: css.join(' ')
        }, function () {
          // alert("Styles Altered");
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
      $scope.statusText = '';
      $ionicLoading.show({
        template: 'Loading alerts...'
      });
      $ionicBackdrop.retain();
      $scope.alerts = [];
      var businessId = window.currentBusiness.id;
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
      $scope.$broadcast('scroll.refreshComplete'); // stops the ion-refresher from spinning
      $ionicBackdrop.release();
    };

    $scope.forcePageTitle = function () {
      var els = document.querySelectorAll('.title.title-center.header-item');
      angular.forEach(els, function (el) {
        if (el.textContent.indexOf('Feed') > -1) {
          el.textContent = window.currentBusiness.name + "'s Feed";
        }
      });
    };

    $scope.$on('$stateChangeSuccess', function () {
      $scope.business = window.currentBusiness;
      $scope.forcePageTitle();
      $scope.loadAlerts();
    });

    $rootScope.$on('reloadAlerts', $scope.loadAlerts);
    $rootScope.$on('viewAlert', function (event, id) {
      $scope.viewAlert(id);
    });
  }
])

.controller('SettingsCtrl', function ($rootScope, $scope, $state, $api, $localStorage) {
  $scope.$on('$stateChangeSuccess', function () {
    $scope.currentBusinessId = window.currentBusiness.id;
  });

  $scope.reloadSettings = function () {
    $api.get('/businesses',
      function onSuccess(businesses) {
        window.businesses = businesses;
      },
      function onError(e) {
        alert('Error loading brand list.')
        console.log(e);
      }
    );
    $scope.$broadcast('scroll.refreshComplete'); // stops the ion-refresher from spinning
  };

  $scope.setCurrentBusiness = function (index) {
    window.currentBusiness = $scope.businesses[index];
    $localStorage.setObject('currentBusiness', window.currentBusiness);
  };

})

;
