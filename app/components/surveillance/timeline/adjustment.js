(function(){

    'use strict'

    angular.module('dlvwc.timeline.directives').component('adjustment', {
        bindings:{
            iconIncre: '@',
            iconType: '@',
            iconDec: '@',
            value: '=',
            change: '&'
        },
        templateUrl: 'components/surveillance/timeline/adjustment.html',
        controller: controller
    });

    controller.$inject = ["UtilFactory", "PanesFactory", "LISTENER_NAMES"];

    function controller(UtilFactory, PanesFactory, listenerNames){

        var vm = this;

        vm.decrement = function(){
            if (vm.value < 20) return;
            vm.value--;
            vm.change({$event: {value: (vm.value - 20)/80}});

            PanesFactory.notifyEvent(listenerNames.CONTROL_AUDIO, (vm.value - 20));
        }

        vm.increment = function(){
            if (vm.value > 100) return;
            vm.value++;
            vm.change({$event: {value: (vm.value - 20)/100}});

            PanesFactory.notifyEvent(listenerNames.CONTROL_AUDIO, (vm.value - 20));
        }

        vm.selectPoint = function(){}

        vm.dragOptions = {
            start: function() {
                console.log("STARTING");
            },
            drag: function() {
                console.log("DRAGGING");
            },
            stop: function() {
                console.log("STOPPING");
            },
            container: 'container'
        }
    }

})();
