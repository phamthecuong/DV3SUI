(function() {
    "use strict";

    function videoTimeline(UiElements, PanesFactory, listenerNames, ngDialog, $filter, WebcamService, canvasIds, eventTypes, $window, $timeout, EventFactory, UtilFactory, $translate, SettingFactory) {
        return {
            scope: {},
            templateUrl: "common/directives/timeline/videoTimeline.html",
            controller: ctrlFn,
            link: linkFn
        };

        function ctrlFn($scope) {
            var preTimeRangeIndex;
            var incidentList = EventFactory.getIncidentList();
            var incidentId = EventFactory.getSelectedIncidentId();
            var incident = EventFactory.getIncident(incidentId);

            if(incident !== null) {
                $scope.titleDetail = incident.type
                $scope.contentDetail = incident.description;
            }

            $scope.isEdit = false;
            $scope.dropdownScrollOptions = UiElements.dropdownScrollbarsOptions();
            $scope.timerangeOptions = UiElements.timerangeOptions;
            $scope.searchActive = false;
            $scope.mediaRequried = false;
            $scope.activePaneMode = null;

            updateTimelineRange(-1);

            /* --------------------------- HANDLE EVENT ------------------------- */

            $scope.displayTimeline = displayTimeline;
            $scope.updateTimelineRange = updateTimelineRange;
            $scope.createEvent = createEvent;
            $scope.editTimeLineDetail = editTimeLineDetail;

            PanesFactory.subscribeEvent($scope, listenerNames.CREATE_EVENT, subscribeEventCreateEvent);
            PanesFactory.subscribeEvent($scope, listenerNames.OPEN_CAMERA_SELECT, responsiveTimelineControl);
            PanesFactory.subscribeEvent($scope, listenerNames.DISPLAY_SEARCH_VIEW, displaySearchView);

            $scope.$watch(function() { return PanesFactory.getActivePaneIndex() }, responsiveTimelineControl);
            $scope.$watch(function() { return PanesFactory.getActivePaneMode() }, watchActivePaneMode);
            $scope.$watch("isEdit", watchKeyboardToggle);

            angular.element(document).on('click', function(event) {
        		if (!$(event.target).closest('.timeline-detail-content').length) {
                    $timeout(function() {
                        $scope.isEdit = false;
                        updateIncident();
                    })
        		}
            });

            angular.element($window).bind('resize', responsiveTimelineControl);

            /* --------------------------- FUNCTION DETAIL ----------------------- */

            function watchKeyboardToggle(newVal, oldVal) {
                if (newVal !== oldVal) { SettingFactory.keyboardToggle(); }
            }

            function watchActivePaneMode(newValue) {
                if(angular.isDefined(newValue)) {
                    $scope.activePaneMode = newValue;
                } else {
                    $scope.activePaneMode = null;
                }
            }

            function responsiveTimelineControl() {
                $timeout(function() {
                    $scope.$broadcast(listenerNames.UPDATE_SCROLLABLE);
                }, 300);
            }

            function displaySearchView(event, data ) {
                $scope.searchActive = data;
                responsiveTimelineControl();
            }

            function subscribeEventCreateEvent(event, eventType) {
                createEvent(eventType);
            }

            function updateTimelineRange(index) {
                var indexSelected = $scope.timerangeOptions.map(function(item) { return item.selected; }).indexOf(true);
                if(index != -1) {
                    $scope.selectedTimerange = $scope.timerangeOptions[index];
                    $scope.timerangeOptions[preTimeRangeIndex].selected = false;
                    $scope.timerangeOptions[index].selected = true;
                    preTimeRangeIndex = index;
                } else {
                    $scope.selectedTimerange = $scope.timerangeOptions[indexSelected];
                    preTimeRangeIndex = indexSelected;
                }
                PanesFactory.setTimelineRange($scope.selectedTimerange);
            }

            function displayTimeline() {
                PanesFactory.notifyEvent(listenerNames.DISPLAY_TIMELINE);
            }

            function createEvent(eventType) {
                var dialog = ngDialog.open({
                    template: 'common/dialog/create-event-dialog.html',
                    className: 'ngdialog-theme-default custom_ngDialog',
                    closeByDocument: true,
                    closeByEscape: true,
                    showClose: true,
                    scope: $scope,
                    controller: dialogCtrl
                }).closePromise.then(function() {
                    SettingFactory.keyboardToggle();
                });

                function dialogCtrl($scope) {
                    SettingFactory.keyboardToggle();

                    var isRecording = false;
                    var loop = 0;
                    var timeRecord = 0;

                    $scope.webcam = WebcamService.webcam;
                    $scope.gallerry = [];
                    $scope.eventType = eventType;
                    $scope.selectedItemIdx = -1;

                    $scope.insertEvent = insertEvent;
                    $scope.startCreateEvent = startCreateEvent;
                    $scope.removeEvent = removeEvent;
                    $scope.webcam.success = success;
                    $scope.showRecordVideo = showRecordVideo;

                    setUpFlb(eventType);

                    /* --------------- FUNCTION DETAIL --------------- */

                    function showRecordVideo(pos) {
                        $scope.selectedItemIdx = pos;
                        if($scope.eventType !== eventTypes.EVENT_VIDEO) { return; };

                        var idx = $scope.gallerry.map(function(item) { return item.pos; }).indexOf(pos);
                        if(idx !== -1) {
                            var video = document.getElementsByClassName("replay_video")[0];
                            video.src = $scope.gallerry[idx].video.url;
                            video.load();
                            video.onloadeddata = function() {
                                video.play();
                            }
                        }
                    }

                    function success(imageUrl, type, file, canvas, videoLength) {
                        var length = $scope.gallerry.length;
                        var item = {};
                        item.canvas = canvas;
                        item.imageUrl = imageUrl;
                        item.type = type;
                        item.pos = length;
                        item.video = {}

                        if(file && videoLength) {
                            var vendorURL = window.URL || window.webkitURL;
                            item.video.url = vendorURL.createObjectURL(file);
                            item.video.length = videoLength;
                        }

                        $scope.gallerry.push(item);
                    }

                    function startCreateEvent() {
                        $scope.mediaRequried = false;
                        switch(eventType) {
                            case eventTypes.EVENT_IMAGE:
                                makeSnapshot();
                                break;
                            case eventTypes.EVENT_VIDEO:
                                startRecord();
                                break;
                            case eventTypes.EVENT_AUDIO:
                                break;
                            default:
                                break;
                        }
                    }

                    function removeEvent(pos) {
                        var idx = $scope.gallerry.map(function(item) { return item.pos }).indexOf(pos);
                        if(idx > -1) {
                            if($scope.selectedItemIdx === idx) {
                                $scope.selectedItemIdx = -1;
                            }
                            $scope.gallerry.splice(idx, 1);
                        }
                    }

                    function makeSnapshot(file, videoLength) {
                        $scope.webcam.makeSnapshot(function(canvas) {}, canvasIds.SURVEILLANCE, file, videoLength);
                    }

                    function startRecord() {
                        $scope.selectedItemIdx = -1;
                        $scope.timeRecord = 0;
                        isRecording = !isRecording;
                        if(isRecording === false) {
                            $scope.bgcolorFlb = '#009688';
                            return stopRecord();
                        } else {
                            $scope.bgcolorFlb = 'red';
                            $scope.timeRecord = $filter('secondToTime')(timeRecord);
                        }
                        if(loop !== null) {
                            clearInterval(loop);
                        }
                        $scope.webcam.record();
                        loop = $window.setInterval(function() {
                            $scope.$apply(function() {
                                timeRecord++;
                                $scope.timeRecord = $filter('secondToTime')(timeRecord);
                            });
                        }, 1000);
                    }

                    function stopRecord() {
                        var videoLength = timeRecord;
                        isRecording = false;
                        $scope.webcam.stop(function(file) {
                            timeRecord = 0;
                            makeSnapshot(file, videoLength);
                        });

                        clearInterval(loop);
                    }

                    function insertEvent() {
                        console.log("timePicker", $scope.timePicker);
                        if(checkEvent()) {
                            var event = {
                                "title": $scope.title,
                                "content": $scope.content,
                                "time": $scope.timePicker,
                                "typeEvent": eventType,
                                "channelId": PanesFactory.getActiveChannelId()
                            }

                            event.images = $scope.gallerry.map(function(item) { return item.imageUrl; });

                            if (eventType === eventTypes.EVENT_VIDEO) {
                                event.videos = $scope.gallerry.map(function(item) { return item.video; });
                            }
                            console.log("event", event);
                            PanesFactory.notifyEvent(listenerNames.INSERT_EVENT, event);
                            ngDialog.closeAll();
                        }
                    }

                    function checkEvent() {
                        if(!$scope.title || $scope.title === "" || !$scope.content || $scope.content === "" || !$scope.timePicker || $scope.timePicker === "") {
                            return false;
                        }
                        var dateTime = new Date($scope.timePicker);
                        var y = dateTime.getFullYear();
                        var m = convertTime(dateTime.getMonth() + 1);
                        var d = convertTime(dateTime.getDate());
                        var h = convertTime(dateTime.getHours());
                        var i = convertTime(dateTime.getMinutes());
                        var s = convertTime(dateTime.getSeconds());

                        var time = y + '-' + m +'-'+ d +' '+ h + ':' + i + ':' + s;

                        if (!(/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.test(time))) {
                            return false;
                        }

                        if((eventType === eventTypes.EVENT_IMAGE || eventType === eventTypes.EVENT_VIDEO) && $scope.gallerry.length == 0) {
                            $scope.mediaRequried = true;
                            return false;
                        }
                        return true;
                    }

                    function convertTime(n) {
                        return n < 10 ? '0'+ n : n ;
                    }

                    function setUpFlb(eventType) {
                        $scope.eventIcon = UtilFactory.getEventTimelineIcon(eventType);

                        switch(eventType) {
                            case eventTypes.EVENT_SNAPSHOT:
                            case eventTypes.EVENT_IMAGE:
                                console.log("event snapshot");
                                $scope.activeIcon = "icons8-camera";
                                $scope.restingIcon = "icons8-camera";
                                $scope.bgcolorFlb = '#009688';
                                $scope.thumbnailType = 'image';
                                $scope.headerTitle = $translate.instant('insert_image');
                                break;
                            case eventTypes.EVENT_VIDEO:
                                $scope.activeIcon = "icons8-video-call";
                                $scope.restingIcon = "icons8-video-call";
                                $scope.bgcolorFlb = '#009688';
                                $scope.thumbnailType = 'video';
                                $scope.headerTitle = $translate.instant('insert_video');
                                break;
                            case eventTypes.EVENT_AUDIO:
                                $scope.headerTitle = $translate.instant('insert_audio');
                                break;
                            case eventTypes.EVENT_COMMENT:
                                $scope.headerTitle = $translate.instant('insert_comment');
                                break;
                            case eventTypes.EVENT_CALL:
                                $scope.headerTitle = $translate.instant('insert_call');
                                break;
                            default:
                                break;
                        }
                    }
                }
            }

            function editTimeLineDetail() {
                $scope.isEdit = !$scope.isEdit;
        	};

            function updateIncident() {
                incident.type = $scope.titleDetail;
                incident.description = $scope.contentDetail;
                EventFactory.setIncident(incident);
            }
        }

        function linkFn(scope, element, attr) {
            $('.dropdown-options-container.timeline-range-options').on(listenerNames.MOUSE_LEAVE, function() {
                $timeout(function() {
                    scope.showTimerangeOptions = false;
                })
            });
        }
    }

    videoTimeline.$inject = ["UiElements", "PanesFactory", "LISTENER_NAMES", "ngDialog", "$filter", "WebcamService", "CANVAS_IDS", "EVENT_TYPES", "$window", "$timeout", "EventFactory", "UtilFactory", "$translate", "SettingFactory"];

    angular.module('dlvwc.timeline.directives').directive("videoTimeline", videoTimeline);
})();
