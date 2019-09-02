(function(){
    angular.module('app').component('filterItem', {
        controller: FilterItemControler,
        transclude: true,
        templateUrl: 'common/components/filter/filter-item.html'
    });

    function FilterItemControler($element){
        var vm = this;
        var el = 'ui-select-container';
        
        vm.showPane = false;

        vm.setFilter = setFilter;
        vm.togglePane = togglePane;
        
        /* ----------------------------- FUNCTION DETAIL ---------------------------- */
        
        function setFilter(filter){
            vm.filter = filter;
            if (vm.filter.dcontent != undefined) el = vm.filter.dcontent;
        }

        function togglePane(){
            vm.showPane = !vm.showPane;
            
            var p = $element.find('.tpane')[0];
            if (!p.classList.contains('tshow')){
                p.style.height = parseInt(p.getElementsByClassName(el)[0].getBoundingClientRect().height + 10) + 'px';
                setTimeout(function(){
                    p.style.height = 'fit-content';
                    p.classList.toggle('tshow');
                }, 300);
            } else {
                p.style.height = parseInt(p.getElementsByClassName(el)[0].getBoundingClientRect().height + 10) + 'px';
                setTimeout(function(){
                    p.style.height = '0px';
                    p.classList.toggle('tshow');
                });
            }   
        }
    }
})();



    