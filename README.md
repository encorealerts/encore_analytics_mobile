<p style='color:gray; font-style:italic;'>
Note 1:  To simplify life and assure that we are all on same path, all generated files were added to the project, including binaries and node modules.
</p>

<p style='color:gray; font-style:italic;'>
Note 2: iOS development requires Mac OS X. iOS simulator through the Ionic CLI requires the ios-sim npm package, which can be installed with the command sudo npm -g install ios-sim.
</p>

# Ionic Framework
[Ionic Framework](http://ionicframework.com/) offers a library of mobile-optimized HTML, CSS and JS components, gestures, and tools for building highly interactive apps. Built with Sass and optimized for AngularJS.

```
$ npm install -g cordova ionic
```

# Apple Push Notification Services
The "keys" app directory contains all certifies and keys required by Apple to make Push Notifications possible. There are also two PDF tutorial files with a complete overview on that field.

# App distribution
1.  The app version on "config.xml" should be increased on every new binary release.
2. The app should be compiled through Ionic:
```
$ ionic build ios
```
3. Double-click "platforms/ios/EncoreAlert.xcodeproj" to open it with XCode.

4. On XCode, go to menu Product > Archive (simulator setting must be on "iOS Device")

5. Choose way of distribution on popup at the end of archiving proccess. For AdHoc distribution, choose 'Export' button.

6. For AdHoc distribution, [diawi](http://www.diawi.com/) is a good place to upload "EncoreAlert.ipa" file and send a downloadable link for the customers. They should open it on their mobile's Safari browser.

7. When submitting to store, go to [iTunes Connect](https://itunesconnect.apple.com) and edit the app properly. TestFlight distributions happens here too.

# Provisioning Profiles
They allow you to compile and distribute your app to specified audience.
Go to [Dev Center](https://developer.apple.com/account/ios/profile/profileList.action) (login: admin@encorehq.com, pwd: 'Shan...8168.'). Here, devices can be registered and added to AdHoc provisioning profiles (editing them).

# Releasing AdHoc for a new UDID
1. Add device UDID and person name to Devices section on Provisioning Profiles site.

2. Edit the AdHoc Provisioning Profile and enable the just added device.

3. Save and download Provisioning Profile. Double-click it to register on XCode.

4. Repeat "App distribution" steps choosing AdHoc way.
