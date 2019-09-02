(function() {
    "use strict";

    angular.module('dlvwc.timeline.directives').directive("tlCameraPresets", tlCameraPresets);

    tlCameraPresets.$inject = ["PanesFactory", "ApiFactory", "LISTENER_NAMES"];

    function tlCameraPresets(PanesFactory, ApiFactory, listenerNames) {
        return {
            scope: false,
            templateUrl: "common/directives/timeline/camera-presets/camera-presets.html",
            controller: ctrlFn
        };

        function ctrlFn($scope) {
            var activePaneObj;
            var sessionId;
            var paneId;
            $scope.applyPreset = applyPreset;
            //$scope.listPresets = ApiFactory.getListPresets();

            /* ------------------------- HANDLE EVENT ----------------------- */

            PanesFactory.subscribeEvent($scope, listenerNames.OPEN_CAMERA_SELECT, subscribeOpenCameraSelect);

            /* ----------------------- FUNCTION DETAIL ---------------------- */

            function updateActivePaneObj() {
              activePaneObj = PanesFactory.getActivePaneObj();
              sessionId = activePaneObj.live.sessionId;
              paneId = activePaneObj.live.paneId;
            }

            function applyPreset(number) {
              updateActivePaneObj();
              console.log("Preset number: " + number);
              ApiFactory.applyPreset(sessionId, paneId, number).then(function(res) {
                console.log("Test success preset " + angular.toJson(res));
              }, function(err) {
                console.log("Test failed preset " + angular.toJson(err));
              });
            }

            function subscribeOpenCameraSelect(event, data, mode) {
                angular.element(document).ready(function() {
                    $scope.camList = PanesFactory.getCameraList();
                    $scope.camList1 = [];
                    for(var i = 0; i < 10; i++) {
                        $scope.camList1.push($scope.camList[i]);
                    }
                })
            }
        }
    }
})();
