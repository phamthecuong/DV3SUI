(function(){
    
    'use strict';
    angular.module('app').component('filterTagVideopanes', {
        bindings: {
            label: '<'
        },
        require: {
            filterItemCtrl: '^filterItem'
        },
        
        controller: FilterTagControler,
        templateUrl: 'common/components/filter/filter-tag.html'
    });
    
    FilterTagControler.$inject = ["EventFactory", "SharedFactory", "PanesFactory", "LISTENER_NAMES", "EVENT_TYPES"];

    function FilterTagControler(EventFactory, SharedFactory, PanesFactory, listenerNames, eventTypes){
        var vm = this;
        
        vm.dataPost = EventFactory.getDataPost();
        vm.isSelected = [];
        
        vm.eventTypes = [eventTypes.EVENT_COMMENT, eventTypes.EVENT_IMAGE, eventTypes.EVENT_VIDEO, eventTypes.EVENT_CALL];
        vm.$onInit = function(){
            vm.filterItemCtrl.setFilter(vm);
        };
        
        vm.select = function(index) {
            vm.isSelected[index] = !vm.isSelected[index];
            vm.dataPost.type = [];
            
            for (var i = 0; i<vm.isSelected.length; i++) {
                if(vm.isSelected[i]) {
                    vm.dataPost.type.push(vm.eventTypes[i]);
                }
            }
            
            PanesFactory.setEventTypeFilter(vm.dataPost.type);
            PanesFactory.notifyEvent(listenerNames.EVENT_TYPE_FILTER);
        };
    } 
})();