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

      if (window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }

      // Global InAppBrowser reference
      window.iabRef = null;
      window.open = cordova.InAppBrowser.open;
      window.iabCustomizeCSS = function () {
        iabRef.insertCSS({
          code: "#side-bar {display:none;}"
        }, function () {
          // alert("Styles Altered");
        });
      };
      window.iabOpen = function (url) {
        iabRef = window.open(url, '_blank', 'location=yes,toolbarposition=top,transitionstyle=fliphorizontal');
        // iabRef.addEventListener('loadstop', iabCustomizeCSS);
        // iabRef.addEventListener('exit', iabClose);
      };
      window.iabClose = function (event) {
        iabRef.removeEventListener('loadstop', iabCustomizeCSS);
        iabRef.removeEventListener('exit', iabClose);
      };

    } // if (window.cordova)

    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

  });

});
