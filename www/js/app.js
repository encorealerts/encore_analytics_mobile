window.App = angular.module('encore', ['ionic', 'encore.interceptors', 'encore.filters', 'encore.services', 'encore.controllers']);

App.constant('SERVER_URL', 'http://staging.feed.encorealert.com');
App.constant('API_URL', 'http://staging.feed.encorealert.com/api/v1');

App.run(function($ionicPlatform, $rootScope, $networkConnection, $localStorage, $filter, $api) {
  $ionicPlatform.ready(function () {

    $networkConnection.check();

    window.apiClientDevice = window.device || {};

    if (window.cordova) {
      cordova.getAppVersion(function (appVersion) {
        window.apiClientDevice.app_version = appVersion;
      });
    }

    if (window.cordova && window.plugins.pushNotification) {
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
          $rootScope.authenticatedUser = null;
          $rootScope.currentUser = null;
          $api.logout();
        } else {
          window.currentBusiness = $filter('getById')(window.businesses, event.businessId);
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

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if (window.StatusBar) {
      StatusBar.styleDefault();
    }


    // Global InAppBrowser reference
    window.iabRef = null;

    // Inject our custom CSS into the InAppBrowser window
    window.iabChangeBackgroundColor = function () {
      iabRef.insertCSS({
        // code: "#side-bar { top:-40px; height:100px; }"
      }, function () {
        // alert("Styles Altered");
      });
    };

    window.iabClose = function (event) {
      window.iabRef.removeEventListener('loadstop', iabChangeBackgroundColor);
      window.iabRef.removeEventListener('exit', iabClose);
    };

    window.iabOpen = function (url) {
      window.iabRef = window.open(url, '_blank', 'location=yes;toolbar=no');
      window.iabRef.addEventListener('loadstop', iabChangeBackgroundColor);
      window.iabRef.addEventListener('exit', iabClose);
    };

  });

});
