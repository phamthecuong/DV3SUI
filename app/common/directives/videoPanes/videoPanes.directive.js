(function() {
    "use strict";

    angular.module('dlvwc.videoPanes.directives').directive('videoPanes', videoPanes);

    videoPanes.$inject = ["LISTENER_NAMES", "PanesFactory",  "$translate", "CameraFactory"];

    function videoPanes(listenerNames, PanesFactory,  $translate, CameraFactory ) {
        return {
            scope: false,
            templateUrl: 'common/directives/videoPanes/videoPanes.html',
            controller: ctrFn
        };

        function ctrFn($scope, $translate, CameraFactory, EEPSettingsFactory) {
          $scope.displayTimeline = true;
          $scope.panelSlectedIndex = {};
          $scope.dlMapData = initialMapData('devicesMap');

          $scope.$watch(function () {
            return PanesFactory.getActiveSplitsIndex()
          }, resetFullPanelIndex);
          $scope.$watch(function () {
            return PanesFactory.getActivePaneIndex()
          }, resetFullPanelIndex);
          PanesFactory.subscribeEvent($scope, listenerNames.DISPLAY_TIMELINE, subscribeEventDisplayTimeline);
          PanesFactory.subscribeEvent($scope, listenerNames.FULL_SCREEN_PANNEL, displayFullPanel);

          initMapData();


          /* ----------------- FUNCTION DETAIL ------------------- */

          function initialMapData(mapId) {
            var mapSettings = EEPSettingsFactory.get('map');
            return {
              mapId: mapId,

              //center: { lat: mapSettings.mapCenter.coordinates[1], lng: mapSettings.mapCenter.coordinates[0], zoom: mapSettings.defaultZoom },
              incident: null,
              mediaEvents: [],
              devices: [],
              units: [],
              evidences: [],
              locationPicker: false,
              settings: {
                selections: {
                  point:          false,
                  radial:         false,
                  rectangular:    false
                }
              },
              callbacks: {
                point: function (data) {
                  console.log('Map default callback: point - data: ' + JSON.stringify(data));
                },
                radial: function (data) {
                  console.log('Map default callback: radial - data: ' + JSON.stringify(data));
                },
                rectangular: function (data) {
                  console.log('Map default callback: rectangular - data: ' + JSON.stringify(data));
                },
                bounds: function (data) {
                  console.log('Map default callback: bounds - data: ' + JSON.stringify(data));
                }
              }
            };
          }

          function resetFullPanelIndex() {
            $scope.panelSlectedIndex = {};
          }

          function subscribeEventDisplayTimeline() {
            $scope.displayTimeline = !$scope.displayTimeline;
          }

          function displayFullPanel(event, data) {
            if ($scope.panelSlectedIndex.fullPanel === data) {
              $scope.panelSlectedIndex = {};
              angular.element(".outer-container").removeClass("fullscreen-mobile");
            } else {
              $scope.panelSlectedIndex = {"fullPanel": data};
              angular.element(".outer-container").addClass("fullscreen-mobile");
            }

          }

          function resetFullpanel() {
            $scope.panelSlectedIndex = {};
          }

          function initMapData() {
            var cameras;

            CameraFactory.getAll({}, {}).$promise.then(function (result) {
              console.log('cameras before adding actions: ' + JSON.stringify(result));
              cameras = [];
              for (var i = 0; i < result.length; i++) {
                var camera = result[i];
                camera.action = [
                  {
                    //label: $translate.instant('map.exploreFootage'),
                    label: 'Ok',
                    callbackFn: exploreFootage,
                    data: {
                      deviceId: camera.id
                    }
                  }
                ];
                cameras.push(camera);
              }
              console.log('cameras after adding actions: ' + JSON.stringify(cameras));

              $scope.dlMapData.devices = cameras;


            /*  $scope.mapData.devices = [{
                              id: 1,
                              version: 1,
                              name: "camera6",
                              description: null,
                              uri: null,
                              location: {type: "Point", coordinates: [12.088482, 49.013721, 2.0]},
                              absoluteAngleDegrees: null,
                              ptzSupport: {
                                  id: 76,
                                  pan: [],
                                  tilt: [],
                                  zoom: [],
                                  focus: [],
                                  iris: [],
                                  autofocus: false,
                                  sessionLimit: 0,
                                  host: null,
                                  port: null
                              },
                              liveStreams: [{
                                  id: 0,
                                  dataBaseId: 78,
                                  width: 0,
                                  height: 0,
                                  fps: 0,
                                  mediaType: [],
                                  videoInputId: null,
                                  liveVideoInputId: null,
                                  ptzVideoInputId: null,
                                  recordingVideoInputId: null,
                                  multicastIp: null,
                                  multicastPort: null,
                                  rtspUri: 'rtsp://192.168.1.11/encoder1'
                              }],
                              recordingStreams: [{
                                  id: 0,
                                  dataBaseId: 79,
                                  width: 0,
                                  height: 0,
                                  fps: 0,
                                  mediaType: [],
                                  videoInputId: null,
                                  liveVideoInputId: null,
                                  ptzVideoInputId: null,
                                  recordingVideoInputId: null,
                                  multicastIp: null,
                                  multicastPort: null,
                                  recordingId: null,
                                  startTime: null,
                                  endTime: null,
                                  rtspUri: null
                              }],
                              recordedOn: null,
                              resourceLimit: 1,
                              encoderNumber: 6,
                              streamName: "camera6",
                              source: null,
                              semsyAreaCode: 0,
                              externalSystemId: "5",
                              locationId: null,
                              mobile: false,
                              imageUrl: null,
                              statuses: null,
                              streamInfo: null,
                              objectName: "camera6",
                              objectId: 77,
                              objectType: "VMSCamera",
                              actions: null,
                              action: [
                                  {
                                      label: 'test',
                                      callbackFn: function () {},
                                      data: {
                                          deviceId: 'testId'
                                      }
                                  }
                              ]
                          }];*/

            }, function (error) {
             // console.log(error);

            });

            // TODO update active objects

            console.log('mapData: ' + JSON.stringify($scope.dlMapData));
          }
        }

          function exploreFootage(camera) {
            // alert('Camera: ' + JSON.stringify(camera.deviceData.name));
            console.log('explore footage - camera: ' + JSON.stringify(camera));

          /*
            var testData = {
              action: "appendBackupToIncident",
              params: {
                incidentID: vmIncident.incidentCopy.id,
                incidentNbo: vmIncident.incidentCopy.incidentNbo,
                /!*
                                timeFrom: 1455527263000,
                                timeTo: 1455527263000,
                *!/
                encoderNumber: camera.originalEvent.encoderNumber,
                location: camera.originalEvent.location
              }
            };
            ActionFactory.add({}, testData).$promise.then(function success(result) {
              console.log('Action successfully posted.');
            }, function error(result) {
              console.log('Error posting action.');
            });
          }*/

        }
    }
})();
