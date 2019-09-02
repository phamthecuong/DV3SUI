(function() {
    'use strict';
    
    function LoginFactory($http, $rootScope, $timeout, $cookieStore) {
        
        var service = {
            login: login,
            setCredentials: setCredentials,
            clearCredentials: clearCredentials
        };
        
        return service;
        
        // implement details
        
        function login(userName, passWord, callBack) {
            $timeout(function() {
                var response = { success: userName == 'dallmeier' && passWord == 'th3is'};
                if(!response.success) {
                    response.message = "Username or password is incorrect";
                }
                callBack(response);
            }, 1000);
        }
        
        function setCredentials(userName, passWord) {
            var authData = userName + ":" + passWord;
            
            $rootScope.globals = {
                currentUser: {
                    userName: userName,
                    passWord: passWord
                }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authData;
            $cookieStore.put('globals', $rootScope.globals);
        }
        
        function clearCredentials() {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        }
    }
    LoginFactory.$inject = ['$http', '$rootScope', '$timeout', '$cookieStore'];
    angular.module('app').factory('LoginFactory', LoginFactory);
    
})();