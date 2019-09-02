(function(){
    'use strict';
    angular.module('app').component('surveillanceSearch', {
        templateUrl: 'common/components/search/surveillanceSearch.html',
        controller: surveillanceSearchController
    });
    
    surveillanceSearchController.$inject = ['FILTER_TYPES', 'PanesFactory', '$scope', 'LISTENER_NAMES']
    
    function surveillanceSearchController(FILTER_TYPES, PanesFactory, $scope, listenerNames){
        var vm = this;
        var surveillanceSearch = angular.element(document.querySelector('.surveillance-search'))
        
        vm.filterTypes = FILTER_TYPES;
        
        PanesFactory.subscribeEvent($scope, listenerNames.DISPLAY_SURVEILLANCE_SEARCH, subscribeDisplaySurveillanceSearch);
        
        /* -------------------- FUNCTIONS DETAIL -------------------- */
        
        function subscribeDisplaySurveillanceSearch(event, showSurveillanceSearch) {
            var marginLeft;
            if(showSurveillanceSearch) {
                marginLeft = 0;
            } else {
                marginLeft = -250;
            }
            surveillanceSearch.css({'margin-left': marginLeft + 'px'});
        }
    }
})();