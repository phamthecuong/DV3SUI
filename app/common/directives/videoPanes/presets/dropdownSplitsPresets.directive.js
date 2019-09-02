(function() {
    'use strict';
    
    angular.module('dlvwc.videoPanes.directives').directive('dropdownSplitsPresets', dropdownSplitsPresets);
    
    function dropdownSplitsPresets() {
        return {
            scope: false,
            templateUrl: 'common/directives/videoPanes/presets/dropdownSplitsPresets.html'
        };
    }
})();