(function() {
    'use strict';
    
    angular.module('dlvwc.timeline.directives').directive('tlDateAndTime', tlDateAndTime);
    
    tlDateAndTime.$inject = ["PanesFactory", "LISTENER_NAMES", "CAMERA_MODES", "ngDialog", "SettingFactory"];
    
    function tlDateAndTime(PanesFactory, listenerNames, cameraModes, ngDialog, SettingFactory) {
        return {
            scope: {},
            templateUrl: "common/directives/timeline/date-and-time/date-and-time.html",
            controller: ctrlFn
        };
        
        function ctrlFn($scope) {
            var mode;
            
            $scope.$watch(function() {
                var key = PanesFactory.getActiveSplitsIndex() + '-' + PanesFactory.getActivePaneIndex();
                return PanesFactory.getPlayheadTimestamp(key);
            }, watchTimeStamp);
            
            $scope.editTimeToggle = false;
            $scope.editDateAndTime = editDateAndTime;
            
            PanesFactory.subscribeEvent($scope, listenerNames.EDIT_TIME, subscribeEditTime);
            PanesFactory.subscribeEvent($scope, listenerNames.EDIT_TIME_TOGGLE, subscribeEditTimeToggle);
            PanesFactory.subscribeEvent($scope, listenerNames.KEYBOARD_EDIT_DATE_AND_TIME, subscribeKeyboardEditTime);
            
            /* --------------------------- FUNCTION DETAIL ------------------------- */
            
            function subscribeEditTimeToggle() {
                $scope.editTimeToggle = !$scope.editTimeToggle;
            }

            function subscribeKeyboardEditTime() {
                if ($scope.editTimeToggle) {return;}
                editDateAndTime();
            }

            function subscribeEditTime(event, data, _mode) {
                if(data) {
                    mode = _mode;
                    $scope.time = new Date(data);
                    PanesFactory.setActivePaneMode(mode);
                }
            }
            
            function editDateAndTime() {
                var dialog = ngDialog.open({
                    template: 'common/dialog/edit-time-dialog.html',
                    className: 'ngdialog-theme-default custom_ngDialog',
                    closeByDocument: true,
                    closeByEscape: true,
                    showClose: true,
                    scope: $scope,
                    data: $scope.data,
                    controller: dialogCtrl
                }).closePromise.then(function() {
                    SettingFactory.keyboardToggle();
                    PanesFactory.notifyEvent(listenerNames.EDIT_TIME_TOGGLE, $scope.timePicker, mode);
                });
                
                function dialogCtrl($scope) {
                    SettingFactory.keyboardToggle();
                    PanesFactory.notifyEvent(listenerNames.EDIT_TIME_TOGGLE, $scope.timePicker, mode);
                    $scope.selectTime = selectTime;
                    
                    /* ------------------------ FUNCTION DETAIL ----------------------- */
                   
                    function selectTime() {
                        if(!$scope.timePicker || $scope.timePicker === '') {
                            return;
                        }
                        mode = cameraModes.REPLAY;
                        PanesFactory.notifyEvent(listenerNames.EDIT_TIME, $scope.timePicker, mode);
                        ngDialog.close();
                    }
                    
                }
            }
            
            function watchTimeStamp(newValue) {
                $scope.time = newValue;
            }
        }
    }
    
})();