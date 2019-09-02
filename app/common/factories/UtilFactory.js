(function() {
    'use strict';
    
    function UtilFactory(eventTypes, cameraFilterOptions, urls) {
        var playerTest;
        var signalingUrl;
        var originUrl;
        var IPLocal = null;

        var service = {
            getIcon             : getIcon,
            getEventTimelineIcon: getEventTimelineIcon,
            createFlowPlayer    : createFlowPlayer,
            getPlayer           : getPlayer,
            getFlyoutOptionIcon : getFlyoutOptionIcon,
            getDeviceInfo       : getDeviceInfo,
            getSignalingUrl     : getSignalingUrl,
            setSignalingUrl     : setSignalingUrl,
            getOriginUrl        : getOriginUrl,
            setOriginUrl        : setOriginUrl
        };
        
        return service;
        
        function getPlayer() {
            return playerTest;
        }

        function getIcon(value){
            switch(true){
                case (value == 'application/pdf'): return 'icons8-pdf';
                case (value.indexOf('image') > -1): return 'icons8-camera'; 
                case (value.indexOf('video') > -1): return 'icons8-film'; 
                case (value.indexOf('audio') > -1): return 'icons8-audio-file'; 
                default: return 'icons8-info';
            }
        }
        
        function getEventTimelineIcon(value) {
            switch(true) {
                case(value === eventTypes.EVENT_COMMENT):
                    return 'fa-comment';
                case(value === eventTypes.EVENT_SNAPSHOT):
                case(value === eventTypes.EVENT_IMAGE):
                    return 'fa-camera';
                case(value === eventTypes.EVENT_VIDEO):
                    return 'fa-film';
                case(value === eventTypes.EVENT_CALL):
                    return 'fa-phone';
                default: return 'fa-comment';
            }
        }
        
        function getFlyoutOptionIcon(value) {
            switch(true) {
                case(value === cameraFilterOptions.BRIGHTNESS):
                    return 'fa fa-sun-o';
                case(value === cameraFilterOptions.CONTRAST):
                    return 'fa fa-adjust';
                case(value === cameraFilterOptions.SATURATION):
                    return 'fa fa-tint';
                default:
                    return 'fa fa-sun-o';
            }
        }
        
        function createFlowPlayer(streamUri, videoId) {
            playerTest = $f( videoId , {
                src: 'js/flowplayer/flowplayer-3.2.18.swf',
                wmode: 'opaque'
            }, {
                clip: {
                    url: streamUri,
                    live: true,
                    scaling: 'fit',
                    // configure clip to use hddn as our provider, referring to our rtmp plugin
                    provider: 'hddn', 
                },
                // streaming plugins are configured under the plugins node
                plugins: {
                    controls: null, //disable controlbar
                    // here is our rtmp plugin configuration
                    hddn: {
                        url: 'js/flowplayer/flowplayer.rtmp/flowplayer.rtmp-3.2.13.swf',
                        autoplay: true, 
                        // netConnectionUrl defines where the streams are found
                        netConnectionUrl: streamUri
                    }
                },
                canvas: {
                    backgroundGradient: 'none'
                }
            });
            
            return playerTest;
        }
        
        function getDeviceInfo() {
            var info = navigator.userAgent;
            return info;
        }
        
        function getSignalingUrl() {
            return signalingUrl;
        }
        
        function setSignalingUrl(newValue) {
            signalingUrl = newValue;
        }
        
        function getOriginUrl() {
            return originUrl;
        }
        
        function setOriginUrl(newValue) {
            originUrl = newValue;
        }
    }
    
    
    UtilFactory.$inject = ["EVENT_TYPES", "CAMERA_FILTER_OPTIONS", "URLS"];    
    angular.module('app').factory('UtilFactory', UtilFactory);
})();