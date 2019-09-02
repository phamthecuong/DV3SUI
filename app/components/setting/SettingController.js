(function() {
    'use strict';

    angular.module('app').controller('SettingController', SettingController);
    
    SettingController.$inject = ["$scope", "PanesFactory", "LISTENER_NAMES", "$filter", "SettingFactory", "$window", "$state", "$timeout", "UtilFactory", "SocketService"];
    
    function SettingController($scope ,PanesFactory, listenerNames, $filter, SettingFactory, $window, $state, $timeout, UtilFactory, SocketService) {

        var getkeyboardMap = SettingFactory.getkeyboardMap();
        var keyCodePrevent = SettingFactory.getKeyCodePrevent();
        var preIndexObj    = SettingFactory.getPreIndex();
		
        $scope.selectSetting 		= selectSetting;
        $scope.keyPressSetting 	    = keyPressSetting;
        $scope.hideSetting 			= hideSetting;
        $scope.focusInput 			= focusInput;
        $scope.activeTab            = activeTab;
        $scope.connectServer        = connectServer;
        $scope.changeServer         = false;
        
        $scope.dataSetting 			= angular.copy(SettingFactory.getDataSetting());
        $scope.shorcut 				= angular.copy(SettingFactory.getDataShorcut());
        $scope.hintPress 			= angular.copy(SettingFactory.getHintPress());
      	$scope.activeIndex          = SettingFactory.getActiveTab();
        $scope.serverUrl            = UtilFactory.getSignalingUrl();

        /* ------------------------ HANDLE FUNCTION ----------------------- */
       	
        angular.element($window).bind('resize', responsiveSetting);
       	
        SettingFactory.pressKeyBoard(false, 1);
        
        selectedDefault();
        hideSetting();

        /* ------------------------ FUNCTION DETAIL ----------------------- */

        function responsiveSetting() {
            if ($window.innerWidth <= 900) {
                $state.go("root.surveillance");
            }
        }

        function activeTab(tabIndex) {
            $scope.changeServer = (tabIndex < 3) ? false : true;
            $scope.activeIndex = tabIndex;
            
            if (tabIndex === 3) {return;}
        	$scope.$broadcast(listenerNames.UPDATE_SCROLLABLE);

            selectedDefault(preIndexObj[tabIndex]);
        }

        function connectServer(serverUrl) {
            UtilFactory.setSignalingUrl(serverUrl);
            SocketService.setSocket(serverUrl);
        }

        function selectedDefault(_preIndex) {
            _preIndex = _preIndex || preIndexObj[$scope.activeIndex];

        	if (_preIndex > 0) { return; }
        	$scope.dataSetting[$scope.activeIndex][_preIndex].setting = true;
        }

        function focusInput(e, groupIdx, index) {
            $scope.hintPress[groupIdx][index] = true;

            saveStateIndex(groupIdx, index);
            e.stopPropagation();
        }

        function hideSetting() {
        	angular.element(document).on('click', function(event) {
				if (!$(event.target).closest('.row-setting').length) {
                    $timeout(function() { clearHintPress(); });
				}
			});
        }

        function keyPressSetting(event, groupIdx, index) {
            if (keyCodePrevent.indexOf(event.keyCode) > -1) {return false;}
            
            var keyCodeObj = ($scope.dataSetting).map(function(sub){
                return sub.map(function(item){ 
                    return item.keyCode;
                });
            })

            for (var gIdx = 0; gIdx < keyCodeObj.length; gIdx ++) {
                var idx = keyCodeObj[gIdx].indexOf(event.keyCode);
                
                if (idx > -1) { saveStateKeyPress(gIdx, idx); break; }
            }

            clearHintPress(event);
            saveStateKeyPress(groupIdx, index, event.keyCode);
            saveSetting();
        }

        function selectSetting(groupIdx, index) {
        	clearHintPress();

        	$scope.preIndex = SettingFactory.getPreIndex()[groupIdx];
            $scope.dataSetting[groupIdx][index].setting = true;
            $scope.shorcut[groupIdx][index] = $scope.dataSetting[groupIdx][index].shorcut;

            if ($scope.preIndex !== index) { $scope.dataSetting[groupIdx][$scope.preIndex].setting = false; } 
            
            saveStateIndex(groupIdx, index);
            saveSetting();
        }

        function saveSetting() {
            SettingFactory.setDataSetting($scope.dataSetting);
        }

        function saveStateIndex(groupIdx, index) {
            preIndexObj[groupIdx] = index;
    		
            SettingFactory.setPreIndex(preIndexObj);
    		SettingFactory.setActiveTab(groupIdx);
        }

        function saveStateKeyPress(groupIdx, idx, keyCode) {
            var shorcut = getkeyboardMap[keyCode] || "";
            var keyCode = keyCode                 || "";
           
            $scope.shorcut[groupIdx][idx] = shorcut;
            $scope.dataSetting[groupIdx][idx].shorcut = shorcut;
            $scope.dataSetting[groupIdx][idx].keyCode = keyCode;
        }

        function clearHintPress(event) {
            $scope.hintPress = SettingFactory.getHintPress();

            if (angular.isDefined(event)) { event.target.blur(); }
        }

    }
})();