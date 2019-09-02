(function () {
    'use strict';
    function HeaderController($scope, $location, UtilFactory, SocketService, PanesFactory, AuthService, listenerNames) {
        let vmHeader = this;

        $scope.showNavigation = false;
        $scope.displayNavigation = displayNavigation;

        vmHeader.currentPerson = AuthService.getCurrentPerson();
        vmHeader.logout = logout;

        setTimeout(function() {
            SocketService.setSocket('https://server-dv3s.herokuapp.com:443');
        }, 1000);


        checkPreviewMode();

        /* -------------------- FUNCTION DETAILS -------------------- */

        function checkPreviewMode() {
          function setPreviewMode(url) {
            var outerContainer = $('.outer-container');
            if(url.indexOf('preview/channel') > 0) {
              outerContainer.addClass('preview-mode');
            } else {
              outerContainer.removeClass('preview-mode');
            }
          }
          setPreviewMode($location.$$url);
          $scope.$on('$locationChangeStart', function($event, next, current) {
            setPreviewMode(next);
          });
        }

        function logout() {
            AuthService.logout();
        }

        function displayNavigation() {
            $scope.showNavigation = !$scope.showNavigation;
            PanesFactory.notifyEvent(listenerNames.DISPLAY_NAVIGATION, $scope.showNavigation);
        }
    }

    HeaderController.$inject = ['$scope', '$location', 'UtilFactory', 'SocketService', 'PanesFactory','AuthService', 'LISTENER_NAMES'];
    angular.module('app').controller('HeaderController', HeaderController);

})();
