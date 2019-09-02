(function() {
    "use strict";
    
    angular.module('dlvwc.timeline.directives').directive("tlCameraControlWheel", tlCameraControlWheel);
    
    tlCameraControlWheel.$inject = ["PanesFactory", "ApiFactory", "ngDialog", "LISTENER_NAMES", "$filter"];
    
    function tlCameraControlWheel(PanesFactory, ApiFactory, ngDialog, listenerNames,$filter) {
        return {
            scope: false,
            templateUrl: "common/directives/timeline/camera-control-wheel/camera-control-wheel.html",
            link: linkFn
        };
        
        function linkFn(scope, element, attrs) {

            var el = $(element);
            var activePaneObj;
            var sessionId;
            var paneId;
            var moveCameraData = {
                speed: {
                    x: 0,
                    y: 0,
                    z: 0,
                    iris: 0,
                    focus: 0
                },
                time: 1000
            };
            
            scope.cameraMove = cameraMove;

            PanesFactory.subscribeEvent(scope, listenerNames.ZOOM_CAMERA, subscribeZoomCamera);
            PanesFactory.subscribeEvent(scope, listenerNames.CAMERA_MOVE, subscribCameraMove);

            
            /* -------------------- FUNCTION DETAIL -------------------- */

            function subscribCameraMove(event, data) {
                cameraMove(data.x, data.y, data.z);
            }

            function subscribeZoomCamera(event, zoomValue) {
                cameraMove(0, 0, zoomValue);
            }

            function updateActivePaneObj() {
                activePaneObj = PanesFactory.getActivePaneObj();
                sessionId = activePaneObj.live.sessionId;
                paneId = activePaneObj.live.paneId;
            }
            
            function cameraMove(dx, dy, dz) {
                moveCameraData.speed.x = dx;
                moveCameraData.speed.y = dy;
                moveCameraData.speed.z = dz;

                updateActivePaneObj();
                ApiFactory
                    .cameraMoveBy(sessionId, paneId, moveCameraData)
                    .then(function(res) {
                        console.log("Test success cameraMoveBy res = " + angular.toJson(res));
                    }, function(err) {
                        console.log("Test failed cameraMoveBy err = " + angular.toJson(err));
                    })
            }
        }
    }
})();