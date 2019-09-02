(function () {
    'use strict';

    function flyoutOptions(PanesFactory, listenerNames, UtilFactory, cameraFilterOptions, $translate) {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {},
            templateUrl: 'common/directives/flyout/flyout-options.html',
            link: linkFn
        };
       
        function linkFn( scope, element, attrs) {
            
            var videoId = -1;
            var videoEl;
            
            scope.data = [
                {
                    name: $translate.instant(cameraFilterOptions.BRIGHTNESS),
                    value: 100
                },
                {
                    name: $translate.instant(cameraFilterOptions.CONTRAST),
                    value: 100
                },
                {
                    name: $translate.instant(cameraFilterOptions.SATURATION),
                    value: 100
                }
            ]
            
            scope.resetOption = resetOption;
            scope.updateOption = updateOption;
            scope.getItemIcon = getItemIcon;
            
            PanesFactory.subscribeEvent(scope, listenerNames.SHOW_OPTIONS_FLYOUT, updateVideoId);
            
            /* -------------------- FUNCTION DETAIL -------------------- */
            
            function updateVideoId() {
                var activePaneObj = PanesFactory.getActivePaneObj();
                
                videoId = activePaneObj.videoId;
                scope.data[0].value = activePaneObj.filter.brightness;
                scope.data[1].value = activePaneObj.filter.contrast;
                scope.data[2].value = activePaneObj.filter.saturation;
                
                videoEl = angular.element('#' + videoId);
            }
            
            function resetOption(optionName) {
                switch (true) {
                    case (optionName === cameraFilterOptions.BRIGHTNESS):
                        scope.data[0].value = 100;
                        break;
                    case (optionName === cameraFilterOptions.CONTRAST):
                        scope.data[1].value = 100;
                        break;
                    case (optionName === cameraFilterOptions.SATURATION):
                        scope.data[2].value = 100;
                        break;
                }
                videoEl.css('filter', getFilter());
                PanesFactory.setActiveCameraFilter(optionName, 100);
            }
            
            function updateOption(optionName) {
                if(videoId < 0) { return; }
                var updateValue;
                switch (true) {
                    case (optionName === cameraFilterOptions.BRIGHTNESS):
                        updateValue = scope.data[0].value;
                        break;
                    case (optionName === cameraFilterOptions.CONTRAST):
                        updateValue = scope.data[1].value;
                        break;
                    case (optionName === cameraFilterOptions.SATURATION):
                        updateValue = scope.data[2].value;
                        break;
                }
                videoEl.css('filter', getFilter());
                PanesFactory.setActiveCameraFilter(optionName, updateValue);
            }
            
            function getItemIcon(optionName) {
                return UtilFactory.getFlyoutOptionIcon(optionName);
            }
            
            function getFilter() {
                var filter = scope.data[0].name + '(' + scope.data[0].value + '%) ' + scope.data[1].name + '(' + scope.data[1].value + '%) ' + 'saturate(' + scope.data[2].value + '%)';
                return filter;
            }
        }
    }
    
    flyoutOptions.$inject = ["PanesFactory", "LISTENER_NAMES", "UtilFactory", "CAMERA_FILTER_OPTIONS", "$translate"];
    angular.module('app').directive('flyoutOptions', flyoutOptions);
})();
