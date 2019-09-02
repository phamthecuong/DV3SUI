(function(){
   
    'use strict';
    angular.module('app').component('filterTimeVideopanes', {
        bindings: {
            label: '<',
            dcontent: '@'
        },
        require: {
            filterItemCtrl: '^filterItem'
        },
        templateUrl: 'common/components/filter/filter-time.html',
        controller: FilterTimeControler
        
    });
    
    FilterTimeControler.$inject = ["$scope", "EventFactory", "PanesFactory", "LISTENER_NAMES"];

    function FilterTimeControler($scope, EventFactory, PanesFactory, listenerNames){
        var vm = this;
        var values = {};
        
        vm.startDate = null;
        vm.endDate = null;
        vm.isOpens = [false, false];
        vm.dataPost = EventFactory.getDataPost();
        vm.$onInit = function(){
            vm.filterItemCtrl.setFilter(vm);
        };
        
        vm.openCalendar = openCalendar;
        
        $scope.$watchCollection(function() { return vm.isOpens; }, watchIsOpens);
        
        /* ------------------------ FUNCTION DETAIL --------------------- */
        
        function watchIsOpens(newVal, oldVal) {
            var idx = newVal.map(function(item) { return item; }).indexOf(true);
            if(idx === -1) {
                onSelectDate();
            }
        }
        
        function openCalendar(event, idx) {
            event.preventDefault();
            event.stopPropagation();
            vm.isOpens[idx] = true;
        }

        function onSelectDate(){
            var start = (new Date(vm.startDate)).getTime();
            var end = (new Date(vm.endDate)).getTime();
            
            if(start > 0 || end > 0) {
                values.start = start;
                values.end = end;
                
                var index = vm.dataPost.criterias.map(function(item) { return item.property; }).indexOf('timeStampMillis');
                
                if(index !== -1) {
                    vm.dataPost.criterias[index].values = values;
                } else {
                    vm.dataPost.criterias.push (
                        {
                            "property":"timeStampMillis",
                            "values": values
                        }
                    );
                }
                EventFactory.getParams().page = 0;
            } else {
                vm.dataPost.criterias =[];
            }
            
            PanesFactory.setEventTimeFilter(vm.dataPost.criterias);
            PanesFactory.notifyEvent(listenerNames.EVENT_TIME_FILTER, vm.dataPost.criterias);    
        }
    }
})();


