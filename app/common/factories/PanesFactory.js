(function() {

    'use strict';

    angular.module('dlvwc.global.factory').factory("PanesFactory", PanesFactory);

    PanesFactory.$inject = ["$rootScope", "UiElements", "$window", "KEYBOARD_COMMAND"];

    function PanesFactory($rootScope, UiElements, $window, keyboardCommand) {
        var splitsPresets = [
            [{ layout: { w: '100%', h: '100%', t: 0, l: 0 } }],

            [{ layout: { w: '50%', h: '100%', t: 0, l: 0 } },
             { layout: { w: '50%', h: '100%', t: 0, l: '50%' } }],

            [{ layout: { w: '100%', h: '50%', t: 0, l: 0 } },
             { layout: { w: '100%', h: '50%', t: '50%', l: 0 } }],

            [{ layout: { w: '50%', h: '50%', t: 0, l: 0 } },
             { layout: { w: '50%', h: '50%', t: 0, l: '50%' } },
             { layout: { w: '50%', h: '50%', t: '50%', l: 0 } },
             { layout: { w: '50%', h: '50%', t: '50%', l: '50%' } }],

            [{ layout: { w: '50%', h: '50%', t: 0, l: 0 } },
             { layout: { w: '50%', h: '50%', t: 0, l: '50%' } },
             { layout: { w: '100%', h: '50%', t: '50%', l: 0 } }],

            [{ layout: { w: '100%', h: '50%', t: 0, l: 0 } },
             { layout: { w: '50%', h: '50%', t: '50%', l: 0 } },
             { layout: { w: '50%', h: '50%', t: '50%', l: '50%' } }],

            [{ layout: { w: '50%', h: '100%', t: 0, l: 0 } },
             { layout: { w: '50%', h: '50%', t: 0, l: '50%' } },
             { layout: { w: '50%', h: '50%', t: '50%', l: '50%' } }],

            [{ layout: { w: '50%', h: '50%', t: 0, l: 0 } },
             { layout: { w: '50%', h: '50%', t: '50%', l: 0 } },
             { layout: { w: '50%', h: '100%', t: 0, l: '50%' } }]
        ];

        var widthTimeLine = 0;
        var storeEventList = [];
        var eventTypeFilter = [];
        var eventTimeFilter = [];
        var activeSplitsIndex = 1;
        var activePaneIndex = -1;
        var activeChannelId = -1;
        var activePaneObj = null;
        var activeSplit = null;
        var activeCamera = null;
        var timelineTimerange = UiElements.timerangeOptions[4];
        var currentPlayheadTimestamp = {};
        var cameraList = [];
        var flyoutManager = [];
        var sessions = null;
        var isVideoMounted = false;
        var panelChanels = {};

        var service = {

            getWidthTimeLine: getWidthTimeLine,
            setWidthTimeLine: setWidthTimeLine,

            getStoreEventList: getStoreEventList,
            setStoreEventList: setStoreEventList,

            getSplitsPresets: getSplitsPresets,
            getActiveSplitsIndex: getActiveSplitsIndex,

            setActiveSplitsIndex: setActiveSplitsIndex,
            getActiveSplit: getActiveSplit,

            getTimelineRange: getTimelineRange,
            setTimelineRange: setTimelineRange,

            getPlayheadTimestamp: getPlayheadTimestamp,
            setPlayheadTimestamp: setPlayheadTimestamp,

            getCameraList: getCameraList,
            setCameraList: setCameraList,

            getActiveCamera: getActiveCamera,
            setActiveCamera: setActiveCamera,

            getActivePaneIndex: getActivePaneIndex,
            setActivePaneIndex: setActivePaneIndex,

            getActivePaneMode: getActivePaneMode,
            setActivePaneMode: setActivePaneMode,

            subscribeEvent: subscribeEvent,
            notifyEvent: notifyEvent,

            convertToTimeStr: convertToTimeStr,

            getActivePaneObj: getActivePaneObj,
            setActivePaneObj: setActivePaneObj,

            getActiveChannelId: getActiveChannelId,
            setActiveChannelId: setActiveChannelId,

            getFlyoutManager: getFlyoutManager,
            setFlyoutManager: setFlyoutManager,

            getEventTypeFilter: getEventTypeFilter,
            setEventTypeFilter: setEventTypeFilter,
            getEventTimeFilter: getEventTimeFilter,
            setEventTimeFilter: setEventTimeFilter,

            compareTimeEvent: compareTimeEvent,
            compareTimeEventInt: compareTimeEventInt,

            removeChannelInfo: removeChannelInfo,

            addSession: addSession,

            addChanelPanel: addChanelPanel,
            getChanelPanel: getChanelPanel,

            setActiveState: setActiveState,
            getActiveState: getActiveState,

            removeActiveSession: removeActiveSession,
            getActiveSessions: getActiveSessions,
            getSpecificSession: getSpecificSession,
            getSessions: getSessions,

            setActiveCameraFilter: setActiveCameraFilter,
            getActiveCameraFilter: getActiveCameraFilter,

            removeActiveSessionId: removeActiveSessionId,
            disconnectVideoSplit: disconnectVideoSplit,
            disconnectVideoPane: disconnectVideoPane,

            getVideoMounted: getVideoMounted,
            setVideoMounted: setVideoMounted,

            updateSplit: updateSplit
        }

        return service;

        /* -------------------------------------- FUNCTION DETAIL ------------------------------- */

        function disconnectVideoSplit(idx) {
            var length = splitsPresets[idx].length;

            for(var i = 0; i < length; i++) {
                var layout = splitsPresets[idx][i].layout;
                splitsPresets[idx][i] = {};
                splitsPresets[idx][i].layout = layout;
            }
        }

        function disconnectVideoPane(idx) {
            var activeSplitIdx = getActiveSplitsIndex();
            var layout = splitsPresets[activeSplitIdx][idx].layout;
            splitsPresets[activeSplitIdx][idx] = {};
            splitsPresets[activeSplitIdx][idx].layout = layout;
        }

        function getWidthTimeLine() {
            return widthTimeLine;
        }

        function setWidthTimeLine(_widthTimeLine) {
            widthTimeLine = _widthTimeLine;
        }

        function getStoreEventList() {
            return storeEventList;
        }
        function setStoreEventList(_storeEventList) {
            storeEventList = _storeEventList;
        }
        function getSplitsPresets() {
            return splitsPresets;
        }

        function getActiveSplitsIndex() {
            return activeSplitsIndex;
        }

        function setActiveSplitsIndex(value) {
            activeSplitsIndex = value;
        }

        function getActiveSplit() {
            return splitsPresets[activeSplitsIndex];
        }

        function getTimelineRange() {
            return timelineTimerange;
        }

        function setTimelineRange(value) {
            timelineTimerange = value;
        }

        function getPlayheadTimestamp(item) {
            return currentPlayheadTimestamp[item];
        }

        function setPlayheadTimestamp(value) {
            var panelIndex = getActivePaneIndex();
            var splitIndex = getActiveSplitsIndex();
            var k = splitIndex +'-'+ panelIndex;
            currentPlayheadTimestamp[k] = value;
        }

        function getCameraList() {
            return cameraList;
        }

        function setCameraList(value) {
            cameraList = value;
        }

        function getActiveCamera() {
            return activeCamera;
        }

        function setActiveCamera(camera) {
            activeCamera = camera;
        }

        function getActivePaneIndex() {
            return activePaneIndex;
        }

        function setActivePaneIndex(index) {
            activePaneIndex = index;
            setActivePaneObj(index);
        }

        function getActivePaneMode() {
            var mode = null;
            if(activePaneObj && activePaneObj !== null) {
                mode = activePaneObj.mode;
            }
            return mode;
        }

        function setActivePaneMode(mode) {
            activePaneObj.mode = mode;
        }

        function subscribeEvent(scope, eventName, callBack) {
            var handler = $rootScope.$on(eventName, callBack);
            scope.$on("$destroy", handler);
        }

        function notifyEvent(eventName, data, mode) {
            $rootScope.$emit(eventName, data, mode);
        }

        function convertToTimeStr(object) {
            for(var i = 0; i < object.length; i++) {
                if(!angular.isString(object[i].time)) {
                    object[i].time = ((object[i].time).toString()).split(' ')[4];
                }
            }
            return object;
        }

        function getActivePaneObj() {
            return activePaneObj;
        }

        function setActivePaneObj(index) {
            activePaneObj = getActiveSplit()[index];
        }

        function getActiveChannelId() {
            if(activePaneObj !== null && activePaneObj.data) {
                activeChannelId = activePaneObj.data.channelId;
            } else {
                activeChannelId = -1;
            }
            return activeChannelId;
        }

        function setActiveChannelId(newValue) {
            activeChannelId = newValue;
        }

        function getFlyoutManager() {
            return flyoutManager;
        }

        function setFlyoutManager(_flyoutManager) {
            flyoutManager = _flyoutManager;
        }

        function getEventTypeFilter() {
            return eventTypeFilter;
        }

        function setEventTypeFilter(newValue) {
            eventTypeFilter = newValue;
        }

        function getEventTimeFilter() {
            return eventTimeFilter;
        }

        function setEventTimeFilter(newValue) {
            eventTimeFilter = newValue;
        }

        function compareTimeEventInt(tBasic, time, tStep) {
            var isCompareTimeEvent = tBasic <= time && tStep > time;
            return isCompareTimeEvent;
        }

        function compareTimeEvent(dBasic, dEvent, dStep, tBasicStr, timeStr, tStepStr) {
            var tBasicIntSecond = parseInt(tBasicStr.split(':')[2]);
            var tBasicIntMinute = parseInt(tBasicStr.split(':')[1]);
            var tBasicIntHour = parseInt(tBasicStr.split(':')[0]);
            var timeIntSecond = parseInt(timeStr.split(':')[2]);
            var timeIntMinute = parseInt(timeStr.split(':')[1]);
            var timeIntHour = parseInt(timeStr.split(':')[0]);
            var tStepIntSecond = parseInt(tStepStr.split(':')[2]);
            var tStepIntMinute = parseInt(tStepStr.split(':')[1]);
            var tStepIntHour = parseInt(tStepStr.split(':')[0]);

            var tBasicConvert = 3600*tBasicIntHour + 60*tBasicIntMinute + tBasicIntSecond;
            var timeConvert = 3600*timeIntHour + 60*timeIntMinute + timeIntSecond;
            var tStepConvert = 3600*tStepIntHour + 60*tStepIntMinute + tStepIntSecond;
            var isCompareTimeEvent = tBasicConvert <= timeConvert && tStepConvert > timeConvert;
            if (getTimelineRange().label === UiElements.timerangeOptions[0].label) {
                var isCompareTimeEvent = tBasicConvert <= timeConvert && tStepConvert > timeConvert && dBasic == dEvent;
            }

            return isCompareTimeEvent;
        }

        function removeChannelInfo() {
            var activeSplitIndex = getActiveSplitsIndex();
            var activePaneIndex = getActivePaneIndex();
            var layout = splitsPresets[activeSplitIndex][activePaneIndex].layout;

            splitsPresets[activeSplitIndex][activePaneIndex] = {};
            splitsPresets[activeSplitIndex][activePaneIndex].layout = layout;
        }

        function addSession(data) {
            if(!sessions || sessions === null) { sessions = {}; }
            sessions[ data.paneIndex + '-' + data.sessionId ] = {
                paneIndex: data.paneIndex,
                sessionId: data.sessionId,
                streamId: data.streamId,
                streamType: data.streamType,
                paneId: data.paneId,
                streamUri: data.streamUri,
                timeout: 4*60
            }
        }

        function setActiveState( newState ) {
            var split = getActiveSplit();
            var index = getActivePaneIndex();
            split[index].state = newState;
            setActivePaneObj(index);
        }

        function getActiveState() {
            var state = null;
            if(getActivePaneObj() && getActivePaneObj() !== null && getActivePaneObj().state) {
                state = getActivePaneObj().state;
            }
            return state;
        }

        function removeActiveSession() {

        }

        function getActiveSessions() {

        }

        function getSpecificSession (paneIndex, sessionId) {
            if( !sessions ) { return false; }
            return sessions[paneIndex + '-' + sessionId] ? sessions[paneIndex + '-' + sessionId] : false;
        }

        function getSessions() {
            return sessions;
        }

        function setActiveCameraFilter(item, value) {
            var split = getActiveSplit();
            var index = getActivePaneIndex();
            split[index].filter[item] = value;
            setActivePaneObj(index);
        }

        function getActiveCameraFilter() {
            var filter;
            if(getActivePaneObj() !== null && getActivePaneObj().filter) {
                filter = getActivePaneObj().filter;
            }
            return filter;
        }

        function removeActiveSessionId() {
            var splitIndex = getActiveSplitsIndex();
            var paneIndex = getActivePaneIndex();
            var splitsPresetsInfo = splitsPresets[splitIndex][paneIndex];
            if (typeof splitsPresetsInfo.live !== "undefined" && typeof splitsPresetsInfo.replay !== "undefined") {
                delete splitsPresets[splitIndex][paneIndex].live.sessionId;
                delete splitsPresets[splitIndex][paneIndex].replay.sessionId;
            }
            setActivePaneObj(paneIndex);
        }

        function setVideoMounted(isMounted) {
          isVideoMounted = isMounted;
        }

        function getVideoMounted() {
          return isVideoMounted;
        }

        function updateSplit(paneIdx) {
            var split = getActiveSplit();
            split[paneIdx].show_control_bar = true;
        }

        function addChanelPanel(channelPanelObj) {
          var channelObj = {};
          $.each(cameraList, function(index, item) {
            if(item.channelId == channelPanelObj.channelId) {
              channelObj = item;
              return false;
            }
          });
          panelChanels[channelPanelObj.panelIndex] = channelObj;
        }

        function getChanelPanel(panelIndex) {
          return panelChanels[panelIndex];
        }
    }
})();
