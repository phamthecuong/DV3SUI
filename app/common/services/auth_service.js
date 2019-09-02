(function() {
  "use strict";

  function AuthService($http, $q, utilFactory, $translate, tmhDynamicLocale) {
    let _currentPerson = {};
    let _currentPersonPermissions = {};
    let _preferedLanguage;
    let listLanguage = ["en", "de"];

    this.setCurrentPerson = function(currentPerson) {
      _currentPerson = currentPerson;
    };

    this.getCurrentPerson = function() {
      return _currentPerson;
    };

    this.setCurrentPersonPermissions = function (currentPersonPermissions) {
      return _currentPersonPermissions;
    };

    this.getCurrentPersonPermissions = function() {
      return _currentPersonPermissions;
    };

    this.getListLanguage = function() {
      return listLanguage;
    };

    this.setPreferedLanguage = function(preferedLanguage) {
      _preferedLanguage = preferedLanguage;
    };

    this.getPreferedLanguage = function() {
      return _preferedLanguage;
    };

    this.updatePreferedLanguage = function(id, language, op) {
      let url = `/auth/rest/persons/${id}/settings`;
      let data = [
        {
        "op": op,
        "path": "/personSettings",
          "value": {"language": language},
        }];
      return $http.patch(url, data).then(
        function success(response) {
          _preferedLanguage = language;
          tmhDynamicLocale.set(language);
          $translate.use(language);
          utilFactory.showToast(true, id, false);
        }, function error(response) {
          utilFactory.showToast(false, id, false);
        }
      );
    };

    this.updateProfile = function(id, jsonProfile) {
      let url = `/auth/rest/persons/${id}`;
      return $http.patch(url, jsonProfile).then(
        function success(response) {
          _currentPerson.username = jsonProfile.username;
          _currentPerson.firstname = jsonProfile.firstname;
          _currentPerson.lastname = jsonProfile.lastname;
          _currentPerson.emailAddress = jsonProfile.emailAddress;
          _currentPerson.company = jsonProfile.company;
          utilFactory.showToast(true, id, false);
        }, function error(response) {
          utilFactory.showToast(false, id, false);
        }
      );
    };

    this.updatePassword = function(oldPassword, newPassword) {
      let deferred = $q.defer();
      let id = _currentPerson.id;
      $http.post("/auth/rest/persons/password/" + id + "?oldPassword=" +
        encodeURIComponent(oldPassword) + "&newPassword=" +
        encodeURIComponent(newPassword)).then(
        function success(response) {
          deferred.resolve(response.data);
          utilFactory.showToast(true, id, false);
        }, function error(response) {
          deferred.reject(response);
          utilFactory.showToast(false, id, false);
        }
      );
      return deferred.promise;
    };

    this.logout = function() {
      return $http.get("/auth/logout").then(
        function success(response) {
          location.reload();
        }, function error(response) {
          return;
        }
      );
    };
  }

  AuthService.$inject = [
    "$http",
    "$q",
    "UtilFactory",
    "$translate",
    "tmhDynamicLocale"
    ];
  angular.module("app").service("AuthService", AuthService);
})();
