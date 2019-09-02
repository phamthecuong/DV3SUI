(function() {
    "use strict";
    
    angular.module('dlvwc.timeline.directives').directive("tlCameras", tlCameras);
    
    tlCameras.$inject = ["PanesFactory", "LISTENER_NAMES"];
    
    function tlCameras(PanesFactory, listenerNames) {
        return {
            scope: false,
            templateUrl: "common/directives/timeline/cameras/cameras.html",
            controller: ctrlFn
        };
        
        function ctrlFn($scope) {
            
            /* -------------------------- HANDLE EVENT ------------------------ */
            
            $scope.next = next;
            $scope.back = back;
            
            $scope.$watch(function() { return PanesFactory.getActivePaneIndex(); }, watchActivePaneIndex);
            $scope.$watch(function() { return PanesFactory.getCameraList(); }, watchCameraList);
            
            PanesFactory.subscribeEvent($scope, listenerNames.OPEN_CAMERA_SELECT, subscribeOpenCameraSelect);
            
            /* ------------------------ FUNCTION DETAIL ------------------------ */
            
            function subscribeOpenCameraSelect(event, data, mode) {
                angular.element(document).ready(function() {
                    $scope.activeCameraIndex = ($scope.camList).map(function(item) { return item.channelId; }).indexOf(data.channelObj.channelId);
                    scrollToActiveChannel($scope.activeCameraIndex);
                })
            }
            
            function watchCameraList(list) {
                $scope.camList = list;
            }
            
            function watchActivePaneIndex(index) {
                var activePaneObj = PanesFactory.getActivePaneObj();
                if(activePaneObj === null || !activePaneObj.data) { return; }
                $scope.activeCameraIndex = ($scope.camList).map(function(item) { return item.channelId; }).indexOf(activePaneObj.data.channelId);
                scrollToActiveChannel($scope.activeCameraIndex);
            }
            
            function next() {
                if($scope.activeCameraIndex === -1 || $scope.activeCameraIndex >= $scope.camList.length - 1) {
                    return;
                }
                $scope.activeCameraIndex++;
                PanesFactory.removeActiveSessionId();
                PanesFactory.notifyEvent(listenerNames.OPEN_CAMERA_SELECT, {channelObj: $scope.camList[$scope.activeCameraIndex]});
            }
            
            function back() {
                if($scope.activeCameraIndex <= 0) {
                    return;
                }
                $scope.activeCameraIndex--;
                PanesFactory.removeActiveSessionId();
                PanesFactory.notifyEvent(listenerNames.OPEN_CAMERA_SELECT, {channelObj: $scope.camList[$scope.activeCameraIndex]});
            }
            
            function scrollToActiveChannel(pos) {
                var container = document.getElementsByClassName('pcam')[0];
                container.scrollLeft = 30 * pos - 30;
            }
        }
    }
})();