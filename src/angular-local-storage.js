
angular.module('angryjs.localStorage', [])
  // You should set a prefix to avoid overwriting any local storage variables from the rest of your app
  // e.g. angularLocalStorage.constant('prefix', 'youAppName');
  .constant('prefix', 'ls')

  .service('LocalStorage', [
  '$rootScope',
  'prefix',
  function($rootScope, prefix) {

    // If there is a prefix set in the config lets use that with an appended period for readability
    //var prefix = angularLocalStorage.constant;
    if (prefix.substr(-1)!=='.') {
      prefix = !!prefix ? prefix + '.' : '';
    }

    // Checks the browser to see if local storage is supported
    var browserSupportsLocalStorage = function () {
      try {
        return ('localStorage' in window && window['localStorage'] !== null);
      } catch (e) {
        $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
        return false;
      }
    };

    // Directly adds a value to local storage
    // If local storage is not available in the browser use cookies
    // Example use: localStorageService.add('library','angular');
    var addToLocalStorage = function (key, value) {

      // If this browser does not support local storage use cookies
      if (!browserSupportsLocalStorage()) {
        $rootScope.$broadcast('LocalStorageModule.notification.warning','LOCAL_STORAGE_NOT_SUPPORTED');
        return false;
      }

      // 0 and "" is allowed as a value but let's limit other falsey values like "undefined"
      if (!value && value!==0 && value!=="") {
        return false;
      }

      try {
        localStorage.setItem(prefix+key, angular.toJson(value));
      } catch (e) {
        $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
        return false;
      }
      return true;
    };

    // Directly get a value from local storage
    // Example use: localStorageService.get('library'); // returns 'angular'
    var getFromLocalStorage = function (key) {
      if (!browserSupportsLocalStorage()) {
        $rootScope.$broadcast('LocalStorageModule.notification.warning','LOCAL_STORAGE_NOT_SUPPORTED');
        return false;
      }

      var item = localStorage.getItem(prefix+key);
      if (!item) {
        return null;
      }
      return angular.fromJson(item);
    };

    // Remove an item from local storage
    // Example use: localStorageService.remove('library'); // removes the key/value pair of library='angular'
    var removeFromLocalStorage = function (key) {
      if (!browserSupportsLocalStorage()) {
        $rootScope.$broadcast('LocalStorageModule.notification.warning','LOCAL_STORAGE_NOT_SUPPORTED');
        return false;
      }

      try {
        localStorage.removeItem(prefix+key);
      } catch (e) {
        $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
        return false;
      }
      return true;
    };

    // Remove all data for this app from local storage
    // Example use: localStorageService.clearAll();
    // Should be used mostly for development purposes
    var clearAllFromLocalStorage = function () {

      if (!browserSupportsLocalStorage()) {
        $rootScope.$broadcast('LocalStorageModule.notification.warning','LOCAL_STORAGE_NOT_SUPPORTED');
        return false;
      }

      var prefixLength = prefix.length;

      for (var key in localStorage) {
        // Only remove items that are for this app
        if (key.substr(0,prefixLength) === prefix) {
          try {
            removeFromLocalStorage(key.substr(prefixLength));
          } catch (e) {
            $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
            return false;
          }
        }
      }
      return true;
    };

    return {
      isSupported: browserSupportsLocalStorage,
      set: addToLocalStorage,
      get: getFromLocalStorage,
      remove: removeFromLocalStorage,
      clear: clearAllFromLocalStorage
    };

  }]);