angular.module('dlvwc.stomp.factory')

.factory('MessageBrokerFactory', [ 'URLS', '$rootScope', '$q', 'ngstomp', function ( URLS, $rootScope, $q, ngstomp ) {
    
    var origin = window.location.origin;
    
    var stompUrl = URLS.Stomp;
    
    var topics = {};
    
/* ------------------------------------------------------------------------ */
    
    var subscribe = function (topic, id, cb) {
//        topics[id] = ngstomp.subscribeTo(topic).callback(cb).connect();
        
        console.log('--- new stomp subscription: '+topic);
        
        topics[id] = ngstomp.subscribeTo(topic);
        topics[id].withBodyInJson();
        topics[id].callback(cb);
        topics[id].connect();
        console.info('--- stomp obj ---');
        console.log(topics[id]);
    };
    
    var unsubscribe = function (topic, id) {
        topics[id].unSubscribeOf(topic);
        delete topics[id];
    };
    
    var getTopics = function () {};
    
    var on = function (topic) {};
        
/* ------------------------------------------------------------------------ */
    
    this.subscribe      = subscribe;
    this.unsubscribe    = unsubscribe;
    this.getTopics      = getTopics;
    this.on             = on;
    
    return this;
    
    /*
    var socket;
    var socketEstablished = false;
    return {
        connected: false, 
        establish: function ( type ) {
            
            console.log('establish socket connection');
            console.info('$window properties');
            console.log(window);
//            var screen = {
//                $window.screen
//            };
//            var _screen = $window.screen;
//            var screen = angular.toJson(_screen);
//            angular.forEach( $window.screen, function ( value, prop ) {
//                console.log(prop+': '+value);
//            });
            var win = angular.toJson({
                width: window.innerWidth, 
                height: window.innerHeight
            });
            console.log(win);
            var screen = angular.toJson({
                width: window.screen.width, 
                height: window.screen.height
            });
            console.log(screen);
            var handshakeQuery =    'type='+type+
                                    '&screenWidth='+window.screen.width+
                                    '&screenHeight='+window.screen.height+
                                    '&windowWidth='+window.innerWidth+
                                    '&windowHeight='+window.innerHeight;
//            socket = io.connect(SOCKET_IO.NAMESPACE, { query: handshakeQuery, forceNew: true } );
            socket = io.connect('/ddcm', { query: handshakeQuery, forceNew: true } );
//            socketEstablished = true;
        },
        disconnect: function () {
//            socketEstablished = false;
            socket.disconnect();
        },
//        setStatus: function ( status ) {
//            socketEstablished = status;
//        }, 
//        getStatus: function ()  {
//            return socketEstablished;
//        },
        on: function (eventName, callback) {
            socket.on(eventName, function () {  
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
    */
    
}]);



