// EncoreAlert Mobile App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'encore' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'encore.controllers' is found in controllers.js
window.App = angular.module('encore', ['ionic', 'encore.interceptors', 'encore.filters', 'encore.services', 'encore.controllers']);

// App.constant('SERVER_URL', 'http://localhost:3000');
// App.constant('API_URL', 'http://localhost:3000/api/v1');
App.constant('SERVER_URL', 'http://staging.feed.encorealert.com');
App.constant('API_URL', 'http://staging.feed.encorealert.com/api/v1');

App.run(function($ionicPlatform, $rootScope, $state, $location, $api, $filter, $networkConnection, $localNotification) {
  $ionicPlatform.ready(function () {

    $networkConnection.check();

    if (window.cordova) {

      cordova.plugins.notification.local.hasPermission(function (granted) {
        if (!granted) {
          cordova.plugins.notification.local.registerPermission(function (granted) {});
        }
      });

      cordova.plugins.notification.local.onadd = function (id, state, json) {
        // console.log('---- onadd');
        // console.log(arguments);
        // alert('on add\n' + Array.apply(null, arguments).join("\n"));
      };

      cordova.plugins.notification.local.ontrigger = function (id, state, json) {
        // console.log('---- ontrigger');
        // console.log(arguments);
        // alert('on trigger\n' + Array.apply(null, arguments).join("\n"));
      };

      cordova.plugins.notification.local.onclick = function (id, state, json) {
        // console.log('---- onclick');
        // console.log(arguments);
        // alert('on click\n' + Array.apply(null, arguments).join("\n"));
        $rootScope.$emit('onClickNotification', id, state, json);
      };

      cordova.plugins.notification.local.oncancel = function (id, state, json) {
        // console.log('---- oncancel');
        // console.log(arguments);
        // alert('on cancel\n' + Array.apply(null, arguments).join("\n"));
      };

      window.notificationId = Date.now();
      window.addNotification = function () {
        ++window.notificationId;
        console.log('---- window.notificationId: ' + window.notificationId);
        cordova.plugins.notification.local.add({
          id: window.notificationId,
          title: 'title',
          message: 'aueee',
          json: { alertId: 18398 }
        });
      };


      // window.setTimeout(function () {
      //   window.addNotification();
      // }, 10000);

      cordova.plugins.backgroundMode.enable();

      // Called when background mode has been activated
      cordova.plugins.backgroundMode.onactivate = function () {
        window.refreshInterval = window.setInterval(function () {
          $rootScope.$emit('reloadAlerts');
        }, 10000);
      };

      cordova.plugins.backgroundMode.ondeactivate = function () {
        // window.clearInterval(window.refreshInterval);
      };

      // $localNotification.init();

      // var counter = 0, id = 1;
      // $localNotification.add({
      //   id:      id,
      //   message: 'Test Message ' + (++counter),
      //   json:    { test:id }
      // });

      // NOTE: Background Fetch works in iOS only.
      // if (window.plugins && window.plugins.backgroundFetch) {
      //   var Fetcher = window.plugins.backgroundFetch;
      //   var fetchCallback = function () {
      //     $api.get('/alerts',
      //     function onSuccess(alerts) {
      //       // $rootScope.alerts = [];
      //       if ($rootScope.alerts) {
      //         alerts = alerts.reverse();
      //       } else {
      //         $rootScope.alerts = $rootScope.alerts || alerts;
      //       }
      //       var i = 0, j = alerts.length, alert = null, isNewAlert = false;
      //       for (; i<j; i++) {
      //         alert = alerts[i];
      //         isNewAlert = $filter('getById')($rootScope.alerts, alert.id) == null;
      //         if (isNewAlert) {
      //           $rootScope.alerts.unshift(alert);
      //           $localNotification.add({
      //               id:         alert.id,
      //               message:    alert.subject,
      //               json:       { alertId: alert.id }
      //           });
      //         }
      //       }
      //       Fetcher.finish();   // <-- N.B. You MUST called #finish so that native-side can signal completion of the background-thread to the os.
      //     }, function onError(error) {
      //       Fetcher.finish();
      //     });
      //   };
      //   Fetcher.configure(fetchCallback);
      // }

    }

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

  });

});
