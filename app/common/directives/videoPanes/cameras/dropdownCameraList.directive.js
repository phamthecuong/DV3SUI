(function() {
    'use strict';
    
    var dir = angular.module('dlvwc.panelCameras.directives');
    
    dir.directive("dropdownCameraList", dropdownCameraList);
    dir.directive("cameraTreeItem", cameraTreeItem);
    
    dropdownCameraList.$inject = ["ApiFactory", "PanesFactory", "$timeout", "LISTENER_NAMES", "CAMERA_NAMES"];
    
    cameraTreeItem.$inject = ["PanesFactory", "LISTENER_NAMES", "CAMERA_NAMES"];
    
    function dropdownCameraList(ApiFactory, PanesFactory, $timeout, listenerNames, cameraNames) {
        return {
            scope: false,
            templateUrl: 'common/directives/videoPanes/cameras/dropdownCameraList.html',
            controller: ctrlFn
        };
        
        function ctrlFn($scope) {
//            var listCameraTest = [
//                {
//                    channelId: '1',
//                    displayName: 'predic9klfjsdkfjdslkfjdslkfjdslkfjsdlkfjsdklf',
//                    type: 'Camera',
//                    channel_uri: 'c1'
//                },
//                {
//                    channelId: '2',
//                    displayName: 'predic10fdssdfdsfsdf',
//                    type: 'Camera',
//                    channel_uri: 'c2'
//                }
//            ];

            $scope.searchText = {
                "value": ''
            };
            $scope.activeViewIndex = 1;
            $scope.isListView = true;
            $scope.isGridView = false;
            $scope.isSearchView = false;
            
            $scope.camGroups = [
                { open: false, label: 'Cam Group 1', cams: null }, 
                { open: false, label: 'Cam Group 2', cams: null }, 
                { open: false, label: 'Cam Group 3', cams: null }
            ];
            
            if(window.navigator.onLine) { 
                $scope.camGroups[0].cams = [{
                    id: 1,
                    displayName: 'Offline Camera',
                    type: 'Camera',
                    channelId: 1
                }]
            }
            
            getChannels();
            
            /* ---------------------- HANDLE EVENTS ------------------------ */
            $scope.displayCamGroup = displayCamGroup;
            $scope.activeView = activeView;
            
            /* --------------------------- FUNCTION DETAILS --------------------------- */
            
            function activeView(index) {
                $timeout(function() { $scope.searchText.value = ''; });
                $scope.activeViewIndex = index;
                $scope.isSearchView = false;
                
                switch($scope.activeViewIndex) {
                    case 1:
                        $scope.isListView = true;
                        $scope.isGridView = false;
                        break;
                    case 2:
                        $scope.isListView = false;
                        $scope.isGridView = true;
                        break;
                    case 3:
                        $scope.isSearchView = true;
                        break;
                }
                $scope.$broadcast(listenerNames.UPDATE_SCROLLABLE);
            }
            
            function displayCamGroup(index) {
                $scope.camGroups[index].open = !$scope.camGroups[index].open;
                $scope.$broadcast(listenerNames.UPDATE_SCROLLABLE);
            }
            
            function getChannels() {
                 ApiFactory.getChannels().then(
                     function(res) {
                         $scope.camGroups[0].cams = res.data;
                         PanesFactory.setCameraList(res.data);
                     }, function() {
                         console.log("error getting getDv3sChannels");
                     }
                 )
                
//                $scope.camGroups[0].cams = [];
//                $scope.camGroups[0].cams.push(listCameraTest[0]);
//                $scope.camGroups[0].cams.push(listCameraTest[1]);
//                $scope.camGroups[0].cams.push(listCameraTest[2]);
//                $scope.camGroups[0].cams.push(listCameraTest[3]);
//                
//                PanesFactory.setCameraList($scope.camGroups[0].cams);
            }
        }
    }
    
    function cameraTreeItem(PanesFactory, listenerNames, cameraNames) {
        return {
            scope:  {
                itemData: "=cameraTreeItem",
                index: "=index"
            },
            link: linkFn
        };
        
        function linkFn(scope, element) {
            var el = $(element);
            var cameraListBox = $('#dropdownCameraList .box');
            var dragHelper = function() { return $('<div>').addClass('camera-item channel-drag-helper').appendTo('#dropdownCameraList'); };
            
            var dragOptions = {
                helper: function() { return dragHelper(); },
                cursorAt: { top: 45, left: 80 },
                revert: true,
                revertDuration: 250,
                scroll: false,
                appendTo: 'body',
                zIndex: 2000,
                delay: 250,
                start: function() {
                    cameraListBox.addClass('faded');
                    $(this).data('dragData', { channelObj: scope.itemData });
                },
                stop: function() {
                    cameraListBox.removeClass('faded');
                },
                handle: '.lbl, .icon'
            };
            
            /* ------------------------- HANDLE EVENTS ----------------------- */
            
            el.draggable(dragOptions);
            el.on('click', function(event) {
                if(scope.itemData.displayName === cameraNames.OFFILINE_CAMERA) { return; }

                PanesFactory.notifyEvent(listenerNames.OPEN_CAMERA_SELECT, { channelObj: scope.itemData });
            });
            
            /* ------------------------- FUNCTION DETAILS --------------------- */
        }
    }
})();