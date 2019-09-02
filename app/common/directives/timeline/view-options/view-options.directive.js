(function() {
    "use strict";
    
    angular.module('dlvwc.timeline.directives').directive("tlViewOptions", tlViewOptions);
    
    tlViewOptions.$inject = ["PanesFactory", "LISTENER_NAMES"];
    
    function tlViewOptions(PanesFactory, listenerNames) {
        return {
            scope: false,
            templateUrl: "common/directives/timeline/view-options/view-options.html",
            link: linkFn
        };
                
        function linkFn(scope, element, attrs) {
            
            scope.isShowFlyout = false;
            scope.displayOptionsFlyout = displayOptionsFlyout;
            scope.displayOptionSetting = displayOptionSetting;
            scope.zoomCamera = zoomCamera;
            
            scope.$watch(function() { return PanesFactory.getActivePaneIndex(); }, watchActivePaneIndex);
            
            /* -------------------- FUNCTION DETAIL -------------------- */

            function watchActivePaneIndex() {
                scope.isShowFlyout = false;
            }
            
            function displayOptionsFlyout() {
                scope.isShowFlyout = !scope.isShowFlyout;
                if(scope.isShowFlyout) {
                    PanesFactory.notifyEvent(listenerNames.SHOW_OPTIONS_FLYOUT);
                }
            }

            function displayOptionSetting() {
                PanesFactory.notifyEvent(listenerNames.SHOW_OPTIONS_SETTING_KEYBOARD);
            }

            function zoomCamera(zoomValue) {
                PanesFactory.notifyEvent(listenerNames.ZOOM_CAMERA, zoomValue);
            }
        }
    }
})();