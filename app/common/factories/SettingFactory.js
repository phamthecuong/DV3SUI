(function(){
    'use strict';

    angular.module('app').factory('SettingFactory', SettingFactory);
    SettingFactory.$inject = ["$rootScope", "UiElements", "$window", "KEYBOARD_COMMAND", "PanesFactory", "$filter", "CAMERA_MODES", "LISTENER_NAMES", "EVENT_TYPES"];
   
    
    function SettingFactory($rootScope, UiElements, $window, keyboardCommand, PanesFactory, $filter, cameraModes, listenerNames, eventTypes){
        
        var keyboardMap = [
          "", // [0]
          "", // [1]
          "", // [2]
          "CANCEL", // [3]
          "", // [4]
          "", // [5]
          "HELP", // [6]
          "", // [7]
          "BACK_SPACE ", // [8]
          "TAB", // [9]
          "", // [10]
          "", // [11]
          "CLEAR", // [12]
          "ENTER", // [13]
          "ENTER_SPECIAL", // [14]
          "", // [15]
          "SHIFT", // [16]
          "Ctrl", // [17]
          "ALT", // [18]
          "PAUSE", // [19]
          "CAPS_LOCK", // [20]
          "KANA", // [21]
          "EISU", // [22]
          "JUNJA", // [23]
          "FINAL", // [24]
          "HANJA", // [25]
          "", // [26]
          "ESCAPE", // [27]
          "CONVERT", // [28]
          "NONCONVERT", // [29]
          "ACCEPT", // [30]
          "MODECHANGE", // [31]
          "SPACE", // [32]
          "PAGE_UP", // [33]
          "PAGE_DOWN", // [34]
          "END", // [35]
          "HOME", // [36]
          "LEFT", // [37]
          "UP", // [38]
          "RIGHT", // [39]
          "DOWN", // [40]
          "SELECT", // [41]
          "PRINT", // [42]
          "EXECUTE", // [43]
          "PRINTSCREEN", // [44]
          "INSERT", // [45]
          "DELETE", // [46]
          "", // [47]
          "0", // [48]
          "1", // [49]
          "2", // [50]
          "3", // [51]
          "4", // [52]
          "5", // [53]
          "6", // [54]
          "7", // [55]
          "8", // [56]
          "9", // [57]
          "COLON", // [58]
          "SEMICOLON", // [59]
          "LESS_THAN", // [60]
          "EQUALS", // [61]
          "GREATER_THAN", // [62]
          "QUESTION_MARK", // [63]
          "AT", // [64]
          "A", // [65]
          "B", // [66]
          "C", // [67]
          "D", // [68]
          "E", // [69]
          "F", // [70]
          "G", // [71]
          "H", // [72]
          "I", // [73]
          "J", // [74]
          "K", // [75]
          "L", // [76]
          "M", // [77]
          "N", // [78]
          "O", // [79]
          "P", // [80]
          "Q", // [81]
          "R", // [82]
          "S", // [83]
          "T", // [84]
          "U", // [85]
          "V", // [86]
          "W", // [87]
          "X", // [88]
          "Y", // [89]
          "Z", // [90]
          "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
          "", // [92]
          "CONTEXT_MENU", // [93]
          "", // [94]
          "SLEEP", // [95]
          "NUMPAD0", // [96]
          "NUMPAD1", // [97]
          "NUMPAD2", // [98]
          "NUMPAD3", // [99]
          "NUMPAD4", // [100]
          "NUMPAD5", // [101]
          "NUMPAD6", // [102]
          "NUMPAD7", // [103]
          "NUMPAD8", // [104]
          "NUMPAD9", // [105]
          "MULTIPLY", // [106]
          "ADD", // [107]
          "SEPARATOR", // [108]
          "SUBTRACT", // [109]
          "DECIMAL", // [110]
          "DIVIDE", // [111]
          "F1", // [112]
          "F2", // [113]
          "F3", // [114]
          "F4", // [115]
          "F5", // [116]
          "F6", // [117]
          "F7", // [118]
          "F8", // [119]
          "F9", // [120]
          "F10", // [121]
          "F11", // [122]
          "F12", // [123]
          "F13", // [124]
          "F14", // [125]
          "F15", // [126]
          "F16", // [127]
          "F17", // [128]
          "F18", // [129]
          "F19", // [130]
          "F20", // [131]
          "F21", // [132]
          "F22", // [133]
          "F23", // [134]
          "F24", // [135]
          "", // [136]
          "", // [137]
          "", // [138]
          "", // [139]
          "", // [140]
          "", // [141]
          "", // [142]
          "", // [143]
          "NUM_LOCK", // [144]
          "SCROLL_LOCK", // [145]
          "WIN_OEM_FJ_JISHO", // [146]
          "WIN_OEM_FJ_MASSHOU", // [147]
          "WIN_OEM_FJ_TOUROKU", // [148]
          "WIN_OEM_FJ_LOYA", // [149]
          "WIN_OEM_FJ_ROYA", // [150]
          "", // [151]
          "", // [152]
          "", // [153]
          "", // [154]
          "", // [155]
          "", // [156]
          "", // [157]
          "", // [158]
          "", // [159]
          "CIRCUMFLEX", // [160]
          "EXCLAMATION", // [161]
          "DOUBLE_QUOTE", // [162]
          "HASH", // [163]
          "DOLLAR", // [164]
          "PERCENT", // [165]
          "AMPERSAND", // [166]
          "UNDERSCORE", // [167]
          "OPEN_PAREN", // [168]
          "CLOSE_PAREN", // [169]
          "ASTERISK", // [170]
          "PLUS", // [171]
          "PIPE", // [172]
          "HYPHEN_MINUS", // [173]
          "OPEN_CURLY_BRACKET", // [174]
          "CLOSE_CURLY_BRACKET", // [175]
          "TILDE", // [176]
          "", // [177]
          "", // [178]
          "", // [179]
          "", // [180]
          "VOLUME_MUTE", // [181]
          "VOLUME_DOWN", // [182]
          "VOLUME_UP", // [183]
          "", // [184]
          "", // [185]
          ";", // [186]
          "=", // [187]
          ",", // [188]
          "-", // [189]
          ".", // [190]
          "/", // [191]
          "`", // [192]
          "", // [193]
          "", // [194]
          "", // [195]
          "", // [196]
          "", // [197]
          "", // [198]
          "", // [199]
          "", // [200]
          "", // [201]
          "", // [202]
          "", // [203]
          "", // [204]
          "", // [205]
          "", // [206]
          "", // [207]
          "", // [208]
          "", // [209]
          "", // [210]
          "", // [211]
          "", // [212]
          "", // [213]
          "", // [214]
          "", // [215]
          "", // [216]
          "", // [217]
          "", // [218]
          "[", // [219]
          "BACK_SLASH", // [220]
          "]", // [221]
          "'", // [222]
          "", // [223]
          "META", // [224]
          "ALTGR", // [225]
          "", // [226]
          "WIN_ICO_HELP", // [227]
          "WIN_ICO_00", // [228]
          "", // [229]
          "WIN_ICO_CLEAR", // [230]
          "", // [231]
          "", // [232]
          "WIN_OEM_RESET", // [233]
          "WIN_OEM_JUMP", // [234]
          "WIN_OEM_PA1", // [235]
          "WIN_OEM_PA2", // [236]
          "WIN_OEM_PA3", // [237]
          "WIN_OEM_WSCTRL", // [238]
          "WIN_OEM_CUSEL", // [239]
          "WIN_OEM_ATTN", // [240]
          "WIN_OEM_FINISH", // [241]
          "WIN_OEM_COPY", // [242]
          "WIN_OEM_AUTO", // [243]
          "WIN_OEM_ENLW", // [244]
          "WIN_OEM_BACKTAB", // [245]
          "ATTN", // [246]
          "CRSEL", // [247]
          "EXSEL", // [248]
          "EREOF", // [249]
          "PLAY", // [250]
          "ZOOM", // [251]
          "", // [252]
          "PA1", // [253]
          "WIN_OEM_CLEAR", // [254]
          "" // [255]
        ];

        var ptzSetting = [
            {command: keyboardCommand.MOVE_UP, shorcut: "W", keyCode: 87, setting: false},
            {command: keyboardCommand.MOVE_DOWN, shorcut: "S", keyCode: 83, setting: false},
            {command: keyboardCommand.MOVE_LEFT, shorcut: "A", keyCode: 65, setting: false},
            {command: keyboardCommand.MOVE_RIGHT, shorcut: "D", keyCode: 68, setting: false},
            {command: keyboardCommand.TURN_LEFT, shorcut: "Q", keyCode: 81, setting: false},
            {command: keyboardCommand.TURN_RIGHT, shorcut: "E", keyCode: 69, setting: false},
            {command: keyboardCommand.TURN_RIGHT_DOWN, shorcut: "C", keyCode: 67, setting: false},
            {command: keyboardCommand.TURN_LEFT_DOWN, shorcut: "Z", keyCode: 90, setting: false},
            {command: keyboardCommand.ZOOM_OUT, shorcut: "-", keyCode: 189, setting: false},
            {command: keyboardCommand.ZOOM_IN, shorcut: "+", keyCode: 187, setting: false}
        ];

        var cameraSetting = [
            {command: keyboardCommand.STOP, shorcut: "R", keyCode: 82, setting: false},
            {command: keyboardCommand.LIVE, shorcut: "L", keyCode: 76, setting: false},
            {command: keyboardCommand.REPLAY, shorcut: "K", keyCode: 75, setting: false},
            {command: keyboardCommand.PLAY, shorcut: "J", keyCode: 74, setting: false},
            {command: keyboardCommand.PAUSE, shorcut: "H", keyCode: 72, setting: false},
            {command: keyboardCommand.FAST_FORWARD, shorcut: "G", keyCode: 71, setting: false},
            {command: keyboardCommand.FAST_BACKWARD, shorcut: "F", keyCode: 70, setting: false},
            {command: keyboardCommand.GO_TO_TIME_IN_TIMELINE, shorcut: "O", keyCode: 79, setting: false},
            {command: keyboardCommand.To_End, shorcut: "T", keyCode: 84, setting: false},
            {command: keyboardCommand.To_Begin, shorcut: "Y", keyCode: 89, setting: false},
            {command: keyboardCommand.DISCONNECT_VIDEO, shorcut: "Delete", keyCode: 46, setting: false},
        ];

        var timelineSetting = [
            {command: keyboardCommand.CREATE_SNAPSHOT, shorcut: "I", keyCode: 73, setting: false}
        ];

        var dataSetting     = [];
        var cameraListCmd   = [];
        var dataShorcut     = [];
        var hintPress       = [];
        var keyCodeSpecial  = [9, 32]; //tab, space
        var keyCodePrevent  = [27]; // escape
        var preIndex        = [];
        var groupIdx        = 0
        var activeIndex     = 0;
        var sectionDetail   = {};
        var event           = {};

        var services = {
            inserEvent: inserEvent,

            keyboardToggle: keyboardToggle,

            getActiveTab: getActiveTab,
            setActiveTab: setActiveTab,

            pressKeyBoard: pressKeyBoard,

            getPreIndex: getPreIndex,
            setPreIndex:setPreIndex,

            getHintPress: getHintPress,

            getDataShorcut: getDataShorcut,

            getKeyCodeSpecial: getKeyCodeSpecial,
            getKeyCodePrevent: getKeyCodePrevent,

            getCameraCommand: getCameraCommand,

            getDataSetting: getDataSetting,
            setDataSetting: setDataSetting,

            getkeyboardMap: getkeyboardMap,
        };

        return services;

        /* ------------------------- FUNCTION DETAIL ------------------------ */

        function pressKeyBoard (_keyboardToggle, isSetting) {
            document.onkeydown = function(e) {
                if ( angular.isDefined(isSetting) && keyCodeSpecial.indexOf(e.keyCode) >= 0) { return false;}
            }
            document.onkeyup = function(e) {
                if (_keyboardToggle) { handlePressKey(e.keyCode); }
            }
        }

        function handlePressKey(keyCode) {
            console.log("keyCode", keyCode);
            var dataObj = ([].concat.apply([], getDataSetting()));
            var item = $filter('filter')(dataObj, {keyCode: parseInt(keyCode)}, true)[0];
            if (typeof(item) === 'undefined') {return;}
            switch(PanesFactory.getActivePaneMode()) {
                case cameraModes.LIVE: 
                    handleInLiveMode(item);
                    break;
                case cameraModes.REPLAY: 
                    handleInReplayMode(item);
                    break;
                default: 
                    selectCamera(keyCode);
            }
        }

        function handleDefault(item) {
            switch (item.command) {
                case keyboardCommand.GO_TO_TIME_IN_TIMELINE:
                    handleEvent(listenerNames.KEYBOARD_EDIT_DATE_AND_TIME);
                    break;
                case keyboardCommand.CREATE_SNAPSHOT:
                    handleEvent(listenerNames.KEYBOARD_EVENT_CREATE_SNAPSHOT);
                    break;
                case keyboardCommand.DISCONNECT_VIDEO:
                    handleEvent(listenerNames.KEYBOARD_DISCONECT_VIDEO);
                    break;
            }
        }

        function handleInLiveMode(item) {
            switch (item.command) {
                case keyboardCommand.MOVE_UP:
                    cameraMove(0, 0.5, 0);
                    break;
                case keyboardCommand.MOVE_DOWN:
                    cameraMove(0, -0.5, 0)
                    break;
                case keyboardCommand.MOVE_LEFT:
                    cameraMove(-0.5, 0, 0)
                    break;
                case keyboardCommand.MOVE_RIGHT:
                    cameraMove(0.5, 0, 0)
                    break;
                case keyboardCommand.TURN_RIGHT:
                    cameraMove(0.5, 0.5, 0)
                    break;
                case keyboardCommand.TURN_LEFT:
                    cameraMove(-0.5, 0.5, 0)
                    break;
                case keyboardCommand.TURN_LEFT_DOWN:
                    cameraMove(-0.5, -0.5, 0);
                    break;
                case keyboardCommand.TURN_RIGHT_DOWN:
                    cameraMove(0.5, -0.5, 0);
                    break;
                case keyboardCommand.STOP:
                    cameraMove(0, 0, 0);
                    break;
                case keyboardCommand.REPLAY:
                    handleEvent(listenerNames.KEYBOARD_SWITCH_MODE, cameraModes.REPLAY);
                    break;
                case keyboardCommand.ZOOM_IN:
                    handleEvent(listenerNames.ZOOM_CAMERA, 0.25);
                    break;
                case keyboardCommand.ZOOM_OUT:
                    handleEvent(listenerNames.ZOOM_CAMERA, -0.25);
                    break;
                default: handleDefault(item);
            }
        }

        function handleInReplayMode(item) {
            switch (item.command) {
                case keyboardCommand.LIVE:
                    handleEvent(listenerNames.KEYBOARD_SWITCH_MODE, cameraModes.LIVE);
                    break;
                case keyboardCommand.PLAY:
                    handleEvent(listenerNames.KEYBOARD_ACTION);
                    break;
                case keyboardCommand.PAUSE:
                    handleEvent(listenerNames.KEYBOARD_ACTION);
                    break;
                case keyboardCommand.FAST_FORWARD:
                    handleEvent(listenerNames.KEYBOARD_ACTION, actions.FASTFORWARD);
                    break;
                case keyboardCommand.FAST_BACKWARD:
                    handleEvent(listenerNames.KEYBOARD_ACTION, actions.FASTBACKWARD);
                    break;
                case keyboardCommand.To_End:
                    handleEvent(listenerNames.KEYBOARD_ACTION, actions.TOEND);
                    break;
                case keyboardCommand.To_Begin:
                    handleEvent(listenerNames.KEYBOARD_ACTION, actions.TOBEGIN);
                    break;
                default: handleDefault(item);
            }
        }

        function selectCamera(keyCode) {
            var keyCodeCamera = (getDataSetting()[1]).map(function(item){return item.keyCode;});
            var data = PanesFactory.getCameraList()[keyCodeCamera.indexOf(keyCode)];
            if (data) { handleEvent(listenerNames.OPEN_CAMERA_SELECT, {channelObj: data}); }
        }

        function handleEvent(listenerNames, data) {
            PanesFactory.notifyEvent(listenerNames, data);
        }

        function cameraMove(x,y,z) {
            var data = {};
            data.x = x;
            data.y = y;
            data.z = z;
            PanesFactory.notifyEvent(listenerNames.CAMERA_MOVE, data);
        }

        function getActiveTab() {
            if ($window.sessionStorage.activeTab) {
                return parseInt($window.sessionStorage.activeTab);
            }
            return activeIndex;
        }

        function setActiveTab(_index) {
            $window.sessionStorage.activeTab = _index;
        }

        function getPreIndex() {
            if ($window.sessionStorage.preIdx) {
                return JSON.parse($window.sessionStorage.preIdx);
            }
            
            for (var i = 0; i < getDataSettingDefault().length; i++) {
                preIndex[i] = 0;
            }
            return preIndex;
        }

        function setPreIndex(_preIndex) {
            $window.sessionStorage.preIdx = JSON.stringify(_preIndex);
        }

        function getHintPress() {
            for (var i = 0; i < getDataSettingDefault().length; i++) {
                hintPress[i] = [];
            }
            return hintPress;
        }

        function getDataShorcut() {
            for (var i = 0; i < getDataSettingDefault().length; i++) {
                dataShorcut[i] = [];
            }
            return dataShorcut;
        }

        function getKeyCodeSpecial() {
            return keyCodeSpecial;
        }

        function getKeyCodePrevent() {
            return keyCodePrevent;
        }

        function getDataSetting() {
            if ($window.sessionStorage.dataSetting) {
              return JSON.parse($window.sessionStorage.dataSetting);
            } 
            return getDataSettingDefault();
        }

        function getDataSettingDefault() {
            dataSetting = [];
            dataSetting.push(ptzSetting);
            dataSetting.push(getCameraCommand().concat(cameraSetting));
            dataSetting.push(timelineSetting);
            return dataSetting;
        }

        function setDataSetting(_dataSetting) {
            $window.sessionStorage.dataSetting = JSON.stringify(_dataSetting);
        }

        function getCameraCommand() {
            cameraListCmd = [];
            cameraListCmd = (PanesFactory.getCameraList()).map(function(item, index) {
                var keyCode = index;
                var obj =  {
                              command: "Camera " + item.displayName, 
                              shorcut: index, keyCode: convertToKeyCode(keyCode.toString()), 
                              setting: false
                            };
                return obj;
            });
            return cameraListCmd;
        }

        function convertToKeyCode(target) {
            var keyCode = target.charCodeAt(0);
            return keyCode;
        }

        function getkeyboardMap() {
            return keyboardMap;
        }

        function keyboardToggle() {
            PanesFactory.notifyEvent(listenerNames.KEYBOARD_TOGGLE);
        } 

        function inserEvent(imageUrl) {
          var imageObj = [];
              imageObj.push(imageUrl);
          var event = {
                title: "keyboard snapshot",
                content: "Event from keyborad shapshot",
                time: moment(),
                typeEvent: eventTypes.EVENT_SNAPSHOT,
                channelId: PanesFactory.getActiveChannelId(),
                images: imageObj
            }
            
          PanesFactory.notifyEvent(listenerNames.INSERT_EVENT_SNAPSHOT, event);
        }
    }

})();