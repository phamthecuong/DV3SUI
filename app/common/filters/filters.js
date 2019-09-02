(function(){

    function myUppercase(){
        return function(s, type){
            if (type != 'double')
                return s.toUpperCase();
            else
                return (s+s).toUpperCase();
        };
    }
    
    function propsFilter() {
        return function(items, props) {
            var out = [];
        
            if (angular.isArray(items)) {
                var keys = Object.keys(props);
        
                items.forEach(function(item) {
                    var itemMatches = false;
            
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                        }
                    }
                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                out = items;
            }
            return out;
        };
    }
    
    function secondToTime(){
        return function(s) {
            return (new Date(s * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
        };
    }

    angular.module('app')
    .filter('myuppercase', myUppercase)
    .filter('propsFilter', propsFilter)
    .filter('secondToTime', secondToTime);
    
})();



