(function () {
    'use strict';

    function playbackToolbar(PanesFactory, listenerNames, cameraModes, ApiFactory, actions) {
        return {
            restrict: 'EA',
            templateUrl: 'common/directives/playbackToolbar/playbackToolbar.html',
            link: linkFn
        };
       
        function linkFn(scope, element, attrs) {
            var player = null;
            var preState = actions.PAUSE;
            var activeMode = cameraModes.REPLAY;

            scope.viewName = attrs.viewName;
            scope.playBackState = actions.PAUSE;

            /* ---------------- HANDLE EVENT ------------------ */
            
            scope.playBackAction = playBackAction;
            
            scope.$watch( function () { return PanesFactory.getActiveState(); }, watchActiveState);
            
            PanesFactory.subscribeEvent(scope, listenerNames.PLAY_BACK_ACTION, subcribePlayBackAction);
            PanesFactory.subscribeEvent(scope, listenerNames.KEYBOARD_ACTION, subcribePlayBackAction);
            
            /* --------------- FUNCTION DETAIL ---------------- */

            function subcribePlayBackAction(event, action) {
                playBackAction(action);
            }
            
            function playBackAction ( action ) {
                //console.log("action", action);
                var activePaneObj = PanesFactory.getActivePaneObj();
                var sessionId = activePaneObj[activeMode].sessionId;
                var paneId = activePaneObj[activeMode].paneId;
                var activeState = activePaneObj.state;
                var cameraType = activePaneObj.cameraType;
                
                scope.playBackState = action;
              
                if(angular.isUndefined(action)) {
                    if(activeState === actions.PLAY) {
                        action = actions.PAUSE;
                        preState = actions.PAUSE;
                    } else if (activeState === actions.PAUSE) {
                        action = actions.PLAY;
                        preState = actions.PLAY;
                    } else {
                        action = preState;
                    }
                }
                PanesFactory.setActiveState(action);

                ApiFactory
                    .playbackAction ( sessionId, paneId, cameraType, action, activeMode )
                    .then ( function ( res ) {
                        var videoId = PanesFactory.getActivePaneObj().videoId;
                        PanesFactory.notifyEvent(listenerNames.ACTION_STREAM, videoId, action);
                    }, function ( err ) {
                    });
            }
            
            function watchActiveState ( newValue ) {
                scope.playBackState = newValue;
            }
        }
    }
    
    playbackToolbar.$inject = ["PanesFactory", "LISTENER_NAMES", "CAMERA_MODES", "ApiFactory", "ACTIONS"];
    angular.module('app').directive('playbackToolbar', playbackToolbar);
})();
