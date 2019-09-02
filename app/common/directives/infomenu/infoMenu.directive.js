(function () {
  'use strict';

  function infoMenu(PanesFactory, listenerNames) {
    return {
      restrict: 'EA',
      templateUrl: 'common/directives/infomenu/infoMenu.html',
      link: linkFn
    };

    function linkFn(scope, element, attrs) {
      scope.statsInfo = {};
      scope.feVersion = null;
      scope.beVersion = null;
      scope.showDetail = true;
      scope.showStreamStatsLoader = true;
      scope.handleClose = handleClose;

      PanesFactory.subscribeEvent(scope, listenerNames.SHOW_MENU_INFO, subscribeDisplayMenuInfo);

      function handleClose() {
        PanesFactory.notifyEvent(listenerNames.CANCEL_STREAM_STATS, {});
        scope.showStreamStatsLoader = true;
        scope.statsInfo = {};
        scope.feVersion = null;
        scope.beVersion = null;
      }

      function subscribeDisplayMenuInfo(event, data) {
        if(!angular.equals(data, {})) {
          console.log(data);
          scope.feVersion = data.feVersion;
          scope.beVersion = data.beVersion;
          scope.statsInfo[data.streamName + '-' + data.cameraName] = data;
          scope.showStreamStatsLoader = false;
        }

      }

    }
  }

  infoMenu.$inject = ["PanesFactory", "LISTENER_NAMES"];
  angular.module('app').directive('infoMenu', infoMenu);
})();
