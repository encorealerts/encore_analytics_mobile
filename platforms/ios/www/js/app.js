window.App = angular.module('encore', ['ionic', 'encore.interceptors', 'encore.filters', 'encore.services', 'encore.controllers']);

App.constant('SERVER_URL', 'http://feed.encorealert.com');
App.constant('API_URL', 'http://feed.encorealert.com/api/v1');

App.run(function($ionicPlatform, $rootScope, $localStorage, $filter, $api) {
  $ionicPlatform.ready(function () {

    window.apiClientDevice = window.device || {};

    if (window.cordova) {

      cordova.getAppVersion(function (appVersion) {
        window.apiClientDevice.app_version = appVersion;
      });

      if (window.plugins.pushNotification) {
        var pushNotification = window.plugins.pushNotification;

        pnTokenHandler = function (result) {
          $localStorage.set('apn_token', result);
          window.apiClientDevice.apn_token = result;
        };

        pnErrorHandler = function (result) {
          console.log('pnErrorHandler = ' + error);
        };

        onNotificationAPN = function (event) {
          var user = $localStorage.getObject('currentUser');
          if (user && user.id != event.userId) {
            $api.logout();
          } else {
            var businesses = $localStorage.getObject('businesses');
            if (businesses && event.businessId) {
              $localStorage.setObject('currentBusiness', $filter('getById')(businesses, event.businessId));
            }
            $rootScope.$emit('viewAlert', event.alertId);
          }
        };

        pushNotification.register(pnTokenHandler, pnErrorHandler, {
          "badge":"true",
          "sound":"true",
          "alert":"true",
          "ecb": "onNotificationAPN"
        });
      }

      if (window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }

    } // if (window.cordova)

    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

  });

});
