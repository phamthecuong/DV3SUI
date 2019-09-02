let currentPerson, currentPersonPermissions, preferedLanguage;

angular.element(document).ready(function() {
    //angular.bootstrap(document, ["app"]);
   $.get("/auth/rest/persons/currentPerson", function (data) {
     currentPerson = data;
     // get prefered language
     $.get("/auth/rest/persons/" + currentPerson.id + "/settings").then(
       function success(response) {
         preferedLanguage = response.personSettings.language;
         angular.bootstrap(document, ["app"]);
       }, function error(response) {
         preferedLanguage = "";
       }
     );
   }).fail(function (response) {
     // if backend is not authorized, delete session cookie and trigger re-login with membrane
     if (response.status === 401) {
       document.cookie = "SESSION_ID_CLIENT=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=";
       location.reload(true);
     } else {
       alert("Failed executing auth/rest/persons/currentPerson error:" +
         response.status);
     }
   });
});

(function(){
    'use strict';

    angular.module('app', [
        'pascalprecht.translate',
        'tmh.dynamicLocale',
        'ui.bootstrap',
        'ui.router',
        'leaflet-directive',
        'dlvwc.videoPanes.directives',
        'dlvwc.panelCameras.directives',
        'dlvwc.timeline.directives',
        'dlvwc.api.factory',
        'dlvwc.semsy.api.factory',
        'dlvwc.global.factory',
        'ngScrollable',
        'ngStorage',
        'angular.filter',
        'ngCookies',
        'ngResource',
        'base64',
        'angular-loading-bar',
        'webcam',
        'ui.select',
        'ui.bootstrap.datetimepicker',
        'ngSanitize',
        'ngTouch',
        'ngRedux',
        'ngDialog',
        'moment-picker',
        'ng-mfb',
        'dlmap',
        'ui-notification'
    ])

    /* ------------------- DEFINE MODULE ----------------- */

    angular.module('dlvwc.semsy.api.factory',[]);
    angular.module('dlvwc.stomp.factory',[]);
    angular.module('dlvwc.api.factory',[]);
    angular.module('dlvwc.global.factory',[]);
    angular.module('dlvwc.timeline.directives', []);
    angular.module('dlvwc.videoPanes.directives',[]);
    angular.module('dlvwc.panelCameras.directives',[]);

})();
