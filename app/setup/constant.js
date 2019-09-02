(function() {
    'use strict';

    var urls = {
        'ICE_SERVER_URL': 'stun:stun.l.google.com:19302',
        'SIGNALING_URL_DEFAULT': 'http://localhost:4000',
        'BACKEND_URL_ELECTRON': 'http://localhost:7000' + '/api',
        'BACKEND_URL_WEB': window.location.origin + '/api'
    };

    var streamFormat = {
        'RTSP': 'rtsp',
        'RTMP': 'RTMP',
        'RTMPS': 'rtmps',
        'WS_S': 'ws',
        'HLS': 'hls',
        'HLS_S': 'hls_s',
        'DASH': 'dash',
        'WEBRTC': 'WebRTC',
        'WS': 'WebSockets'
    };

    var deviceType = {
        'WINDOWS': 'Windows',
        'ANDROID': 'android',
        'IOS'    : 'ios'
    };

    var filterTypes = {
        'TYPE': 'Type',
        'TIME': 'Time',
        'CRITICALITY': 'Criticality'
    };

    var listenerNames = {
        'DISPLAY_NAVIGATION': 'display_navigation',
        'DISPLAY_SURVEILLANCE_SEARCH': 'display_surveillance_search',
        'OPEN_CAMERA_SELECT': 'openCameraSelect',
        'DISPLAY_TIMELINE': 'displayTimeline',
        'MOUSE_LEAVE': 'mouseleave',
        'INSERT_EVENT': 'insertEvent',
        'CREATE_EVENT': 'createEvent',
        'DESTROY': '$destroy',
        'CLICK_EVENT_TIMELINE': 'clickEventTimeline',
        'ADD_EVENT_TIMELINE': 'addEventTimeline',
        'EDIT_TIME': 'editTime',
        'EDIT_TIME_TOGGLE': 'editTimeToggle',
        'SHOW_CAMERA_LIST': 'showCameraList',
        'CONTROL_AUDIO': 'controlAudio',
        'DISCONNECT_PANE': 'disconnect_pane',
        'DISCONNECT_STREAM': 'disconnectStream',
        'UPDATE_SCROLLABLE': 'content.changed',
        'DISPLAY_SEARCH_VIEW': 'displaySearchView',
        'MAKE_TIMELINE': 'makeTimeline',
        'EVENT_TYPE_FILTER': 'eventTypeFilter',
        'EVENT_TIME_FILTER': 'eventTimeFilter',
        'CHANGE_WIDTH_TIME_LINE': 'change_width_time_line',
        'SHOW_OPTIONS_FLYOUT': 'showOptionsFlyout',
        'REQUEST_SPEED': 'request_speed',
        'ACTION_STREAM': 'action_stream',
        'SWITCH_MODE': 'switch_mode',
        'PLAY_BACK_ACTION': 'play_back_action',
        'REMOVE_DIRECTIVE': 'remove_directive',
        'UPDATE_SPLIT': 'update_split',
        'UPDATE_PANE': 'update_pane',
        'REMOTE_STREAM': 'remote_stream',
        'SHOW_OPTIONS_SETTING_KEYBOARD': 'showOptionSettingKeyboard',
        'ZOOM_CAMERA': 'zoomCamera',
        'CAMERA_MOVE': 'cameraMove',
        'CLOSE_OPTION_KEYBOARD':'closeOptionKeyboard',
        'OPEN_OPTION_KEYBOARD': 'openOptionKeyboard',
        'ACTIVE_VIEW_KEYBOARD':'activeViewKeyboard',
        'KEYBOARD_EVENT_LIVE': 'keyboardEventLive',
        'KEYBOARD_EVENT_REPLAY': 'keyboardEventReplay',
        'KEYBOARD_EVENT_STOP': 'keyboardEventStop',
        'KEYBOARD_EVENT_PAUSE': 'keyboardEventPause',
        'KEYBOARD_EVENT_GO_TO_TIMELINE': 'keyboardEvenGoToTimeLine',
        'KEYBOARD_EVENT_CREATE_SNAPSHOT': 'keyboardEvenCreateSnapHost',
        'KEYBOARD_SWITCH_MODE': 'keyboardSwitchMode',
        'KEYBOARD_EDIT_DATE_AND_TIME':'KeyboardEditDateAndTime',
        'KEYBOARD_ACTION': 'keyboardAction',
        'KEYBOARD_DISCONECT_VIDEO': 'keyboardDisconnectVideo',
        'KEYBOARD_TOGGLE': 'keyboardToggle',
        'INSERT_EVENT_SNAPSHOT': 'InsertEventSnapshot',
        'INSERT_EVENT_KEYBOARD': 'InsertEventKeyboard',
        'GET_MENU_INFO_DATA': 'GetMenuInfoData',
        'SHOW_MENU_INFO': 'ShowMenuInfo',
        'CANCEL_STREAM_STATS': 'CancelStreamStats'
    };

    var cameraModes = {
        'LIVE': 'live',
        'SYNC': 'sync',
        'REPLAY': 'replay',
        'RECORDING': 'recording'
    };

    var actions = {
        'PLAY': 'Play',
        'PAUSE': 'Pause',
        'STOP': 'Stop',
        'FORWARD': 'Forward',
        'BACKWARD': 'Backward',
        'FASTFORWARD': 'FastForward',
        'FASTBACKWARD': 'FastBackward',
        'STEPFORWARD': 'StepForward',
        'STEPBACKWARD': 'StepBackward',
        'TOBEGIN': 'ToBegin',
        'TOEND': 'ToEnd',
        'DISCONNECT': 'disconnect'
    };

    var cameraFilterOptions = {
        'BRIGHTNESS': 'brightness',
        'CONTRAST': 'contrast',
        'SATURATION': 'saturation'
    };

    var canvasIds = {
        'SURVEILLANCE': 'snapshot_surveillance',
        'RECORDER': 'snapshot_recorder'
    };

    var eventTypes = {
        'EVENT_COMMENT': 'event_comment',
        'EVENT_IMAGE': 'event_image',
        'EVENT_VIDEO': 'event_video',
        'EVENT_AUDIO': 'event_audio',
        'EVENT_CALL': 'event_call',
        'TIME_PICKER': 'time_picker',
        'EVENT_PAST': 'event_past',
        'EVENT_FUTURE': 'event_future',
        'EVENT_PRESENT': 'event_present',
        "EVENT_SNAPSHOT": 'event_snapshot'
    };

    var streamTypes = {
        'LIVE': 'live',
        'RECORD': 'Recording'
    };

    var cameraNames = {
        'OFFILINE_CAMERA': 'Offline Camera'
    };

    var typeMessages = {
        'MESSAGE': 'message',
        'LOG_IN': 'login',
        'USER_INFO': 'user_info',
        'CONNECT_SUCCESS': 'connect_success',
        'USER_LIST': 'user_list',
        'CANDIDATE': 'candidate',
        'OFFER': 'offer',
        'ANSWER': 'answer',
        'UPDATE_SPLIT': 'update_split',
        'UPDATE_PANE': 'update_pane',
        'UPDATE_STREAM': 'update_stream',
        'SHOW_CONTROL_BAR': 'show_control_bar',
        'INIT_PLAYER': 'init_player',
        'WELCOME': 'welcome',
        'REMOVE_USER': 'remove_user',
        'DISCONNECT_PANE': 'disconnect_pane'
    };

    var typeDevices = {
        'REMOTE_CONTROL': 'remote_control',
        'PLAYER': 'player'
    }

    var keyboardCommand = {
        'MOVE_UP': 'Move up',
        'MOVE_DOWN': 'Move down',
        'MOVE_LEFT': 'Move left',
        'MOVE_RIGHT': 'Move right',
        'TURN_LEFT': 'Turn left',
        'TURN_RIGHT': 'Turn right',
        'TURN_RIGHT_DOWN': 'Turn right down',
        'TURN_LEFT_DOWN': 'Turn left down',
        'STOP': 'Stop',
        'LIVE': 'Live',
        'REPLAY': 'Replay',
        'STOP': 'Stop',
        'PLAY': 'Play',
        'PAUSE': 'Pause',
        'GO_TO_TIME_IN_TIMELINE': 'Go to time in timeline',
        'CREATE_SNAPSHOT': 'Create snapshot',
        'FAST_FORWARD': 'Fast forward',
        'FAST_BACKWARD': 'Fast backward',
        'To_Begin': 'To begin',
        'To_End': 'To end',
        'DISCONNECT_VIDEO': 'Disconnect video',
        'ZOOM_IN': 'Zoom in',
        'ZOOM_OUT': 'Zoom out'
    };

    angular.module('app')
        .constant('URLS', urls)
        .constant('STREAM_FORMAT', streamFormat)
        .constant("DEVICE_TYPE", deviceType)
        .constant('FILTER_TYPES', filterTypes)
        .constant('LISTENER_NAMES', listenerNames)
        .constant('CAMERA_MODES', cameraModes)
        .constant('ACTIONS', actions)
        .constant('CAMERA_FILTER_OPTIONS', cameraFilterOptions)
        .constant('CANVAS_IDS', canvasIds)
        .constant('EVENT_TYPES', eventTypes)
        .constant('STREAM_TYPES', streamTypes)
        .constant('CAMERA_NAMES', cameraNames)
        .constant('TYPE_MESSAGES', typeMessages)
        .constant('TYPE_DEVICES', typeDevices)
        .constant('KEYBOARD_COMMAND', keyboardCommand);
})();
