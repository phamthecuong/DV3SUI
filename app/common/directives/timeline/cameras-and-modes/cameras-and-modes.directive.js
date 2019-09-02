(function() {
    "use strict";
    
    angular.module('dlvwc.timeline.directives').directive("tlCamerasAndModes", tlCamerasAndModes);
    
    tlCamerasAndModes.$inject = ["PanesFactory", "UiElements", "LISTENER_NAMES", "$timeout", "CAMERA_MODES", "ACTIONS"];
    
    function tlCamerasAndModes(PanesFactory, UiElements, listenerNames, $timeout, cameraModes, actions) {
        return {
            scope: false,
            templateUrl: "common/directives/timeline/cameras-and-modes/cameras-and-modes.html",
            controller: ctrlFn,
            link: linkFn
        };
        
        function ctrlFn($scope) {
            
            $scope.dropdownSplitsScrollbarsOptions = UiElements.dropdownScrollbarsOptions();
            
            /* ------------------------- HANDLE EVENT -------------------------- */
            
            $scope.changePane = changePane;
            $scope.switchMode = switchMode;
            $scope.$watch(function() { return PanesFactory.getActiveSplit(); }, watchActiveSplit);
            $scope.$watch(function() { return PanesFactory.getActivePaneIndex(); }, watchActivePaneIndex);
            
            PanesFactory.subscribeEvent($scope, listenerNames.KEYBOARD_SWITCH_MODE, subscribeHandleKeyBoard);
           
            /* ----------------------- FUNCTION DETAIL ------------------------- */
            
            function subscribeHandleKeyBoard(event, data) {
                console.log("event handle key board", data);
                switchMode(data);
            }

            function changePane(index) {
                PanesFactory.setActivePaneIndex(index);
            }
            
            function switchMode(mode) {
                PanesFactory.notifyEvent(listenerNames.SWITCH_MODE, mode);
            }
            
            function watchActiveSplit(split) {
                $scope.splits = split;
            }
            
            function watchActivePaneIndex(index) {
                $scope.activePaneIndex = index;
                var activePaneObj = PanesFactory.getActivePaneObj();
                if(activePaneObj === null || !activePaneObj) { return; }
                $scope.activePaneObj = activePaneObj;
            }
            
        }
        
        function linkFn(scope, element, attrs) {
            $('.dropdown-options-container.split-options').on(listenerNames.MOUSE_LEAVE, function() {
                $timeout(function() {
                    scope.showSplits = false;
                })
            });
        }
    }
})();