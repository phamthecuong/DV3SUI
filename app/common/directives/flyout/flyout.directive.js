(function () {
    'use strict';

    function flyoutCustom(PanesFactory, listenerNames, eventTypes, UtilFactory, cameraModes, actions) {
        return {
            restrict: 'EA',
            scope: {},
            templateUrl: 'common/directives/flyout/flyout.html',
            link: linkFn,
            controller: ctrlFn
        };
        
        function ctrlFn($scope) {
            $scope.isShowFlyout = false;
        }
       
        function linkFn( scope, element, attrs) {
            var el = $(element);
            var flyout = el.find('.flyout');
            var videoRectangleLength = el.find('.video-rectangle-length');
            
            var gripperStart = el.find('.gripper-start');

            var gripperEnd = el.find('.gripper-end');
            var flyoutWidth = flyout.width();
            var videoRectangleWidth;
            var timelineRange = PanesFactory.getTimelineRange();
            var videoLengthUnit;
            var postionGriperStart = 0;
            var postionGriperEnd;
            var width;
            var space = 2.5;
            var gripperDragOptions = {
                axis: 'x',
                start: gripperDragStart,
                stop: gripperDragStop
            }
            var widthPresentTimeLine  = PanesFactory.getWidthTimeLine();
            var videoLocal = true;
            
            updateVideoLengthUnit(timelineRange.value, timelineRange.subticks);
            
            gripperStart.draggable(gripperDragOptions);
            gripperEnd.draggable(gripperDragOptions);
            scope.dBasic = attrs.tbasic;
            scope.timeBasic = attrs.timeBasic;
            scope.timeStep = attrs.timeStep;
            scope.timeEventType = attrs.timeEventType;
            scope.isEditFlyout = false;
            scope.isShowDetail = false;
            scope.selectedVideoIdx = 0;
           
            scope.isShowPopup = isShowPopup;
            scope.editFlyout = editFlyout;
            scope.getItemIcon = getItemIcon;
            scope.selectVideo = selectVideo;

            scope.$watch(function() { return PanesFactory.getTimelineRange(); }, updateVideoLengthUnit);
            scope.$watch(function() { return PanesFactory.getWidthTimeLine(); }, updateWidthTimeLine);

            PanesFactory.subscribeEvent(scope, listenerNames.CLICK_EVENT_TIMELINE, subscribeClickEventTimeline);
            PanesFactory.subscribeEvent(scope, listenerNames.ADD_EVENT_TIMELINE, subscribeAddEventTimeline);
            PanesFactory.subscribeEvent(scope, listenerNames.REMOVE_DIRECTIVE, subscribeRemoveDirective);

            
            /* -------------------- FUNCTION DETAIL -------------------- */

            function subscribeRemoveDirective() {
                element.remove();
                scope.$destroy();
            }

            function updateWidthTimeLine(newValue) {
                widthPresentTimeLine = newValue
                PanesFactory.setWidthTimeLine(widthPresentTimeLine);
            }

            function selectVideo(index) {
                scope.selectedVideoIdx = index;
                var data = scope.indexEventGroup ? scope.eventGroup[scope.indexEventGroup] : scope.eventGroup[0];
                getLengthVideo(data, index);
            }

            function updateVideoLengthUnit(range) {
                scope.range = range;
                flyoutWidth = flyout.width() + 1;
                if(range.value <= 6000) {
                    videoLengthUnit = flyoutWidth;
                } else {
                    videoLengthUnit = widthPresentTimeLine / (range.value / 1000);
                }
            }
            
            function gripperDragStart(event, ui) {
                var className = (event.target.className).split(' ')[0];
                videoRectangleWidth = videoRectangleLength.width();
            }
            
            function gripperDragStop(event, ui) {
                var className = (event.target.className).split(' ')[0];
                var s = Math.round(ui.position.left / videoLengthUnit);
                var r = Math.round(videoRectangleWidth / videoLengthUnit);
                var dS = s - Math.round(ui.originalPosition.left / videoLengthUnit);
                var postionleft = Math.round(ui.position.left);
              
                if (className === 'gripper-start') {
                    if (postionleft < 0 && videoLocal) {
                        gripperStart.css({left: -2}); 
                        videoRectangleLength.css({ left: 0 });
                        videoRectangleLength.css({ width: postionGriperEnd + space });
                        postionGriperStart = 0;
                    } else if (postionleft >= postionGriperEnd - videoLengthUnit) {
                        gripperStart.css({ left: ui.originalPosition.left }); 
                        postionGriperStart = Math.round(ui.originalPosition.left);
                    } else {
                        gripperStart.css({ left: -space + s*videoLengthUnit });
                        videoRectangleLength.css({ left: s*videoLengthUnit });
                        videoRectangleLength.css({ width: (r - dS)*videoLengthUnit });
                        postionGriperStart = Math.round(-space + s*videoLengthUnit);
                    }
                } else if (className === 'gripper-end') {
                    if (postionleft > width && videoLocal) {
                        gripperEnd.css({ left: width });
                        videoRectangleLength.css({ width: width - postionGriperStart });
                        postionGriperEnd = width;
                    } else if (postionleft < videoLengthUnit || (postionleft - videoLengthUnit) < postionGriperStart) {
                        gripperEnd.css({ left: ui.originalPosition.left });
                        postionGriperEnd = Math.round(ui.originalPosition.left);
                    } else if (r + dS > 0 ) {
                        gripperEnd.css({ left: -space + s*videoLengthUnit });
                        videoRectangleLength.css({ width: (dS + r)*videoLengthUnit });
                        postionGriperEnd = Math.round(-space + s*videoLengthUnit);
                    } 
                }
            }
            
            function getItemIcon(typeEvent) {
                scope.$broadcast(listenerNames.UPDATE_SCROLLABLE);
                return UtilFactory.getEventTimelineIcon(typeEvent);
            }

            function editFlyout() {
                scope.isEditFlyout = scope.isEditFlyout ? false : true;
            }

            function isShowPopup(index) {
                scope.indexEventGroup = index;
                PanesFactory.setActiveState(actions.PAUSE);
                var stateEvent = scope.timeEventType;
                var mode = cameraModes.REPLAY;
                var data = scope.eventGroup[index];
                
                scope.eventImages = data.images;
                scope.eventVideos = data.videos;
                scope.eventTime = data.time;
                scope.eventType = data.typeEvent;
                scope.eventTitle = data.title;
                scope.eventContent = data.content;

                if (stateEvent !== eventTypes.EVENT_PRESENT) {
                    PanesFactory.notifyEvent(listenerNames.EDIT_TIME, data.time_moment, mode);
                } else {
                    scope.isShowDetail = true;
                    if(scope.eventType === eventTypes.EVENT_VIDEO) {
                        getLengthVideo(data, 0);
                    }
                }
            }

            function subscribeAddEventTimeline(event, data, timeEventType) {
                if(!data) { return; }
                if(scope.timeEventType !== timeEventType) { return; }

                data = PanesFactory.convertToTimeStr(data);
                
                switch(scope.timeEventType) {
                    case eventTypes.EVENT_FUTURE:
                    case eventTypes.EVENT_PAST:
                        scope.numberOfEvent = data.length;
                        break;
                    case eventTypes.EVENT_PRESENT: 
                        var dEvent = new Date(data[0].time_moment).getDate();

                        if(!PanesFactory.compareTimeEvent(new Date(parseInt(scope.dBasic)).getDate(), dEvent, null, scope.timeBasic, data[0].time, scope.timeStep)) { return; }
                        scope.numberOfEvent = data.length;
                        if(scope.numberOfEvent === 1) {
                            scope.eventVideos = data[0].videos;
                            scope.eventImages = data[0].images;
                            scope.eventTime = data[0].time;
                            scope.eventType = data[0].typeEvent;
                            scope.eventTitle = data[0].title;
                            scope.eventContent = data[0].content;
                            scope.eventIcon = UtilFactory.getEventTimelineIcon(scope.eventType);
                            if (scope.eventType === eventTypes.EVENT_VIDEO) {
                                getLengthVideo(data, 0);
                            }
                        } 
                        break;
                    default:
                        break;
                }

                scope.eventGroup = data;
            }

            function getLengthVideo(data, indexVideo) {
                var isArray = angular.isArray(data);
                var _data = isArray ? data[0] : data;
                
                var videoLength = _data.videos[indexVideo].length;

                var seconds = parseInt(videoLength);
                var w = Math.round((seconds * widthPresentTimeLine) / (scope.range.value / 1000)) - 1;
                var tI = (scope.range.value / scope.range.ticks) / 1000;
                var r = (seconds < tI) ? Math.round(flyout.width() - w - 2) :  Math.round(-space - (w - flyout.width()));

                videoRectangleLength.css({width: w}); 
                gripperEnd.css({'right': r});
                
                width = w;
                postionGriperEnd = w;
            }
            
            function subscribeClickEventTimeline(event, preIndex, index) {
                var flyoutManager = PanesFactory.getFlyoutManager();
                var timePre = 0;
                var timeConvert = new Date(scope.eventGroup[0].time_moment).getTime();
                var time = new Date(flyoutManager[index].timeBasic).getTime();
                
                if(preIndex !== -1) {
                    timePre = new Date(flyoutManager[preIndex].timeBasic).getTime();
                }
                
                var isPreFlyout = (timeConvert === timePre);
                var isFlyout = (timeConvert === time);
                
                if(isPreFlyout && preIndex !== index) {
                    scope.isShowFlyout = false;
                }
                
                if(isFlyout) {
                    if(scope.numberOfEvent === 1 && scope.timeEventType === eventTypes.EVENT_PRESENT) {
                        scope.isShowDetail = true;
                    } else {
                        scope.isShowDetail = false;
                    }
                    scope.isShowFlyout = flyoutManager[index].isShow;
                }
            }
        }
    }
    
    flyoutCustom.$inject = ["PanesFactory", "LISTENER_NAMES", "EVENT_TYPES", "UtilFactory", "CAMERA_MODES", "ACTIONS"];
    angular.module('app').directive('flyoutCustom', flyoutCustom);
})();
