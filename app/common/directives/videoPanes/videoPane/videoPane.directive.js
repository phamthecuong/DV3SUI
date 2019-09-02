(function() {
    'use strict';

    angular.module("dlvwc.videoPanes.directives").directive("videoPane", videoPane);

    videoPane.$inject = ["$q", "$translate", "$stateParams", "ApiFactory", "PanesFactory", "UtilFactory", "STREAM_FORMAT", "LISTENER_NAMES", "CAMERA_MODES", "$window",
      "STREAM_TYPES", "ACTIONS", "$timeout", "DEVICE_TYPE", "SocketService", "TYPE_MESSAGES", "SettingFactory", "Notification"];

    function videoPane($q, $translate, $stateParams, ApiFactory, PanesFactory, UtilFactory, streamFormats, listenerNames, cameraModes, $window,
                       streamTypes, actions, $timeout, deviceTypes, SocketService, typeMessages, SettingFactory, Notification) {
        return {
            scope: {
                pane: "=videoPane",
                index: "=index"
            },
            templateUrl: "common/directives/videoPanes/videoPane/videoPane.html",
            controller: ctrlFn,
            link: linkFn
        };

        function ctrlFn($scope) {
            RTCPeerConnection.prototype['getSimpleStats'] = window.getStats;
            $scope.notFullScreen = true;
            $scope.activeSplitIndex = PanesFactory.getActiveSplitsIndex();
            delete $scope.pane.mode;

            /* ----------------------- HANDLE EVENT ------------------------ */

            $scope.focusPane = focusPane;
            $scope.createEvent = createEvent;
            $scope.fullScreenPanel = fullScreenPanel;
            $scope.$watch(function() { return PanesFactory.getActivePaneIndex() }, watchFocusPane);
            $scope.$watch(function() { return PanesFactory.getActiveSplitsIndex() }, watchFocusSplits);

            PanesFactory.subscribeEvent($scope, listenerNames.UPDATE_PANE, subscribeUpdatePane);
            PanesFactory.subscribeEvent($scope, listenerNames.KEYBOARD_DISCONECT_VIDEO, keyboardDisconnectVideo);

            /* ----------------------- FUNCTION DETAIL ------------------------ */

            function keyboardDisconnectVideo() {
                handleFocusPane(null, $scope.index);
            }

            function watchFocusSplits(newValue) {
                $scope.activeSplitIndex = newValue;
                $scope.notFullScreen = true;
            }

            function fullScreenPanel(panelIndex) {
                if(panelIndex !== PanesFactory.getActivePaneIndex()) { return;  }
                $scope.notFullScreen = !$scope.notFullScreen;
                PanesFactory.notifyEvent(listenerNames.FULL_SCREEN_PANNEL, panelIndex);
            }

            function createEvent(eventType) {
                PanesFactory.notifyEvent(listenerNames.CREATE_EVENT, eventType);
            }

            function watchFocusPane(newValue) {
                $scope.paneSelected = (newValue===$scope.index) ? true : false;
                if($scope.paneSelected) {
                    PanesFactory.setActivePaneIndex(newValue);
                }
            }

            function focusPane(event) {
                event.stopPropagation();
                handleFocusPane(null, $scope.index);
            }

            function subscribeUpdatePane(event, data) {
                var paneIdx = data.data;
                if(paneIdx !== $scope.index) {
                    handleFocusPane(data.controlId, paneIdx);
                }
            }

            function handleFocusPane(controlId, idx) {
                if(!$scope.pane.mode && controlId === null) {
                    PanesFactory.notifyEvent(listenerNames.SHOW_CAMERA_LIST, true);
                }
                if(PanesFactory.getActivePaneIndex() !== idx) {
                    PanesFactory.setActivePaneIndex(idx);
                    SocketService.sendPeerToPeer(controlId, typeMessages.UPDATE_PANE, idx);
                }
            }
        }

        function linkFn(scope, element, attrs) {
            var channelId;
            var bitrateTimer = null;
            var player = null;
            var streaming = null;
            var selectedStreamId = null;
            var el = $(element);
            var mountContainer = el.find('.mount-container');

            var droppableOptions = {
                tolerance: 'fit',
                accept: '.camera-tree-item, .header-drag, .leaflet-marker-icon',
                over: function(event, ui) {
                    scope.$apply(function() { scope.dropHovered = true; });
                },
                out: function(event, ui) {
                    scope.$apply(function() { scope.dropHovered = false; });
                },
                drop: function(event, ui) {
                    scope.$apply(function() { scope.dropHovered = false; });
                    var dragData = ui.draggable.data('dragData');

                    if(dragData.deviceId) {
                      ApiFactory.getChannelInfoByDevice(dragData.deviceId)
                        .then(function(resChannelInfo) {
                          console.log("resChannelInfo = " + angular.toJson(resChannelInfo));
                          collectStreams({channelObj: resChannelInfo});
                        }, function (e) {
                           console.log("No channel for this device");
                          Notification.primary({ message: $translate.instant('noChannel'), templateUrl: "warning_notification_template.html" });
                        });

                    } else {
                      collectStreams(dragData);
                    }
                    PanesFactory.setActivePaneIndex(scope.index);
                    PanesFactory.notifyEvent(listenerNames.SHOW_CAMERA_LIST, false);
                }
            }

            scope.dropdownContainer = false;
            scope.videoMounted = false;
            PanesFactory.setVideoMounted(scope.videoMounted);
            scope.camList = [];
            scope.actionList = [];
            scope.videoId = "pane-" + scope.index;

            scope.showVideoEvoWs = false;
            scope.showVideoJanusWebRtc = true;

            /* ------------------------ HANDLE EVENT ---------------------- */

            mountContainer.droppable(droppableOptions);

            scope.playStreamEvoWs           = playStreamEvoWs;
            scope.selectCameraFromControl   = selectCameraFromControl;
            scope.displayTimeline           = displayTimeline;
            scope.connectStream             = connectStream;
            scope.screenControlAction       = screenControlAction;
            scope.disconnectVideoPane       = disconnectVideoPane;
            scope.switchMode                = switchMode;
            scope.initFn                    = initFn;
            scope.displayMoreFunction       = displayMoreFunction;

            scope.$watch(function() { return PanesFactory.getCameraList(); }, watchCameraList);
            scope.$watch( function () { return PanesFactory.getActiveState(); }, watchActiveState);

            scope.$watch(function() {
                var key = PanesFactory.getActiveSplitsIndex() + '-' + PanesFactory.getActivePaneIndex();
                return PanesFactory.getPlayheadTimestamp(key);
            }, watchTimeStamp);

            PanesFactory.subscribeEvent(scope, listenerNames.OPEN_CAMERA_SELECT, openCameraSelect);
            PanesFactory.subscribeEvent(scope, listenerNames.REMOTE_STREAM, subscribeRemoteStream);
            PanesFactory.subscribeEvent(scope, listenerNames.CONTROL_AUDIO, subscribeAudio);
            PanesFactory.subscribeEvent(scope, listenerNames.REQUEST_SPEED, subscribeRequestSpeed);
            PanesFactory.subscribeEvent(scope, listenerNames.ACTION_STREAM, subscribeActionStream);
            PanesFactory.subscribeEvent(scope, listenerNames.SWITCH_MODE, switchMode);
            PanesFactory.subscribeEvent(scope, listenerNames.DISCONNECT_STREAM, disconnectStream);
            PanesFactory.subscribeEvent(scope, listenerNames.DISPLAY_NAVIGATION, subscribeDisplayNavigation);
            PanesFactory.subscribeEvent(scope, listenerNames.KEYBOARD_EVENT_CREATE_SNAPSHOT, keyboardSnapShot);
            PanesFactory.subscribeEvent(scope, listenerNames.KEYBOARD_DISCONECT_VIDEO, keyboardDisconnectVideo);

            PanesFactory.subscribeEvent(scope, listenerNames.GET_MENU_INFO_DATA, showMenuInfo);
            PanesFactory.subscribeEvent(scope, listenerNames.CANCEL_STREAM_STATS, clearBitrateTimer);
            PanesFactory.subscribeEvent(scope, listenerNames.DISCONNECT_PANE, subscribeDisconnectPane);


            angular.element($window).bind('resize', responseVideoPane);

            if($stateParams.channelId) {
              ApiFactory.getChannelInfo($stateParams.channelId)
                .then(function(resChannelInfo) {
                  console.log("resChannelInfo = " + angular.toJson(resChannelInfo));
                  collectStreams({channelObj : resChannelInfo}, null);
                })

            }

            var channelObj = PanesFactory.getChanelPanel(scope.index);
            if(channelObj) {
              ApiFactory.getChannelInfo(channelObj.channelId)
                .then(function(resChannelInfo) {
                  console.log("resChannelInfo = " + angular.toJson(resChannelInfo));
                  collectStreams({channelObj : resChannelInfo}, null);
                })
            }

            /* ------------------------ FUNCTION DETAIL ---------------------- */
            function showMenuInfo(event) {
              if(streaming) {
                var pc = streaming.webrtcStuff.pc;
                var videoTrack = scope.stream.getVideoTracks()[0];
                scope.infoMenuData = {};
                if (navigator.mozGetUserMedia) {

                  $q.all([ApiFactory.getVersionFrontend(), ApiFactory.getVersionBackend()]).then(function(result) {
                    var feVersion = result[0].data.version;
                    var beVersion = result[1].data.version_backend;
                    scope.infoMenuData.feVersion = feVersion;
                    scope.infoMenuData.beVersion = beVersion;

                    scope.infoMenuData.streamName = scope.pane.live.displayName;
                    scope.infoMenuData.cameraName = scope.cameraName;

                    pc.getStats(videoTrack, function (stats) {
                      bitrateTimer = setInterval(function() {
                        scope.bitrate = streaming.getBitrate().replace('kbits/sec', 'kbps');
                          scope.infoMenuData = Object.assign(scope.infoMenuData, packageStatsMoz(stats, el));
                          scope.infoMenuData.bitrate = scope.bitrate;
                          PanesFactory.notifyEvent(listenerNames.SHOW_MENU_INFO, scope.infoMenuData);
                      }, 1000);
                    });
                  });
                } else if (navigator.webkitGetUserMedia) {
                  $q.all([ApiFactory.getVersionFrontend(), ApiFactory.getVersionBackend()]).then(function(result) {
                    var feVersion = result[0].data.version;
                    var beVersion = result[1].data.version_backend;
                    scope.infoMenuData.feVersion = feVersion;
                    scope.infoMenuData.beVersion = beVersion;
                    scope.infoMenuData.streamName = scope.pane.live.displayName;
                    scope.infoMenuData.cameraName = scope.cameraName;

                    pc.getSimpleStats(videoTrack, function (stats) {
                      bitrateTimer = setInterval(function() {
                        scope.bitrate = streaming.getBitrate().replace('kbits/sec', 'kbps');
                          scope.infoMenuData = Object.assign(scope.infoMenuData, packageStatsWebkit(stats));
                          scope.infoMenuData.bitrate = scope.bitrate;
                          PanesFactory.notifyEvent(listenerNames.SHOW_MENU_INFO, scope.infoMenuData);
                      }, 1000);
                    });
                  });
                } else {
                  console.log('Browser does not support WebRTC.');
                }
              }
            }

            function clearBitrateTimer() {
              if(bitrateTimer !== null && bitrateTimer !== undefined) {
                clearInterval(bitrateTimer);
              }
              bitrateTimer = null;
            }

            function packageStatsMoz(stats, el) {
              var result = {},
                  localVideo = el.find('video')[0];

              Object.keys(stats).forEach(function(key) {
                var res = stats[key];
                if(res.mediaType == 'video' && res.type == 'inboundrtp') {
                  result = {
                    frameHeight: localVideo.videoHeight,
                    frameWidth: localVideo.videoWidth,
                    frameRateInput: Math.round(res.framerateMean),
                    codec: null,
                    bandwidth: null
                  }
                }
              });
              return result;
            }

            function packageStatsWebkit(stats) {
              var result = {},
                  resolutions = stats.resolutions.recv,
                  video = stats.video.recv,
                  bandwidth = stats.bandwidth
              ;
              result = {
                frameHeight: resolutions.height,
                frameWidth: resolutions.width,
                codec: video.codecs.join(','),
                bandwidth: parseFloat(bandwidth.googAvailableReceiveBandwidth /(1024*1024)).toFixed(2)
              };

              Object.keys(stats.results).forEach(function(key) {
                var res = stats.results[key];
                if(res.mediaType == 'video' && res.type == 'ssrc') {
                  result = Object.assign(result, {
                    frameRateInput: res.googFrameRateDecoded
                  });
                }
              });
              return result;
            }

            function subscribeDisplayNavigation(event, showNavigation) {
                var groupLeft = el.find('.options-group-left');
                var width = $window.innerWidth;
                if(showNavigation) {
                    scope.showMoreFunction = false;
                    groupLeft.addClass('response');
                } else {
                    if(width > 500) {
                        scope.showMoreFunction = true;
                        groupLeft.removeClass('response');
                    }
                }
            }

            function displayMoreFunction() {
                scope.showMoreFunction = !scope.showMoreFunction;
            }

            function initFn() {
                responseVideoPane();
            }

            function responseVideoPane() {
                var width = $window.innerWidth;
                var groupLeft = el.find('.options-group-left');
                var splitIdx = PanesFactory.getActiveSplitsIndex();

                if(splitIdx === 0) {
                    if(width <= 500) {
                        scope.showMoreFunction = false;
                        groupLeft.addClass('response');
                    } else {
                        scope.showMoreFunction = true;
                        groupLeft.removeClass('response');
                    }
                } else {
                    if(width <= 1024) {
                        groupLeft.addClass('response');
                        scope.showMoreFunction = false;
                    } else {
                        groupLeft.removeClass('response');
                        scope.showMoreFunction = true;
                    }
                }
            }

            function keyboardDisconnectVideo() {
                if (PanesFactory.getActivePaneIndex() === scope.index) {
                    disconnectVideoPane(null);
                }
            }

            function keyboardSnapShot(event, data) {
                var paneActive = PanesFactory.getActivePaneIndex();

                if (scope.index !== paneActive) {return;}

                var video = document.getElementById('pane-' + paneActive);
                var canvas    = document.createElement('canvas');

                canvas.width  = 640;
                canvas.height = 480;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                var dataURI = canvas.toDataURL('image/jpeg'); // can also use 'image/png'

                SettingFactory.inserEvent(dataURI);
            }

            function disconnectVideoPane(controlId) {
                disconnectStream();
                clearBitrateTimer();
                PanesFactory.disconnectVideoPane(scope.index);

                $.each(PanesFactory.getActiveSplit(), function(index, item) {
                  if(item.data) {
                    PanesFactory.setVideoMounted(true);
                    return false;
                  } else {
                    PanesFactory.setVideoMounted(false);
                  }
                });

                var object = {};
                object.channelObj = {};
                object.channelObj.activePaneIdx   = scope.index;
                object.channelObj.action          = actions.DISCONNECT;

                SocketService.sendPeerToPeer(controlId, typeMessages.UPDATE_STREAM, object);
            }

            function screenControlAction() {
                var action = '';
                if(scope.playBackState === actions.PAUSE) {
                    action = actions.PLAY;
                } else if(scope.playBackState === actions.PLAY) {
                    action = actions.PAUSE;
                }

                PanesFactory.notifyEvent(listenerNames.PLAY_BACK_ACTION, action);
            }

            function watchTimeStamp(newValue) {
                scope.markerTime = newValue;
            }

            function switchMode(event, mode) {
                if(scope.index !== PanesFactory.getActivePaneIndex()) { return; }
                if(PanesFactory.getActivePaneMode() === mode) { return; }

                PanesFactory.setActiveState(actions.PLAY);
                PanesFactory.setActivePaneMode(mode);

                displayControlBarRemote(false);

                var cameraType = scope.pane.cameraType;

                if(cameraType === 'Panomera') {
                    switchModePanomera();
                } else {
                    connectStream();
                }

                PanesFactory.notifyEvent(listenerNames.MAKE_TIMELINE, mode);
            }

            function watchActiveState ( newValue ) {
                scope.playBackState = newValue;
            }

            function subscribeActionStream(event, videoId, action) {
                if(videoId !== scope.pane.videoId) { return; }
                switch(action) {
                    case actions.STOP:
                        scope.pane.mode = cameraModes.LIVE;
                        scope.pane.state = actions.PLAY;
                        connectStream();
                        break;
                    case actions.PLAY:
                        scope.pane.state = actions.PLAY;
                        playbackAction(actions.TOBEGIN);
                        break;
                    case actions.PAUSE:
                        scope.pane.state = actions.PAUSE;
                        break;
                    default:
                        playbackAction(action).then(function(res) {
                            console.log("Test successfull action = " + action + " and res = " + angular.toJson(res));
                        }, function error(err) {
                            console.log("Test failed action = " + action + " and err = " + angular.toJson(err));
                        });
                }
            }

            function subscribeRequestSpeed(event, data) {
                var time = new Date(data).toISOString();
                var channelObj = PanesFactory.getActivePaneObj();
                var mode = channelObj.mode;
                var paneId = channelObj[mode].paneId;
                var sessionId = channelObj[mode].sessionId;

                ApiFactory
                    .seekInRecording ( sessionId, paneId, time)
                    .then ( function ( res ) {
                        console.log("res speed", angular.toJson(res));
                    }, function ( err ) {
                    });
            }

            function displayTimeline() {
                PanesFactory.notifyEvent(listenerNames.DISPLAY_TIMELINE);
            }

            function subscribeAudio(event, data, mode) {
                if(scope.index !== PanesFactory.getActivePaneIndex()) { return; }
                if(player === null) { return; }
                player.setVolume(data);
            }

            function selectCameraFromControl(index, indexList) {
                var list = scope.camList;
                if (indexList == 1) {
                    if(scope.pane.pos === index) { return; }
                    list = scope.camList1;
                } else if (indexList == 2) {
                    if(scope.pane.pos === (scope.camList1.length + index)) { return; }
                    list = scope.camList2;
                }
                PanesFactory.removeActiveSessionId();
                PanesFactory.notifyEvent(listenerNames.OPEN_CAMERA_SELECT, {channelObj: list[index]});
            }

            function watchCameraList(list) {
                scope.camList  = list;
                scope.camList1 = [];
                scope.camList2 = [];

                var listLength = list.length;
                if (listLength === 0) { return; }
                if (listLength <= 1) {
                    for (var i = 0; i < listLength; i++) {
                        scope.camList1.push(list[i]);
                    }
                } else {
                    for (var j = 0; j < 1; j++) {
                        scope.camList1.push(list[j])
                    }
                    for (var k = 1; k < listLength; k++) {
                        scope.camList2.push(list[k]);
                    }
                }
            }

            function openCameraSelect(event, data, paneMode) {
                if(!scope.paneSelected || scope.index !== PanesFactory.getActivePaneIndex()) {
                    return;
                }
                PanesFactory.notifyEvent(listenerNames.SHOW_CAMERA_LIST, false);
                PanesFactory.removeActiveSessionId();
                collectStreams(data, null);
            }

            function subscribeRemoteStream(event, data) {
                if(scope.index !== data.data.channelObj.activePaneIdx) { return; }

                scope.pane.mode = data.data.channelObj.mode;
                scope.pane[scope.pane.mode] = {};
                scope.pane[scope.pane.mode].streamId = data.data.channelObj.streamId;
                scope.pane.data = {};
                scope.pane.data.channelId = data.data.channelObj.channelId;

                switch(data.data.channelObj.action) {
                    case actions.PLAY:
                        console.log("KKKKKK data = " + angular.toJson(data));
                        console.log("KKKKKK 1 scope.pane = " + angular.toJson(scope.pane));
                        collectStreams(data.data, data.controlId);
                        break;
                    default:
                        break;
                }
            }

            function collectStreams(data, controlId) {
                channelId = data.channelObj.channelId;

                scope.pane.cameraType = data.channelObj.type;
                scope.pane.state = actions.PLAY;

                scope.pane.data = data.channelObj;
                scope.pane.addedTimestamp = new Date().getTime();
                scope.pane.videoId = scope.videoId;

//                scope.pane.mode = cameraModes.LIVE;
//                scope.videoMounted = true;
//                scope.showVideoJanusWebRtc = true;
//
//                 $timeout (function() {
//                     playStreamFlow();
//                     PanesFactory.notifyEvent(listenerNames.MAKE_TIMELINE, scope.pane.mode);
//                 }, 3000);

                if(!scope.pane.live) {
                    scope.pane.live = {};
                }

                if(!scope.pane.replay) {
                    scope.pane.replay = {};
                }

                scope.pane.pos = (scope.camList1).map(function(item) { return item.channelId; }).indexOf(channelId);
                if(scope.pane.pos === -1) {
                    scope.pane.pos = (scope.camList2).map(function(item) { return item.channelId; }).indexOf(channelId) + scope.camList1.length;
                }

                getChannelInfo(channelId, controlId);
            }

            function getChannelInfo(channelId, controlId) {
                ApiFactory.getChannelInfo(channelId)
                .then(function(resChannelInfo) {
                    console.log("Test TTTT resChannelInfo = " + angular.toJson(resChannelInfo));
                    scope.pane.ptz = resChannelInfo.ptzSupport;
                    scope.cameraName = resChannelInfo.displayName;
                    return ApiFactory.getLiveStream(channelId);
                }, function (e) {
                  Notification.primary({ message: $translate.instant('noChannel'), templateUrl: "warning_notification_template.html" });
                })
                .then(function(resLiveStream) {
                    console.log("Test IIIIIII resLiveStream = " + angular.toJson(resLiveStream));
                    if(angular.isDefined(resLiveStream)) {
                        scope.pane.live.streamId = resLiveStream.streamId;
                        scope.pane.live.displayName = resLiveStream.displayName;
                    }
                    return ApiFactory.getRecordingStream(channelId);
                }, function ( err ) {})
                .then(function(resRecordingStream) {
                    console.log("Test IIIIIII resRecordingStream = " + angular.toJson(resRecordingStream));
                    if(angular.isDefined(resRecordingStream)) {
                        scope.pane.replay.streamId = resRecordingStream.streamId;
                        scope.pane.replay.displayName = resRecordingStream.displayName;
                    }
                    return ApiFactory.getRecordingStreamInfo(resRecordingStream.streamId);
                }, function ( err ) {})
                .then(function(resRecordingStreamInfo) {
                    console.log("Test IIIIII resRecordingStreamInfo = " + angular.toJson(resRecordingStreamInfo));
                    scope.pane.replay.recordingStreamInfo = resRecordingStreamInfo;
                })
                .finally(function() {
                    if(!scope.pane.mode) {
                        if (scope.pane.data.type === "Panomera") {
                            scope.pane.mode = cameraModes.REPLAY;
                        } else if(scope.pane.live.streamId) {
                            scope.pane.mode = cameraModes.LIVE;
                        } else if (scope.pane.replay.streamId) {
                            scope.pane.mode = cameraModes.REPLAY;
                        } else {
                            return;
                        }
                    }

                    scope.pane.displayName = scope.pane[scope.pane.mode].displayName;

                    connectStream(controlId);
                    PanesFactory.notifyEvent(listenerNames.MAKE_TIMELINE, scope.pane.mode);
                })
            }

            function connectStream(controlId) {
                if(PanesFactory.getSessions() == null && scope.index !== PanesFactory.getActivePaneIndex()) { return; }
                disconnectStream();
                updateCameraFilter();

                var object = {};
                object.channelObj = {};
                object.channelObj.mode            = scope.pane.mode;
                object.channelObj.streamId        = scope.pane[scope.pane.mode].streamId;
                object.channelObj.displayName     = scope.pane[scope.pane.mode].displayName;
                object.channelObj.channelId       = scope.pane.data.channelId;
                object.channelObj.activePaneIdx   = scope.index;
                object.channelObj.action          = actions.PLAY;

                SocketService.sendPeerToPeer(controlId, typeMessages.UPDATE_STREAM, object);

                if(PanesFactory.getSpecificSession( scope.index, scope.pane[scope.pane.mode].sessionId )) {
                    playStream();
                } else {
                    getSession();
                }
            }

            function getSession() {
                var activeMode = scope.pane.mode;
                var streamId = scope.pane[activeMode].streamId;

                createSessionStream(streamId, activeMode);
            }

            function createSessionStream ( streamId, activeMode ) {
                var sessionObj = {
                    paneIndex: scope.index,
                    streamId: streamId,
                    streamType: getStreamType(activeMode)
                };
                var channelPanelObj = {
                    panelIndex: scope.index,
                    channelId: scope.pane.data.channelId
                };

                var formatStream = getFormatStreamType();

                ApiFactory
                    .formatVideo(channelId, formatStream, activeMode)
                    .then(function(res) {

                        sessionObj.sessionId = res.data.sessionId;
                        sessionObj.paneId = res.data.mainPaneId;
                        sessionObj.streamUri = res.data.primaryUri;

                        scope.pane[activeMode].sessionId = res.data.sessionId;
                        scope.pane[activeMode].streamUri = res.data.primaryUri;
                        scope.pane[activeMode].paneId = res.data.mainPaneId;

                        return ApiFactory.getActionList ( res.data.sessionId, res.data.mainPaneId )
                    }, function(err) {
                        scope.videoMounted = true;
                        PanesFactory.setVideoMounted(scope.videoMounted);
                    })
                    .then ( function( resActionList ) {
                        scope.actionList = resActionList.data;
//                        return ApiFactory.getCameraPosition ( sessionObj.sessionId, sessionObj.paneId )
                    })
//                    .then ( function( resCameraPosition ) {
//                        console.log("Test get camera position successful");
//                    }, function (err) {
//                        console.log("Test get camera position failed");
//                    })
                    .then ( function() {
                        PanesFactory.addSession( sessionObj );
                        PanesFactory.addChanelPanel(channelPanelObj)
                        playStream();
                    })
            }

            function getStreamType(mode) {
                var streamType;
                switch (mode) {
                    case cameraModes.LIVE:
                        streamType = streamTypes.LIVE;
                        break;
                    case cameraModes.REPLAY:
                        streamType = streamTypes.RECORD;
                        break;
                }
                return streamType;
            }

            function getFormatStreamType() {
                var formatStreamType = '';
                var deviceInfo = UtilFactory.getDeviceInfo();

                switch(true) {
                    case (deviceInfo.contains(deviceTypes.WINDOWS)):
                    case (deviceInfo.contains(deviceTypes.ANDROID)):
                    case (deviceInfo.contains(deviceTypes.IOS)):
                    default:
                        formatStreamType = streamFormats.WEBRTC;
                        scope.noVideoAvailable = false;
                        scope.showVideoEvoWs = false;
                        scope.showVideoJanusWebRtc = true;
                }
                return formatStreamType;
            }

            function playStream () {
                scope.videoMounted = true;
                PanesFactory.setVideoMounted(scope.videoMounted);
                scope.pane.displayName = scope.pane[scope.pane.mode].displayName;
                var streamUri = scope.pane[scope.pane.mode].streamUri;
                var cameraType = scope.pane.cameraType;

                playbackAction(scope.pane.state, false).then(function(res) {
                    if(scope.pane.mode === cameraModes.REPLAY && cameraType !== 'Panomera') {
                        playbackAction(actions.TOBEGIN).then(function(res) {
                            switchPlayVideoDevice(streamUri);
                        })
                    } else {
                        switchPlayVideoDevice(streamUri);
                    }
                });
            }

          function getWebSocketURL(uri) {
            if(window.location.origin.substr(0, 5).toLowerCase() === 'https'){
              var wsProto = 'wss';
              var wsPort = 443;
              uri = wsProto + "://" + window.location.hostname + (wsPort !== 443 ? (':' + wsPort) : '') + "/dv3s/ws/" + uri.substr(uri.lastIndexOf('/') + 1);
            }
            return uri;
          };

            function switchPlayVideoDevice(streamUri) {
                streamUri = getWebSocketURL(streamUri);

                switch(getFormatStreamType()) {
                    case (streamFormats.WS):
//                        playStreamEvoWs(streamUri);
                        break;
                    case (streamFormats.WEBRTC):
                    default:
                        setupJanus(streamUri);
                }
            }

            function playStreamEvoWs(number, useSsl) {
                if($window['player' + number]) { return; }
                var streamName = scope.pane[scope.pane.mode].streamId;
                var opts = {
                    emsIp: "192.168.1.30",
                    streamName: streamName,
                    videoTagId: 'video' + number,
                    debugDivId: 'debug' + number
                };
                if(useSsl) {
                    opts.useSsl = true;
                    opts.emsPort = 8420;
                }

                $window['player' + number] = new EvoWsPlayer(opts);
                $window['player' + number].play();
            }

            function setupJanus(streamUri) {
                Janus.init({
                    debug: "all",
                    callback: function() {
                        playStreamJanus(streamUri);
                    }
                })
            }

            function playStreamJanus(server) {
                var opaqueId = "streamingtest-"+Janus.randomString(12);
                var selectedStreamSession = scope.pane[scope.pane.mode].sessionId;

                var janus = new Janus({
                    server: server,
                    success: function() {
                        janus.attach({
                            plugin: "janus.plugin.streaming",
                            opaqueId: opaqueId,
                            success: function(pluginHandle) {
                                streaming = pluginHandle;
                                updateStreamsList();
                            },
                            error: function(error) {
                                console.log("  -- Error attaching plugin... ", error);
                            },
                            onmessage: function(msg, jsep) {
                                var result = msg["result"];

                                if(result !== null && result !== undefined) {
                                    if(result["status"] !== undefined && result["status"] !== null) {
                                        if(result["status"] === 'stopped') {
                                            stopStream();
                                        }
                                    }
                                } else if(msg["error"] !== undefined && msg["error"] !== null) {
                                    stopStream();
                                    return;
                                }

                                if(jsep !== undefined && jsep !== null) {
                                    streaming.createAnswer({
                                        jsep: jsep,
                                        media: { audioSend: false, videoSend: false },
                                        success: function(jsep) {
                                            var body = { "request": "start" };
                                            streaming.send({"message": body, "jsep": jsep});
                                        },
                                        error: function(error) {
                                            console.log("WebRTC error:", error);
                                        }
                                    });
                                }
                            },
                            onremotestream: function(stream) {

                                var remoteVideoEl = $('#' + scope.pane.videoId);

                                remoteVideoEl.bind("playing", function() {
                                    displayControlBarRemote(true);

                                    PanesFactory.updateSplit(scope.index);

                                    if(this.videoWidth) {
                                        remoteVideoEl.removeClass('hide').show();
                                    }
                                    var videoTracks = stream.getVideoTracks();
                                    if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0) { return; }
                                })

                                Janus.attachMediaStream(remoteVideoEl.get(0), stream);
                                var videoTracks = stream.getVideoTracks();
                                scope.stream = stream;
                                if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                                    remoteVideoEl.hide();
                                    if(remoteVideoEl.length === 0) {
                                        scope.noVideoAvailable = true;
                                    }
                                } else {
                                    scope.noVideoAvailable = false;
                                    remoteVideoEl.removeClass('hide').show();
                                }

                            },
                            oncleanup: function() {
                                $('#' + scope.pane.videoId).remove();
                                $('.no-video-container').remove();
                                clearBitrateTimer();
                            }
                        })
                    },
                    error: function(error) {
//				        window.location.reload();
					},
					destroyed: function() {
//						window.location.reload();
					}

                })

                function updateStreamsList() {
                    var body = { "request": "list" };
                    streaming.send({"message": body, success: function(result) {
                        if(result["list"] !== undefined && result["list"] !== null) {
                            var list = result["list"];

                            deleteStream(list);

                            var selectItem = list.filter(function(item) {
                                return item.description.contains(selectedStreamSession)
                            });

                            if(scope.pane.mode === cameraModes.REPLAY) {
                                selectedStreamId = selectItem[0].id;
                            } else {
                                var streamUri = scope.pane[scope.pane.mode].streamUri;
                                var length = streamUri.split('/').length;

                                if(length > 0) {
                                    selectedStreamId = streamUri.split('/')[(length-1)];
                                }
                            }

                            startStream();
                        }
                    }})
                }
            }

            function stopStream() {
                if(streaming !== null) {
                    var body = { "request": "stop" };
                    streaming.send({"message": body});
                    streaming.hangup();
                    clearBitrateTimer();
                }
            }

            function startStream() {
                Janus.log("Selected video id #" + selectedStreamId);

                var body = { "request": "watch", id: parseInt(selectedStreamId) };
                streaming.send({"message": body});
            }

            function pauseStream() {
                var body = { "request": "pause", id: parseInt(selectedStreamId) };
                streaming.send({"message": body});
            }

            function playStreamOnJanus() {
                var body = { "request": "play", id: parseInt(selectedStreamId) };
                streaming.send({"message": body});
            }

            function disconnectStream() {
                stopStream();
                scope.videoMounted = false;
                scope.showVideoJanusWebRtc = false;
                scope.showVideoEvoWs = false;
            }

            function playbackAction(action, isSwitchMode) {
                var activeMode = scope.pane.mode;
                var cameraType = scope.pane.cameraType;

                if(cameraType === 'Panomera' && activeMode === cameraModes.LIVE) {
                    scope.pane.live.sessionId = scope.pane.replay.sessionId;
                    scope.pane.live.paneId = scope.pane.replay.paneId;
                }

                var sessionId = scope.pane[activeMode].sessionId;
                var paneId = scope.pane[activeMode].paneId;

                return ApiFactory.playbackAction(sessionId, paneId, cameraType, action, activeMode, isSwitchMode);
            }

            function updateCameraFilter() {
                scope.pane.filter = {
                    brightness: 100,
                    contrast: 100,
                    saturation: 100
                }
            }

            function switchModePanomera() {
                updateCameraFilter();

                playbackAction(null, true).then(function(res) {
                    var streamUri = res.data.primaryUri;
                    scope.pane[scope.pane.mode].streamUri = streamUri;
                    setupJanus(streamUri);
                })
            }

            function deleteStream(list) {
//                for(var i = 0; i < list.length; i++) {
//                    var sessionId = list[i].description.split('WebRTC')[1];
//                    ApiFactory.getPane(sessionId).then(function(res) {
//                        var paneId = res.data[0].paneId;
//                        ApiFactory.playbackAction(sessionId, paneId, null, actions.STOP, null, null).then(function(res) {
//                            ApiFactory.destroySession(sessionId);
//                        })
//                    })
//                }
            }

            function playStreamFlow (streamUri) {
                streamUri = "rtmp://184.72.239.149/vod/mp4:bigbuckbunny_1500.mp4";
                player = UtilFactory.createFlowPlayer(streamUri, scope.videoId);
            }

            function subscribeDisconnectPane(event, data) {
                var activeSplitIdx = PanesFactory.getActiveSplitsIndex();
                console.log("Test go to disconnect pane active, activeSplitIdx = " + activeSplitIdx);
                console.log("Test go to disconnect pane active, scope.index = " + scope.index);
                console.log("Test go to disconnect pane active, data split idx = " + data.data.splitIdx);
                console.log("Test go to disconnect pane active, data pane idx = " + data.data.paneIdx);
                if(activeSplitIdx === data.data.splitIdx && scope.index === data.data.paneIdx) {
                    console.log("Test go to disconnect pane active, scope.index = " + data.data.paneIdx);
                    disconnectVideoPane(data.controlId);
                    PanesFactory.setActivePaneObj(-1);
                }
            }

            function displayControlBarRemote(status) {
                var object = {
                    paneIdx: scope.index,
                    status: status
                };
                SocketService.sendPeerToPeer(null, typeMessages.SHOW_CONTROL_BAR, object);
            }
        }
    }
})();
