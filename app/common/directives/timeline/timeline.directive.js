(function () {
    'use strict';
    
    angular.module('dlvwc.timeline.directives').directive('timeline', timeline);
    timeline.$inject = ["$interval", "PanesFactory", "LISTENER_NAMES", "CAMERA_MODES", "$filter", "EVENT_TYPES", "$compile", "$timeout", "ACTIONS"];
    
    function timeline($interval, PanesFactory, listenerNames, cameraModes, $filter, eventTypes, $compile, $timeout, actions) {
        return {
            scope: {},
            templateUrl: "common/directives/timeline/timeline.html",
            link: linkFn
        };
        
        function linkFn(scope, element, attrs) {
            var paneMode;
            var el = $(element);
            var eventList = [];
            var eventListFilter = [];
            var eventListPresent = [];
            var eventListPast = [];
            var eventListFuture = [];
            
            var flyoutManager = [];
            var preOpenFlyoutIndex = -1;
            var preTimelineRange = PanesFactory.getTimelineRange();
            var activeChannelId = -1;
            
            var panelIndex = PanesFactory.getActivePaneIndex();
            var splitIndex = PanesFactory.getActiveSplitsIndex();
            var keyTimestamp = panelIndex + '-' + splitIndex;
            var timelineRangeObj = PanesFactory.getTimelineRange();
            var activePaneObj = PanesFactory.getActivePaneObj();
            
            var timestampIntervalId = false;
            var pixelPerSecond = 0;
            var pastTime = null;
            var fultureTime = null;
            var prePastTime = null;
            var preFultureTime = null;
            var presentMaxTime = null;
            var prePresentMaxTime = null;
            var presentMinTime = null;
            var prePresentMinTime = null;
            
            var elTimeLine = el.find('.present');
            var timeGridContainer = el.find('.time-grid-container');
            var backEvent = el.find('.time-navigation .back-event');
            var forwardEvent = el.find('.time-navigation .forward-event');
            var timeGridWrapper = timeGridContainer.find('.wrapper');
            var timegridWrapperDragOptions = {
                axis: 'x',
                start: timegridWrapperDragStart,
                stop: timegridWrapperDragStop,
                drag: timegridWrapperDrag
            };
            
            timeGridWrapper.draggable(timegridWrapperDragOptions);

            PanesFactory.subscribeEvent(scope, listenerNames.INSERT_EVENT, subscribeInsertEvent);
            PanesFactory.subscribeEvent(scope, listenerNames.EDIT_TIME, subscribeEditTime);
            PanesFactory.subscribeEvent(scope, listenerNames.MAKE_TIMELINE, subscribeMakeTimeline);
            PanesFactory.subscribeEvent(scope, listenerNames.EVENT_TYPE_FILTER, subscribeEventTypeFilter);
            PanesFactory.subscribeEvent(scope, listenerNames.EVENT_TIME_FILTER, subscribeEventTimeFilter);
            PanesFactory.subscribeEvent(scope, listenerNames.CHANGE_WIDTH_TIME_LINE, subscribeChangeWidthTimeLine);
            PanesFactory.subscribeEvent(scope, listenerNames.INSERT_EVENT_SNAPSHOT, subcribeInsertEventSnapShot);
            
            /* ----------------------- HANDLE EVENT -----------------------  */
            

            scope.clickMoveTimeLine = clickMoveTimeLine;
            scope.$on(listenerNames.DESTROY, destroy);  
            
            scope.$watch(function() { return PanesFactory.getTimelineRange(); }, watchTimelineRange);
            scope.$watch(function() { return PanesFactory.getActivePaneIndex(); }, watchActivePaneIndex);
            scope.$watch(function() { return PanesFactory.getActiveSplitsIndex(); }, watchActiveSplitsIndex);
            scope.$watch(function() { return PanesFactory.getActiveState(); }, watchActiveState);
            
            scope.$watch(function() {
                var key = splitIndex + '-' + panelIndex;
                return PanesFactory.getPlayheadTimestamp(key);
            }, watchTimeStamp);
            
            /* ----------------------- FUNCTION DETAIL --------------------- */
            
            function subcribeInsertEventSnapShot(event, data) {
                subscribeInsertEvent(event, data);
            }

            function watchActiveState(newValue) {
                if(newValue === null) { return; }
                makeTimeline();
            }

            function subscribeChangeWidthTimeLine(event, mode) {
                PanesFactory.setWidthTimeLine(el.find('.present').width());
            }

            function watchActiveSplitsIndex(newValue) {
                splitIndex = newValue;
            }

            function clickMoveTimeLine(postion) {
                PanesFactory.setActivePaneMode(cameraModes.REPLAY);
                PanesFactory.setActiveState(actions.PAUSE);
                paneMode = cameraModes.REPLAY;
                makeTimeline();

                var k = PanesFactory.getActiveSplitsIndex() + '-' + PanesFactory.getActivePaneIndex();
                var tr = (PanesFactory.getTimelineRange().value) / 1000;
                var headTime = PanesFactory.getPlayheadTimestamp(k);
                var d = new Date(headTime);
                
                if (postion === 'back') {
                    d.setSeconds(d.getSeconds() + tr);

                    if (d.getTime() <= new Date().getTime()) {
                        $.toast({
                            heading: 'Warning',
                            text: 'Can not move timeline to the future!',
                            icon: 'warning'
                        })
                        scope.draggerTime = d.getTime();

                        PanesFactory.setPlayheadTimestamp(scope.draggerTime);
                        PanesFactory.notifyEvent(listenerNames.REQUEST_SPEED, scope.draggerTime);    
                    }
                } else {
                    d.setSeconds(d.getSeconds() - tr);
                    scope.draggerTime = d.getTime();

                    PanesFactory.setPlayheadTimestamp(scope.draggerTime);
                    PanesFactory.notifyEvent(listenerNames.REQUEST_SPEED, scope.draggerTime);    
                }
                makeTimeline();
            }

            function storeEvent(event, data, mode) {
                var event_panel = data;
            }
            
            function watchActivePaneIndex(newValue) {
                activePaneObj = PanesFactory.getActivePaneObj();
                if(activePaneObj !== null) {
                    paneMode = activePaneObj.mode;
                }                
                panelIndex = newValue;
                if(PanesFactory.getActiveChannelId() !== -1) {
                    makeTimeline();
                }
            }
            
            function watchTimelineRange(newValue) {
                if(preTimelineRange !== newValue) {
                    preTimelineRange = newValue;
                    timelineRangeObj = newValue;
                    makeTimeline();
                }
            }
            
            function watchTimeStamp(newValue) {
                var value = timelineRangeObj.value;
                var delta = value/(timelineRangeObj.ticks);
                
                if(PanesFactory.getActiveState() === actions.PAUSE) {
                    scope.draggerTime = new Date(newValue).getTime();
                } else {
                    scope.draggerTime = new Date().getTime();
                }
                
                if(pastTime !== null && pastTime !== prePastTime) {
                    if(scope.draggerTime < pastTime + value + delta) {
                        makeTimeline();
                        prePastTime = pastTime;
                    }
                }
                
                if(fultureTime !== null && fultureTime !== preFultureTime) {
                    if(scope.draggerTime > fultureTime - delta) {
                        makeTimeline();
                        preFultureTime = fultureTime;
                    }
                }
                
                if(presentMinTime !== null && presentMinTime !== prePresentMinTime) {
                    if(scope.draggerTime >= presentMinTime + value + delta) {
                        makeTimeline();
                        prePresentMinTime = presentMinTime;
                    }
                }
                
                if(presentMaxTime !== null && presentMaxTime !== prePresentMaxTime) {
                    if(scope.draggerTime <= presentMaxTime - delta) {
                        makeTimeline();
                        prePresentMaxTime = presentMaxTime;
                    }
                }
            }
            
            function subscribeMakeTimeline (event, mode) {
                paneMode = mode;
                makeTimeline();
            }
            
            function subscribeEventTypeFilter(event) {
                makeTimeline();
            }

            function subscribeEventTimeFilter(event, data) {
                makeTimeline();
            }
            
            function subscribeEditTime(event, data, mode) {
                paneMode = mode;
                PanesFactory.setActiveState(actions.PAUSE);
                scope.draggerTime = new Date(data);
                $interval.cancel(timestampIntervalId);
                timestampIntervalId = false;
                PanesFactory.setPlayheadTimestamp(scope.draggerTime);
                makeTimeline();
            }
            
            function subscribeInsertEvent(event, data) {
                data.time_moment = data.time
                eventList.push(data);
                updateEventList();
                makeGrid(false, true);
                addEventOutScopeToTimeline();
            }
            
            function updateTimeline() {
                var k = splitIndex + '-' + panelIndex;
                var right = parseInt(timeGridWrapper.css('right'));
                var step = timeGridContainer.width()/(timelineRangeObj.ticks);
                var activeState = PanesFactory.getActiveState();
                
                if(activeState === actions.PAUSE) {
                    scope.draggerTime = PanesFactory.getPlayheadTimestamp(k);
                } else {
                    scope.draggerTime = new Date().getTime();
                }
                
                PanesFactory.setPlayheadTimestamp(scope.draggerTime);
                
                if(right > -step) {
                    makeGrid(true);
                    return;
                }
                moveTimeline();
            }
            
            function getEventListFilter(filterType, filterTime) {
                eventListFilter = [];
                
                if(filterType.length === 0 || filterType.length === 4) {
                    eventListFilter = angular.copy(eventList);
                } else {
                    for(var i = 0; i < filterType.length; i++) {
                        var arr = angular.copy(eventList).filter(function(item) {
                            return filterType[i] === item.typeEvent;
                        });
                        eventListFilter = eventListFilter.concat(arr);
                    }
                }
                
                if(filterTime.length > 0) {
                    var values = filterTime[0].values;
                    
                    eventListFilter = eventListFilter.filter(function(item) {
                        var _ts = new Date(item.time).getTime();
                        var filter;
                        
                        if(values.start === 0) {
                            filter = (_ts <= values.end);
                        } else if(values.end === 0) {
                            filter = (_ts >= values.start);
                        } else {
                            filter = (values.start <= _ts && _ts <= values.end);
                        }

                        return filter;
                    })
                }
                return eventListFilter;
            }
            
            function updateEventList() {
                var value = timelineRangeObj.value;
                var delta = value/(timelineRangeObj.ticks);
                var filterType = PanesFactory.getEventTypeFilter();
                var filterTime = PanesFactory.getEventTimeFilter();
                
                eventListFilter = getEventListFilter(filterType, filterTime);
               
                flyoutManager = [];
                preOpenFlyoutIndex = -1;
                
                for(var i = 0; i < eventListFilter.length; i++) {
                    flyoutManager.push({
                        'timeBasic': eventListFilter[i].time,
                        'isShow': false
                    });
                }
                PanesFactory.setFlyoutManager(flyoutManager);

                eventListPast = angular.copy(eventListFilter).filter(function(item) {        
                    return (PanesFactory.getActiveChannelId() === item.channelId && getTimeMarker() - value - delta > item.time);
                });
                
                if(eventListPast.length > 0) {
                    pastTime = Math.max.apply(Math, eventListPast.map(function(item) {
                        return item.time;
                    }))
                } else {
                    pastTime = null;
                    prePastTime = null;
                }
                
                eventListFuture = angular.copy(eventListFilter).filter(function(item) {
                    return (PanesFactory.getActiveChannelId() === item.channelId && getTimeMarker() + delta < item.time);
                });
           
                if(eventListFuture.length > 0) {
                    fultureTime = Math.min.apply(Math, eventListFuture.map(function(item) {
                        return item.time;
                    }))
                } else {
                    fultureTime = null;
                    preFultureTime = null;
                }
                
                eventListPresent = angular.copy(eventListFilter).filter(function(item) {
                    return (PanesFactory.getActiveChannelId() === item.channelId && getTimeMarker() - value - delta <= item.time && item.time <= getTimeMarker() + delta)
                })
                
                if(eventListPresent.length > 0) {
                    presentMaxTime = Math.max.apply(Math, eventListPresent.map(function(item) {
                        return item.time;
                    }));
                    
                    presentMinTime = Math.min.apply(Math, eventListPresent.map(function(item) {
                        return item.time;
                    }));
                } else {
                    presentMaxTime = null;
                    presentMinTime = null;
                    prePresentMaxTime = null;
                    prePresentMinTime = null;
                }
                
                eventListPast = PanesFactory.convertToTimeStr(eventListPast);
                eventListFuture = PanesFactory.convertToTimeStr(eventListFuture);
                eventListPresent = PanesFactory.convertToTimeStr(eventListPresent);
            }
            
            function addEventOutScopeToTimeline() {
                removeDirectives();
                backEvent.empty();
                forwardEvent.empty();
                
                if(eventListPast.length > 0) {
                    var d = new Date(eventListPast[0].time_moment).getDate();
                    getEventIcon(eventListPast, d , eventListPast[0].time, '', eventTypes.EVENT_PAST).appendTo(backEvent);
                }
                
                if(eventListFuture.length > 0) {
                    var d = new Date(eventListFuture[0].time_moment).getDate();
                    getEventIcon(eventListFuture, d, eventListFuture[0].time, '', eventTypes.EVENT_FUTURE).appendTo(forwardEvent);
                }
            }
            
            function makeGrid(refresh, isCreateEvent) {
                var section = sectionTemplate();
                var sectionClassName = '';
                var w = timeGridContainer.width();

                $interval.cancel(timestampIntervalId);
                timestampIntervalId = false;  
                if (refresh & PanesFactory.getActiveState() === actions.PLAY) {
                    moveTimeline();
                }
                
                PanesFactory.setWidthTimeLine(w);
                timeGridWrapper.empty();
                timeGridWrapper.css({ width: 3*timeGridContainer.width() });
                
                for(var i = -1; i < 2; i++) {
                    switch(i) {
                        case -1: sectionClassName = 'past';    break;
                        case 0: sectionClassName  = 'present'; break;
                        case 1: sectionClassName  = 'future';  break;
                    }
                    var gridSection = section.clone().css({ left: (i+1)*timeGridContainer.width() });
                    gridSection.addClass(sectionClassName);
                    gridSection.append(drawGridItems(getTimeMarker() - (-(i*timelineRangeObj.value))));
                    timeGridWrapper.append(gridSection);
                }
                
                timeGridWrapper.css({ left: ''});
                timeGridWrapper.css({ right: -(timeGridContainer.width()) });
                
                if(PanesFactory.getActiveState() === actions.PAUSE) {
                    timeGridWrapper.css({ left: -(timeGridContainer.width()) });
                    $timeout(function() { updateTimeline(); });
                } else {
                    timestampIntervalId = $interval(updateTimeline, 1000);
                }
            }
            
            function makeTimeline() {
                updateEventList();
                makeGrid();
                addEventOutScopeToTimeline();
            }
            
            function getTimeMarker() {
                var ts;
                var key = splitIndex + '-' + panelIndex;
                
                if(PanesFactory.getActiveState() === actions.PAUSE) {
                    ts = new Date(PanesFactory.getPlayheadTimestamp(key)).getTime();
                } else {
                    ts = new Date().getTime();
                }
                return ts;
            }
            
            function drawGridItems(ts) {
                var html = $('<div>').addClass('abs grid-section');
                var j = timeGridContainer.width()>= 1600 ? 2*timelineRangeObj.ticks : timelineRangeObj.ticks;
                var steps = Math.floor(timelineRangeObj.value/j);
                
                pixelPerSecond = timeGridContainer.width()/(timelineRangeObj.value/1000);
                for(var i = 0; i < j; i++) {
                    var _ts = ts-(i*steps)-(timelineRangeObj.value/j);
                    var _tsConvertStr = $filter('date')(_ts, 'HH:mm:ss');
                    var _tStepConvertStr = $filter('date')(_ts + steps, 'HH:mm:ss');

                    var gridItem = $('<div>').addClass('grid-item');
                    var labelWrapper = $('<div>').addClass('abs label-wrapper').appendTo(gridItem);
                    var timeLongItem = $('<div>').addClass('time-item');
                    timeLongItem.append(_ts);
                    timeLongItem.appendTo(gridItem);

                    labelWrapper.append(_tsConvertStr);
                    
                    gridItem.append(drawInnerGridItems(timelineRangeObj.subticks));
                    var eventGroup = [];
                    eventGroup = eventListPresent.filter(function(item) {
                        var dItem = new Date(item.time_moment).getDate();
                        var dTs = new Date(_ts).getDate();
                        var dTsStep = new Date(_ts + steps).getDate();

                        return PanesFactory.compareTimeEvent(dTs, dItem, dTsStep, _tsConvertStr, item.time, _tStepConvertStr);
                      
                    });

                    if(eventGroup.length > 0) {
                        getEventIcon(eventGroup, _ts, _tsConvertStr, _tStepConvertStr, eventTypes.EVENT_PRESENT).appendTo(gridItem);
                    }
                    
                    html.append(gridItem);

                    gridItem.on("dblclick", (function(_ts) {
                        return function() {
                            scope.draggerTime = _ts;
                            PanesFactory.setPlayheadTimestamp(scope.draggerTime);
                            PanesFactory.notifyEvent(listenerNames.REQUEST_SPEED);
                            makeGrid();
                        };
                    }(_ts)));
                }
                return html;
            }
            
            function drawInnerGridItems(count) {
                var html = $('<div>').addClass('abs inner-section');
                for(var i = 0; i < count; i++) {
                    var item = $('<div>').addClass('inner');
                    item.appendTo(html);
                }
                return html;
            }
            
            function getEventIcon(eventGroup, tBasic, tBasicStr, tSepStr, timeEventType) {
                var element = angular.element('<flyout-custom tBasic="'+tBasic+'" time-basic="' + tBasicStr + '" time-step="' + tSepStr+ '" time-event-type="' + timeEventType + '" style="width:100%; height:20px; z-index:2;"></flyout-custom>');
                $compile(element)(scope);
              
                $timeout(function() {
                    PanesFactory.notifyEvent(listenerNames.ADD_EVENT_TIMELINE, eventGroup, timeEventType);
                }, 500);

                element.on('dblclick', function() {
                    return false;
                })
               
                element.on('click', function() {
                    var flyoutIndex = flyoutManager.map(function(item) {
                        var timeConvert = new Date(item.timeBasic).getTime();
                        return timeConvert
                    }).indexOf(new Date(eventGroup[0].time_moment).getTime());
                                   
                    if(flyoutIndex === -1) { return; }
                    
                    if(preOpenFlyoutIndex !== -1 && preOpenFlyoutIndex !== flyoutIndex) {
                        flyoutManager[preOpenFlyoutIndex].isShow = false;
                    }
                    
                    flyoutManager[flyoutIndex].isShow = !flyoutManager[flyoutIndex].isShow;
                    
                    PanesFactory.setFlyoutManager(flyoutManager);
                    PanesFactory.notifyEvent(listenerNames.CLICK_EVENT_TIMELINE, preOpenFlyoutIndex, flyoutIndex); 
                    
                    if(flyoutManager[flyoutIndex].isShow) {
                        preOpenFlyoutIndex = flyoutIndex;
                    }
                })
                
                return element;
            }
            
            function moveTimeline() {
                timelineRangeObj = PanesFactory.getTimelineRange();
                pixelPerSecond = timeGridContainer.width()/(timelineRangeObj.value/1000);
                timeGridWrapper.transition({ right: '+=' + pixelPerSecond }, 1000, 'linear');
            }
            
            function sectionTemplate() {
                return $('<div>').addClass('section abs').css({ width: timeGridContainer.width() });
            }
            
            function destroy() {
                $interval.cancel(timestampIntervalId);
            }
            
            function timegridWrapperDragStart(event, ui) {
                $interval.cancel( timestampIntervalId );
                timestampIntervalId = false;
                
                paneMode = cameraModes.REPLAY;
                PanesFactory.setActiveState(actions.PAUSE);
            }

            function timegridWrapperDrag(event, ui) {

            }

            function timegridWrapperDragStop(event, ui) {
                $interval.cancel( timestampIntervalId );
                timestampIntervalId = false;
                
                var childPast = timeGridContainer.find('.past .grid-section .time-item');
                var childFuture = timeGridContainer.find('.future .grid-section .time-item');
                var childPresent = timeGridContainer.find('.present .grid-section .time-item');
                var timelineLength = timelineRangeObj.ticks;
                var deltaRight = parseInt(timeGridWrapper.css('right'));
                var containerWidth = timeGridContainer.width();
                var gridItemWidth = containerWidth/timelineLength;
                var time;
                var index;
                
                if(deltaRight >= 0) {
                    time = childFuture.eq(0).text();
                } else if(deltaRight < -2*containerWidth) {
                    time = childPast.eq(0).text();
                } else if(0 > deltaRight && deltaRight >= -containerWidth) {
                    index = Math.round(Math.abs(deltaRight)/gridItemWidth - 1);
                    if(index === -1) { index = 0; }
                    time = childFuture.eq(index).text();
                } else if(-2*containerWidth <= deltaRight && deltaRight < -containerWidth){
                    index = Math.round(timelineLength*(Math.abs(deltaRight)/containerWidth - 1) - 1);
                    if(index === -1) { index = 0 }
                    time = childPresent.eq(index).text();
                }
                
                $timeout(function() {
                    scope.draggerTime = new Date(parseInt(time));
                    PanesFactory.setActivePaneMode(paneMode);
                    PanesFactory.setPlayheadTimestamp(scope.draggerTime);
                })
                
                if(deltaRight > 0 || deltaRight < -(2*containerWidth + gridItemWidth/2)) {
                    $timeout(function() {
                        makeTimeline();
                    })
                }
//                PanesFactory.notifyEvent(listenerNames.REQUEST_SPEED);  
            }
            
            function removeDirectives() {
                PanesFactory.notifyEvent(listenerNames.REMOVE_DIRECTIVE);
            }
        }
    }
})();