

var module = angular.module('dlmap', [
    'dlmap.factories',
    'dlmap.directives',
    'dlmap.filters',
]);

module.provider('Map', [ function () {

    var config;

    return {

        setConfig: function ( _config ) {

            config = _config;

            console.info('[MapProvider] setConfig():');
            console.log(config);

        },
        $get: function () {
            return {
                config: config
            };
        }

    };

}]);

module.config(["$logProvider", function($logProvider){
    $logProvider.debugEnabled(false);
}]);


(function () {

var mapServices = angular.module('dlmap.factories',[]);

mapServices.service('MapStyles', [ function () {

    var asa = 'https://asa-staging.dallmeier.com';

    this.styles = {
        osm: {
            name: 'OpenStreetMap',
            type: 'xyz',
            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            visible: false,
            appTheme: 'bright',
            layerOptions: {
                subdomains: ['a', 'b', 'c'],
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                continuousWorld: true
            }
        },
        cycle: {
            name: 'OpenCycleMap',
            type: 'xyz',
            url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
            visible: false,
            appTheme: 'bright',
            layerOptions: {
                subdomains: ['a', 'b', 'c'],
                attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                continuousWorld: true
            }
        },

        cartodbDark: {
            id: 'cartodbDark',
            label: 'Dark',
            name: 'CartoDb Black',
            type: 'xyz',
            url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            visible: false,
            appTheme: 'dark',
            layerOptions: {
                subdomains: ['a', 'b', 'c'],
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                continuousWorld: true
            },
            options: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            }
        },

         cartodbBright: {
            id: 'cartodbBright',
            label: 'Bright',
            name: 'CartoDb White',
            type: 'xyz',
            url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            visible: false,
            appTheme: 'dark',
            layerOptions: {
                subdomains: ['a', 'b', 'c'],
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                continuousWorld: true
            },
            options: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            }
        },

        asaDallmeier: {
            id: 'asaDallmeier',
            label: 'Dallmeier',
            name: 'Dallmeier',
            type: 'xyz',
            url: asa+'/osm/{z}/{x}/{y}.png',
            visible: false,
            appTheme: 'bright',
            layerOptions: {
                subdomains: ['a', 'b', 'c'],
                attribution: '',
                continuousWorld: true
            },
            options: {
                attribution: ''
            }
        },
        esri: {
            id: 'esri',
            label: 'Esri',
            name: 'Esri',
            type: 'xyz',
            url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            visible: false,
            appTheme: 'bright',
            layerOptions: {
                subdomains: ['a', 'b', 'c'],
                attribution: '',
                continuousWorld: true
            },
            options: { attribution: '' }
        }
    };

    return this;

}]);

mapServices.factory('MapModuleFactory', [ 'Map', 'MapStyles', 'MarkerIconFactory', function ( Map, MapStyles, MarkerIconFactory ) {

    console.group('[MapModuleFactory] Map Config');
    console.log(Map.config);
    console.groupEnd();

    var _mapStyle = Map.config.mapStyle ? MapStyles.styles[Map.config.mapStyle] : MapStyles.styles.cartodbDark;

    var _appTheme = Map.config.theme ? Map.config.theme : 'dark';


    this.locationFinderActive = false;

//    var _mapCenter,
//        _currentZoom,
//        _bounds,
//        _focusIncident,
//        _importedEvents,
//        _importedUnits,
//        _importedDevices,
//        _mediaEvents,
//        _filteredMediaEvents,
//        _anprEvents,
//        _units,
//        _filteredUnits,
//        _devices,
//        _mediaEventsFilter,
//        _unitsFilter,
//        _evidences,
//        _openedPopup,
//        _hoverPath,
//        _paths = false;

    var _mapCenter = false;
    var _currentZoom = false;
    var _bounds = false;
    var _currentCenter = false;
    var _focusIncident = false;
    var _importedEvents = false;
    var _importedUnits = false;
    var _importedDevices = false;
    var _mediaEvents = false;
    var _filteredMediaEvents = false;
    var _anprEvents = false;
    var _units = false;
    var _filteredUnits = false;
    var _devices = false;
    var _mediaEventsFilter = false;
    var _unitsFilter = false;
    var _evidences = false;
    var _openedPopup = false;
    var _hoverPath = false;
    var _paths = false;

    _currentZoom = Map.config.map.center.zoom ? Map.config.map.center.zoom : 14;

/*  ---------------------------------------------------------------------- */

    var _map = {
        tiles: _mapStyle,
        defaults: Map.config.map.defaults,
        controls: Map.config.map.controls,
        center: Map.config.map.center,
        paths: {},
        layers: {},
        markers: {},
        geojson: {}
    };

/*  ---------------------------------------------------------------------- */

    this.showMediaEvents    = false;
    this.showAnprEvents     = false;
    this.showUnits          = false;
    this.showDevices        = true;

    this.showHideMarkers = function ( _type, _show ) {
        this[_type] = _show;
    };

/*  ---------------------------------------------------------------------- */

    var dlMapData = function ( _data ) {};

    var clearModule = function () {
        console.info('--- MapModuleFactory.clearModule() ---');
//        _focusIncident = false;
        _mapCenter = false;
//        _currentZoom = false;
//        _bounds = false;
        _focusIncidents = false;
        _mediaEvents = false;
        _anprEvents = false;
//        _filteredMediaEvents = false;
    };

    var setAppTheme = function ( theme ) {
        _appTheme = theme;
    };
    var getAppTheme = function () {
        return _appTheme;
    };

    var setMap = function ( defaults ) {
        _map = defaults;
    };
    var getMap = function () {
        return _map;
    };

    var setMapStyle = function ( style ) {
        _mapStyle = MapStyles.styles[style];
    };
    var getMapStyle = function () {
        return _mapStyle;
    };

    var setMapCenter = function ( data ) {
        _mapCenter = data;
    };
    var getMapCenter = function () {
        return _mapCenter;
    };

    var setCurrentZoom = function ( value ) {
        _currentZoom = value;
    };
    var getCurrentZoom = function () {
        return _currentZoom;
    };

    var setBounds = function ( bounds ) {
        _bounds = bounds;
    };
    var getBounds = function () {
        return _bounds;
    };

    var setCurrentCenter = function ( value ) {
        _currentCenter = value;
    };
    var getCurrentCenter = function () {
        return _currentCenter;
    };

    var setFocusIncident = function ( _obj ) {
        if ( !_obj ) {
            _focusIncident = false;
            return;
        }
        _focusIncident = {
            id:         'focusIncident',
            type:       'focusIncident',
            markerType: 'focusIncident',
            name:       'FOCUS INCIDENT',
            lat:        _obj.lat,
            lng:        _obj.lng,
            icon:       MarkerIconFactory.createMarker('focusIncident',null),
            data:       _obj.data
        };
    };
    var getFocusIncident = function () {
        return _focusIncident;
    };

    var importEvents = function ( events ) {
        _importedEvents = events;
        _mediaEvents = _parseImportedEvents( events ).media;
        _anprEvents = _parseImportedEvents( events ).anpr;
        console.group('[mapModuleFactory] importEvents(): parsed events:');
        console.log( _parseImportedEvents( events ) );
        console.groupEnd();
        setMediaEventsFilter( _parseImportedEvents( events ).mediaFilters );
    };
    var getImportedEvents = function () {
        return _importedEvents;
    };

    var setMediaEvents = function ( mediaEvents ) {
        _mediaEvents = mediaEvents;
    };
    var getMediaEvents = function ( id ) {
        return id ? _mediaEvents['MediaEvent_'+id] : _filteredMediaEvents;
    };

    var setAnprEvents = function ( anprEvents ) {
        _anprEvents = anprEvents;
    };
    var getAnprEvents = function ( id ) {
        return id ? _anprEvents['AnprEvent_'+id] : _anprEvents;
    };

    var setMediaEventsFilter = function ( filterObj ) {
        _mediaEventsFilter = filterObj;
        _filteredMediaEvents = {};
        angular.forEach( _mediaEvents, function ( obj, index ) {
            if ( _mediaEventsFilter[obj.mediaData.mediaType].active ) {
                _filteredMediaEvents[index] = obj;
            }
        });
    };
    var getMediaEventsFilter = function () {
        return _mediaEventsFilter;
    };

    var importUnits = function ( collection ) {
        _units = _parseImportedUnits( collection.content ).data;
        setUnitsFilter( _parseImportedUnits( collection.content ).filter );
    };
    var getUnits = function ( id ) {
//        return id ? _units['Unit_'+id] : _units;
        return id ? _units['Unit_'+id] : _filteredUnits;
    };

    var setUnitsFilter = function ( filterObj ) {
        _unitsFilter = filterObj;
        _filteredUnits = {};
        angular.forEach( _units, function ( obj, index ) {
            if ( _unitsFilter[obj.unitData.unitType] && _unitsFilter[obj.unitData.unitType].active ) {
                _filteredUnits[index] = obj;
            }
        });
    };
    var getUnitsFilter = function () {
        return _unitsFilter;
    };

    var importDevices = function ( collection ) {
        _devices = _parseImportedDevices( collection );
    };
    var getDevices = function ( id ) {
        return id ? _devices['Device_'+id] : _devices;
    };

    var clearDevices = function () {
      _devices = false;
    };

    var importEvidences = function ( collection ) {
        _evidences = _parseImportedEvidences( collection );
        console.group('[mapModuleFactory] importEvidences(): parsed evidences:');
        console.log( _evidences );
        console.groupEnd();
    };
    var getEvidences = function ( id ) {
//        return _evidences;
        return id ? _evidences['Evidence_'+id] : _evidences;
    };
    var getEvidenceById = function ( id ) {
        return _evidences['Evidence_'+id] ? _evidences['Evidence_'+id] : false;
    };

    var setOpenedPopup = function ( type, id ) {
        _openedPopup = type && id ? { type: type, id: id } : false;
    };
    var getOpenedPopup = function () {
        return _openedPopup;
    };

    var setHoverPath = function ( paths ) {
        _hoverPath = paths;
    };
    var getHoverPath = function () {
        return _hoverPath;
    };

/*  ---------------------------------------------------------------------- */

    var _countries;

    var setCountries = function ( data ) {
        console.group('--- countries data ---');
        console.log(data);
        console.groupEnd();
        _countries = data;
    };

    var getCountries = function () {
        return _countries;
    };

    this.setCountries = setCountries;
    this.getCountries = getCountries;

    var _sampleGeoJson = false;

    /*
//    var _sampleGeoJson = {
//      "type": "FeatureCollection",
//      "features": [
//        {
//          "type": "Feature",
//          "properties": {},
//          "geometry": {
//            "type": "LineString",
//            "coordinates": [
//              [
//                12.09520697593689,
//                49.012062755694416
//              ],
//              [
//                12.095190882682799,
//                49.012305533150766
//              ],
//              [
//                12.095255255699158,
//                49.012309051655926
//              ],
//              [
//                12.095255255699158,
//                49.012273866593176
//              ],
//              [
//                12.095282077789307,
//                49.01227034808553
//              ],
//              [
//                12.095265984535217,
//                49.01243571767597
//              ],
//              [
//                12.097390294075012,
//                49.01245682864797
//              ],
//              [
//                12.0974063873291,
//                49.012319607169914
//              ],
//              [
//                12.097492218017576,
//                49.01231257016082
//              ],
//              [
//                12.097492218017576,
//                49.012407569699356
//              ],
//              [
//                12.097561955451965,
//                49.01240405120117
//              ],
//              [
//                12.097561955451965,
//                49.01233368118506
//              ],
//              [
//                12.097583413124084,
//                49.01233368118506
//              ],
//              [
//                12.097583413124084,
//                49.01244627316309
//              ],
//              [
//                12.098060846328735,
//                49.01245682864797
//              ],
//              [
//                12.098189592361448,
//                49.01245331015325
//              ],
//              [
//                12.09818422794342,
//                49.01206627421672
//              ],
//              [
//                12.097991108894348,
//                49.01206627421672
//              ],
//              [
//                12.097991108894348,
//                49.01204868160268
//              ],
//              [
//                12.096043825149536,
//                49.01202405193255
//              ],
//              [
//                12.096043825149536,
//                49.01206627421672
//              ],
//              [
//                12.095228433609007,
//                49.012062755694416
//              ]
//            ]
//          }
//        }
//      ]
//    };
*/

    var getSampleGeoJson = function () {
        return _sampleGeoJson;
    };

    this.getSampleGeoJson = getSampleGeoJson;

/*  ---------------------------------------------------------------------- */

    function _parseMediaEventCollection ( collection ) {
        return collection;
    }

    function _parseImportedEvents ( eventsCollection ) {
        var mediaEv = {};
        var anprEv = {};
        var mediaEvFilters = {};
        angular.forEach( eventsCollection, function ( eventObj ) {
            if ( eventObj.type==='MediaEvent' ) {
                if ( eventObj.categorization.value === 'text/plain' ) { return; }
                mediaEvFilters[_mediaType(eventObj.categorization.value)] = {
                    label: _mediaType(eventObj.categorization.value),
                    active: true
                };
//                console.log('--- isEvidenced: ');
//                console.log(_evidences);
                var mediaData = {
                    timestamp: eventObj.timeStampMillis,
                    mediaType: _mediaType(eventObj.categorization.value),
                    category: eventObj.categorization.category,
                    mediaStorageUrl: eventObj.mediaAttachments[0].url,
                    author: eventObj.author,
                    id: eventObj.id,
                    evidenced: getEvidenceById(eventObj.id) ? true : false
                };
                mediaEv['MediaEvent_'+eventObj.id] = {
                    id: 'MediaEvent'+eventObj.id,
                    group: 'MediaEventGroup'+new Date().getTime(),
                    type: 'MediaEvent',
                    markerType: 'MediaEvent',
                    name: 'MediaEvent'+eventObj.id,
                    lat: eventObj.location.coordinates[1],
                    lng: eventObj.location.coordinates[0],
                    icon: MarkerIconFactory.createMarker('MediaEvent',mediaData),
                    mediaData: mediaData,
                    message: '<div marker-popup type="MediaEvent" id="'+eventObj.id+'"></div>',
                    action: eventObj.action,
                    originalEvent: eventObj
                };
            }
            if ( eventObj.type==='ANPREvent' ) {
//                anprEv['AnprEvent_'+eventObj.id] = eventObj;
                var anprData = {};
                anprEv['AnprEvent_'+eventObj.id] = {
                    id: 'AnprEvent'+eventObj.id,
                    group: 'AnprEventGroup'+new Date().getTime(),
                    type: 'AnprEvent',
                    markerType: 'AnprEvent',
                    name: 'AnprEvent'+eventObj.id,
                    lat: eventObj.location.coordinates[1],
                    lng: eventObj.location.coordinates[0],
                    icon: MarkerIconFactory.createMarker('AnprEvent',anprData),
//                    mediaData: mediaData,
                    message: '<div marker-popup type="AnprEvent" id="'+eventObj.id+'"></div>',
                    action: eventObj.action,
                    originalEvent: eventObj
                };
            }
        });
//        L.markerClusterGroup().refreshClusters();
        return {
            media: mediaEv,
            anpr: anprEv,
            mediaFilters: mediaEvFilters
        };
    }

    function _mediaType ( mimeType ) {
        var type;
        switch ( mimeType ) {
            case 'image/jpeg':
            case 'image/jpg':
            case 'image/png':
            case 'image/gif':
            case 'image/bmp':
                type = 'picture';
                break;
            case 'video/mp4':
            case 'video/mpeg':
            case 'video/mov':
            case 'video/ogg':
            case 'video/quicktime':
                type = 'video';
                break;
            case 'audio/mp3':
            case 'audio/wav':
                type = 'audio';
                break;
        }
        return type;
    }

    function _deviceType ( t ) {
        var type;
        switch ( t ) {
            case 'VMSCamera':
                type = 'camera';
                break;
        }
        return type;
    }

    function _parseImportedUnits ( unitsCollection ) {
        var units = {};
        var unitsFilters = {};
        angular.forEach( unitsCollection, function ( unitObj, index ) {
            var unitData = {
                id: unitObj.entity.id,
                ts: unitObj.entity.timeStampCreated,
                vehicle: unitObj.entity.vehicle,
                unitType: unitObj.entity.vehicle ? unitObj.entity.vehicle.vehicleType : 'Police',
                status: unitObj.entity.status,
                available: unitObj.entity.status==='AVAILABLE' ? true : false,
                route: unitObj.route,
                distanceTime: unitObj.travelTimeSeconds,
                persons: unitObj.entity.persons,
                unitIdentifier: unitObj.entity.uniqueIdentifier
            };
            unitsFilters[unitData.unitType] = {
                label: unitData.unitType,
                active: true
            };
            units['Unit_'+unitObj.entity.id] = {
                id: 'Unit'+unitObj.entity.id,
                group: 'UnitGroup'+new Date().getTime(),
                type: 'Unit',
                markerType: 'Unit',
                lat: unitObj.entity.location.coordinates[1],
                lng: unitObj.entity.location.coordinates[0],
                icon: MarkerIconFactory.createMarker('Unit',unitData),
                unitData: unitData,
                message: '<div marker-popup type="Unit" id="'+unitObj.entity.id+'"></div>',
                label: {},
                action: unitObj.action,
                originalEvent: unitObj
            };
        });
        return {
            data: units,
            filter: unitsFilters
        };
    }

    function _parseImportedDevices ( deviceCollection ) {
        var devices = {};
        angular.forEach( deviceCollection, function ( deviceObj, index ) {
            var deviceData = {
                timestamp: 0,
                //deviceType: _deviceType(deviceObj.objectType),
                //name: deviceObj.objectName,
                deviceType: 'camera',
                name: deviceObj.name,
                streamName: deviceObj.streamName,
                id: deviceObj.id
            };
            devices['Device_'+deviceObj.id] = {
                id: 'Device'+deviceObj.id,
                //group: 'DeviceGroup'+new Date().getTime(),
                group: 'DeviceGroup',
                type: 'Device',
                markerType: 'Device',
                lat: deviceObj.location.coordinates[1],
                lng: deviceObj.location.coordinates[0],
                icon: MarkerIconFactory.createMarker('Device',deviceData),
                deviceData: deviceData,
                message: '<div marker-popup type="Device" id="'+deviceObj.id+'"></div>',
                action: deviceObj.action,
                originalEvent: deviceObj
            };
        });
        return devices;
    }

    function _parseImportedEvidences ( evidencesCollection ) {
//        alert('_parseImportedEvidences');
        var evidences = {};
        angular.forEach( evidencesCollection, function ( evidenceObj, index ) {
            var evidenceData = {
                id: evidenceObj.id,
                dateObserved: evidenceObj.dateObserved,
                location: evidenceObj.location,
                author: evidenceObj.author
            };
            evidences['Evidence_'+evidenceObj.id] = {
                id: 'Evidence'+evidenceObj.id,
                originalEvent: evidenceObj,
                evidenceData: evidenceData
            };
        });
        return evidences;
    }

/*  ---------------------------------------------------------------------- */

    this.dlMapData              = dlMapData;

    this.clearModule            = clearModule;

    this.setAppTheme            = setAppTheme;
    this.getAppTheme            = getAppTheme;

    this.setMap                 = setMap;
    this.getMap                 = getMap;

    this.setMapStyle            = setMapStyle;
    this.getMapStyle            = getMapStyle;

    this.setMapCenter           = setMapCenter;
    this.getMapCenter           = getMapCenter;

    this.setCurrentZoom         = setCurrentZoom;
    this.getCurrentZoom         = getCurrentZoom;

    this.setBounds              = setBounds;
    this.getBounds              = getBounds;

    this.setCurrentCenter       = setCurrentCenter;
    this.getCurrentCenter       = getCurrentCenter;

    this.setFocusIncident       = setFocusIncident;
    this.getFocusIncident       = getFocusIncident;

    this.importEvents           = importEvents;
    this.getImportedEvents      = getImportedEvents;

    this.setMediaEvents         = setMediaEvents;
    this.getMediaEvents         = getMediaEvents;

    this.setAnprEvents          = setAnprEvents;
    this.getAnprEvents          = getAnprEvents;

    this.setMediaEventsFilter   = setMediaEventsFilter;
    this.getMediaEventsFilter   = getMediaEventsFilter;

    this.importUnits            = importUnits;
    this.getUnits               = getUnits;

    this.setUnitsFilter         = setUnitsFilter;
    this.getUnitsFilter         = getUnitsFilter;

    this.importDevices          = importDevices;
    this.getDevices             = getDevices;
    this.clearDevices             = clearDevices;

    this.importEvidences        = importEvidences;
    this.getEvidences           = getEvidences;
    this.getEvidenceById        = getEvidenceById;

    this.setOpenedPopup         = setOpenedPopup;
    this.getOpenedPopup         = getOpenedPopup;

    this.setHoverPath           = setHoverPath;
    this.getHoverPath           = getHoverPath;

    return this;

}]);

mapServices.factory('MarkerIconFactory', [ 'Map', 'HelperFactory', function ( Map, hf ) {

    function activeObjectProps ( _aoType ) {
        var props;
        var _quickButtons = [];
        var _interactive = [];
        switch ( _aoType ) {
            case 'Camera':
                if ( Map.config.layout.videoGridPane ) {
                    _quickButtons.push( { icon: '<i class="icons8-pin"></i>', title: 'Pin Camera', classes: 'btn-pin-video' } );
                }
                _quickButtons.push( { icon: '<i class="icons8-information-filled"></i>', title: 'Get detailed Information', classes: 'btn-information' } );
                props = {
                    iconClass: 'icons8-wall-mount-camera-filled',
                    icon: '<i class="icons8-wall-mount-camera-filled"></i>',
                    quickButtons: _quickButtons,
                    interactive: false
                };
                break;
            case 'Stacked-Objects':
                _quickButtons.push(
                    { icon: '<i class="icons8-information-filled"></i>', title: 'Get detailed Information', classes: 'btn-information' }
                );
                props = {
                    iconClass: 'icons8-list',
                    icon: '<i class="icons8-list"></i>',
                    quickButtons: _quickButtons,
                    interactive: false
                };
                break;
            case 'Layered-Objects':
                _quickButtons.push(
                    { icon: '<i class="icons8-information-filled"></i>', title: 'Get detailed Information', classes: 'btn-information' }
                );
                props = {
                    iconClass: 'icons8-drag-list-down',
                    icon: '<i class="icons8-drag-list-down"></i>',
                    quickButtons: _quickButtons,
                    interactive: false
                };
                break;
            case 'Room-Light':
                _quickButtons.push(
                    { icon: '<i class="icons8-information-filled"></i>', title: 'Get detailed Information', classes: 'btn-information' }
                );
                _interactive.push(
                    { title: 'set Room Light value' }
                );
                props = {
                    iconClass: 'icons8-idea-filled',
//                    icon: '<i class="icons8-idea-filled"></i>',
                    icon: '<i class="icons8-light-off-filled"></i>',
                    quickButtons: _quickButtons,
                    interactive: true
                };
                break;
            case 'Temperature':
                _quickButtons.push(
                    { icon: '<i class="icons8-information-filled"></i>', title: 'Get detailed Information', classes: 'btn-information' }
                );
                props = {
                    iconClass: 'icons8-temperature-filled',
                    icon: '<i class="icons8-temperature-filled"></i>',
                    quickButtons: _quickButtons,
                    interactive: true
                };
                break;
            default:
                props = {
                    iconClass: 'icons8-door-opened-filled',
                    icon: '<i class="icons8-door-opened-filled"></i>',
                    quickButtons: _quickButtons,
                    interactive: false
                };
                break;
        }
        return props;
    }

    function activeObjectMarkup ( _aoObj ) {

        var warning = _aoObj.warning ? '<div class="abs warning"></div>' : '';

        var quickButtons = [];
        angular.forEach( activeObjectProps(_aoObj.objectType).quickButtons, function ( _obj, _index ) {
            quickButtons.push([
                '<div class="qbtn qbtn'+_index+'" style="">',
                    '<div class="qbtn-c fl fl-hc fl-vc '+_obj.classes+'" title="'+_obj.title+'">',
                        _obj.icon,
                    '</div>',
                '</div>'
//                '<div class="qbtn qbtn'+_index+' '+_obj.classes+'" style="border: 1px dashed orange;">',
//                    '<div class="qbtn-c fl fl-hc fl-vc" title="'+_obj.title+'">',
//                        _obj.icon,
//                    '</div>',
//                '</div>'
            ]);
        });

//        var interactive = _aoObj.statuses ? true : false;
        var interactive = [];
        angular.forEach( activeObjectProps(_aoObj.objectType).interactive, function ( _obj, _index ) {
            interactive.push([
                '<div class="ia-wrapper ia'+_index+'" style="border: 1px dotted white;">',
//                    '<div class="qbtn-c fl fl-hc fl-vc '+_obj.classes+'" title="'+_obj.title+'">',
//                        _obj.icon,
//                    '</div>',
                '</div>'
            ]);
        });

        return [
            '<div class="divmarker ao inverted">',
                '<div class="abs fl fl-vc fl-hc outer-circle">',
                    '<div class="abs quick-buttons">',
                        quickButtons,
                    '</div>',

//                    '<div class="abs interactive" style="color: white;">',
//                        interactive,
//                    '</div>',

                '</div>',

                '<div class="abs circle"></div>',

                warning,

                '<div class="abs icon fl fl-vc fl-hc">',

                    activeObjectProps(_aoObj.objectType).icon,

                '</div>',
                '<div class="abs center fl fl-hc fl-vc"><i class="icons8-plus-math"></i></div>',
                '<div class="abs highlight-container">',
                    '<div class="abs highlight-circle">',
                        '<div class="abs lr">',
                            '<div class="l"></div>',
                            '<div class="r"></div>',
                        '</div>',
                        '<div class="abs tb">',
                            '<div class="t"></div>',
                            '<div class="b"></div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('').replace(/,/g, '');
    }

    function incidentMarkup () {
        return [
            '<div class="divmarker incident inverted" tabindex="-1">',
                '<div class="abs rhomb"></div>',
                '<div class="abs quick-buttons">',
//                    'quick buttons',
                '</div>',
                '<div class="abs circle"></div>',
                '<div class="abs center fl fl-hc fl-vc"><i class="icons8-plus-math"></i></div>',
                '<div class="abs icon fl fl-vc fl-hc">',

//                    '<i class="icons8-door-opened-filled"></i>',
                    '<i class="icons8-warning-shield-filled"></i>',

                '</div>',
            '</div>'
        ].join('').replace(/,/g, '');
    }

    function focusIncidentMarkup () {
//        console.info('[FACTORY IconMarkerFactory] Map.config');
//        console.log(Map.config);
        var interactive = Map.config.focusIncident.interactive ? 'interactive' : '';
        return [
            '<div class="divmarker focus-incident '+interactive+'" tabindex="-1">',
                '<div class="abs c1"></div>',
                '<div class="abs c2"></div>',
            '</div>',
        ].join('').replace(/,/g, '');

    }

    function clickedPositionMarkup () {
        return [
            '<div class="divmarker cp">',
//                '<div class="abs info-circle"></div>',
//                '<div class="abs inner-circle"></div>',
//                '<div class="abs outer-circle"></div>',
//                '<div class="abs center fl fl-hc fl-vc"><i class="icons8-plus-math"></i></div>',
            '</div>'
        ].join('').replace(/,/g, '');
    }

    function aircraftMarkup ( _data ) {
//        console.group('aircraftMarkup(): _data');
//        console.log( _data );
//        console.groupEnd();

        var _quickButtons = [
            { icon: '<i class="icons8-crosshair"></i>', title: 'Follow Aircraft', classes: 'btn-follow-aircraft' }
        ];

        var quickButtons = [];

        angular.forEach( _quickButtons, function ( _obj, _index ) {
            quickButtons.push([
                '<div class="qbtn qbtn'+_index+'" style="">',
                    '<div class="qbtn-c fl fl-hc fl-vc '+_obj.classes+'" title="'+_obj.title+'">',
                        _obj.icon,
                    '</div>',
                '</div>'
            ]);
        });

        return [
            '<div class="divmarker aircraft">',

                followMarkup(),

                '<div class="abs circle"></div>',
                '<div class="abs direction-container">',
                    '<div class="arrow-wrapper"><div class="arrow"></div></div>',
                '</div>',
                '<div class="abs outer-circle">',

                    '<div class="abs quick-buttons">',
                        quickButtons,
                    '</div>',

                '</div>',
                '<div class="abs icon fl fl-vc fl-hc">',
                    '<i class="icons8-airplane-mode-on-filled"></i>',
                '</div>',
            '</div>',
        ].join('').replace(/,/g, '');
    }

    function mediaEventIcons ( _type ) {
        var props = {};
        switch ( _type ) {
            case 'picture':
                props.icon = '<i class="icons8-pin"></i>';
                break;
            case 'video':
                props.icon = '<i class="icons8-search"></i>';
                break;
        }
        return props;
    }

    function mediaEventMarkup ( _data ) {
        var _evidence = _data.evidenced ? [
            '<div class="abs evidence" style="border-radius: 0; border:;">',
                '<div class="abs c circle2"></div>',
            '</div>',
        ] : '';
        return [
            '<div id="markerMediaEvent'+_data.id+'" class="divmarker media-event" tabindex="-1">',
                _evidence,
                '<div class="abs icon">',
                    '<i class="'+hf.getIcon(_data.mediaType)+'"></i>',
                '</div>',
            '</div>',
        ].join('').replace(/,/g, '');
    }

    function anprEventMarkup ( _data ) {
        return [
            '<div id="markerAnprEvent'+_data.id+'" class="divmarker anpr-event" tabindex="-1">',
                '<div class="abs icon">',
//                    '<i class="'+hf.getIcon(_data.mediaType)+'"></i>',
                    'ANPR',
                '</div>',
            '</div>',
        ].join('').replace(/,/g, '');
    }

    function deviceMarkup ( _data ) {
        return [
          '<div ext-id="' + _data.id + '" id="markerDevice'+_data.id+'" class="divmarker device" draggable="true" tabindex="-1">',
                '<div class="abs icon">',
                    '<i class="'+hf.getIcon(_data.deviceType)+'"></i>',
                '</div>',
            '</div>',
        ].join('').replace(/,/g, '');
    }

    function unitMarkup ( _data ) {
        var status = _data.available ? 'available' : 'busy';
        return [
            '<div id="markerUnit'+_data.id+'" class="divmarker unit" tabindex="-1">',
                '<div class="abs icon">',
                    '<i class="'+hf.getIcon(_data.unitType)+'"></i>',
                '</div>',
                '<div class="abs status '+status+'"></div>',
            '</div>',
        ].join('').replace(/,/g, '');
    }

    function followMarkup () {
        var markup = [
            '<div class="abs followed-container">',
                '<div class="abs followed-wrapper">',
                    '<div class="top"></div>',
                    '<div class="right"></div>',
                    '<div class="bottom"></div>',
                    '<div class="left"></div>',
                '</div>',
            '</div>'
        ].join('').replace(/,/g, '');
        return markup;
    }

    var createMarker = function ( _markerType, _markerData ) {

//        console.group('[MarkerIconFactory]: type: '+_markerType);
//        console.log( _markerData );
//        console.groupEnd();

        var _iconSize, _popupAnchor, _markup;

        switch ( _markerType ) {
            case 'activeObject':
                _iconSize = [40, 40];
                _popupAnchor = [0, -20];
                _markup = activeObjectMarkup( _markerData );
                break;
            case 'incident':
                _iconSize = [40, 40];
                _popupAnchor = [0, -20];
                _markup = incidentMarkup();
                break;
            case 'focusIncident':
                _iconSize = [40, 40];
                _popupAnchor = null;
                _markup = focusIncidentMarkup();
                break;
            case 'clickedPosition':
                _iconSize = [20, 20];
                _popupAnchor = [0, -10];
                _markup = clickedPositionMarkup();
                break;
            case 'aircraft':
                _icon = [20, 20];
                _popupAnchor = [0, -10];
                _markup = aircraftMarkup( _markerData );
                break;
            case 'MediaEvent':
                _icon = [40,40];
                _popupAnchor = [0,-20];
                _markup = mediaEventMarkup( _markerData );
                break;
            case 'AnprEvent':
                _icon = [40,40];
                _popupAnchor = [0,-20];
                _markup = anprEventMarkup( _markerData );
                break;
            case 'Device':
                _icon = [40,40];
                _popupAnchor = [0,-20];
                _markup = deviceMarkup( _markerData );
                break;
            case 'Unit':
                _icon = [40,40];
                _popupAnchor = [0,-20];
                _markup = unitMarkup( _markerData );
                break;
        }

        return {
            type: 'div',
            iconSize: _iconSize,
            popupAnchor: _popupAnchor,
            html: _markup
        };

    };

    this.createMarker = createMarker;

    return this;

}]);

mapServices.factory('HelperFactory', [ function () {

    this.getIcon = function (mediaType) {
        var icon;
        switch (mediaType) {
            case 'picture':         icon = 'icons8-xlarge-icons-filled';        break;
            case 'video':           icon = 'icons8-video-call';                 break;
            case 'text':            icon = 'icons8-video-call';                 break;
            case 'audio':           icon = 'icons8-audio-wave';                 break;
            case 'camera':          icon = 'icons8-bullet-camera-filled';       break;
            case 'Police':          icon = 'icons8-police-badge-filled';        break;
            case 'PoliceCar':       icon = 'icons8-car-filled';                 break;
            case 'PoliceBike':      icon = 'icons8-motorcycle-filled';          break;
            case 'PoliceBicycle':   icon = 'icons8-bicycle-filled';             break;
            case 'PoliceHorse':     icon = 'icons8-horseback-riding-filled';    break;
        }
        return icon;
    };

    return this;

}]);

})(angular);



var directives = angular.module('dlmap.directives',[
    'leaflet-directive',
    'ngScrollbars'
]);

directives.config(["ScrollBarsProvider", function (ScrollBarsProvider) {
    // the following settings are defined for all scrollbars unless the
    // scrollbar has local scope configuration
    ScrollBarsProvider.defaults = {
        scrollButtons: {
            scrollAmount: 'auto',
            enable: true
        },
        scrollInertia: 200,
        axis: 'y',
        theme: 'minimal',
        autoHideScrollbar: true,
        advanced: {
            updateOnContentResize: true
        }
    };
}]);

directives.directive('dlMap', [ '$timeout', '$templateCache', 'MapModuleFactory', function ( $timeout, $templateCache, mmf ) {
    var ctrlFn = function ( $scope ) {

        $scope.$on('$destroy', function () {
            mmf.clearModule();
        });

        $scope.$watch( angular.bind(this, function () {
            return mmf.getAppTheme();
        }), function (_theme) {
            $scope.appTheme = _theme;
        });

        $scope.$watch( angular.bind(this, function () {
            return mmf.locationFinderActive;
        }), function (_active) {
            $scope.locationFinderActive = _active;
        });

//        $timeout( function () {
//            $scope.mapSettingsOpen = true;
//        },1000);
//        $timeout( function () {
//            $scope.mapSettingsOpen = false;
//        },2000);

//        $scope.mapActive = true;

    };
    ctrlFn.$inject = ["$scope"];
    var linkFn = function ( $scope, element ) {

        console.log('[DIR dlMap]');

        console.group('[DIR dlMap] $scope.dlMapData INITAL');
        console.log( $scope.dlMapData );
        console.groupEnd();

//        $scope.$watch('dlMapData', function () {
//            console.group('--- [DIR dlMap] $scope.dlMapData CHANGED ---');
//            console.log( $scope.dlMapData );
//            console.groupEnd();
//            _prefillModule();
//        });

        $scope.$watch('dlMapData.center', function ( _values ) {
//            alert('only center changed');
            if ( !_values ) { return; }
            console.info('center changed');
            console.log(_values);
            mmf.setMapCenter( _values );
        });

        $scope.$watch('dlMapData.incident', function ( _values ) {
//            alert('only incident changed');
//            if ( !_values ) { return; }
            console.info('incident changed');
            console.log(_values);
            mmf.setFocusIncident( _values );
        });

        $scope.$watch('dlMapData.zoom', function ( _values ) {
            if ( !_values ) { return; }
            console.info('zoom changed');
            console.log(_values);
            mmf.setFocusIncident( _values );
        });

        $scope.$watch('dlMapData.events', function ( _values ) {
            if ( !_values ) { return; }
            console.info('events changed');
            console.log(_values);
            mmf.importEvents( _values );
        });

        $scope.$watch('dlMapData.units', function ( _values ) {
            if ( !_values ) { return; }
            console.info('units changed');
            console.log(_values);
            mmf.importUnits( _values );
        });

        $scope.$watch('dlMapData.devices', function ( _values ) {
            if ( !_values ) { return; }
            console.info('devices changed');
            console.log(_values);
            mmf.importDevices( _values );
        });

        $scope.$watch('dlMapData.evidences', function ( _values ) {
            if ( !_values ) { return; }
            console.info('evidences changed');
            console.log(_values);
            mmf.importEvidences( _values );
        });

//        function _prefillModule () {
//            angular.forEach( $scope.dlMapData, function ( values, prop ) {
//                console.group(prop);
//                console.log(values);
//                console.groupEnd();
//                if ( prop === 'center' ) {
//                    mmf.setMapCenter( values );
//                }
//                if ( prop === 'incident' ) {
//                    mmf.setFocusIncident( values );
//                }
//                if ( prop === 'zoom' ) {
//                    mmf.setCurrentZoom( values );
//                }
//                if ( prop === 'events' ) {
//                    mmf.importEvents( values );
////                    alert('events');
//                }
//                if ( prop === 'units' ) {
//                    mmf.importUnits( values );
//                }
//                if ( prop === 'devices' ) {
//                    mmf.importDevices( values );
//                }
//                if ( prop === 'evidences' ) {
//                    mmf.importEvidences( values );
//                }
//            });
//        }

    };
    return {
        replace: true,
        restrict: 'E',
        scope: {
            dlMapData: '='
        },
        controller: ctrlFn,
        link: linkFn,
        template: $templateCache.get('layout.html')
    };
}]);

directives.directive('map', [ '$rootScope', '$timeout', '$compile', 'Map', 'MapModuleFactory', 'leafletData', 'leafletMarkersHelpers', function ( $rootScope, $timeout, $compile, Map, mmf, leafletData, leafletMarkersHelpers ) {
    var template = [
        '<div class="abs map">',
            '<leaflet ',
                'class="leaflet" ',
                'lf-center="center" ',
                'defaults="defaults" ',
                'tiles="tiles" ',
                'markers="markers" ',
                'paths="paths" ',
                'layers="layers" ',
                'controls="controls" ',
                'geojson="geojson" ',
                'width="100%" ',
                'height="100%"',
            '></leaflet>',
        '</div>'
    ].join('\n');
    var ctrlFn = function ( $scope ) {

        var mapMarker = { markers: {} };
        var mapPaths = { hoverPath: null };


        console.group('mmf.getMapStyle()');
        console.log( mmf.getMapStyle() );
        console.groupEnd();

//        console.group('[DIR map]');
//        console.log('$scope.mapActive: '+$scope.mapActive);
//        console.info('--- $scope.dlMapData ---');
//        console.log($scope.dlMapData);
//        console.groupEnd();

        var _mapDefaults = {
            tiles: mmf.getMapStyle(),
//            defaults: {
//                scrollWheelZoom: false,
//                zoomControl: false,
//                minZoom: 0,
//                maxZoom: 18
//            },
//            controls: {
//                scale: true
//            },
//            center: {
//                lat: 0,
//                lng: 0,
//                zoom: 15
//            },
            defaults: mmf.getMap().defaults,
            center: mmf.getMap().center,
            controls: mmf.getMap().controls,
            paths: {},
            layers: {},
            markers: {},
            geojson: {}
        };

//        var _mapDefaults = mmf.getMap();

        console.group('[DIR map] mapDefaults');
        console.log(_mapDefaults);
        console.groupEnd();


        angular.extend( $scope, _mapDefaults );



        $scope.$watch( angular.bind(this, function () {
            return mmf.getMapStyle();
        }), function (_style) {
            if ( !_style ) { return; }
            angular.extend( $scope, { tiles: _style });
        });





        $scope.map = false;



       /* $scope.$watch( angular.bind(this, function () {
            return mmf.getMapCenter();
        }), function (_center) {
            if ( !_center ) { return; }
            angular.extend( $scope, { center: _center });
            $scope.dlMapData.center = _center;
        });*/


//        $scope.$watch( angular.bind(this, function () {
//            return mmf.getCurrentCenter();
//        }), function (_currentCenter) {
//            if ( !_currentCenter ) { return; }
//            $scope.dlMapData.center = { lat: _currentCenter.lat, lng: _currentCenter.lng, zoom: mmf.getCurrentZoom() };
//        });


        leafletData.getMap($scope.dlMapData.mapId).then(function(map) {
            $scope.map = map;
            $scope.map.invalidateSize();

            leafletData.getMarkers().then( function (markers) {
              var bounds = null;
              function getBoundsRecursive(obj) {
                for (key in obj) {
                  if (obj[key].getLatLng) {
                    if (bounds) {
                      bounds.extend(obj[key].getLatLng());
                    } else {
                      bounds = L.latLngBounds(obj[key].getLatLng(), obj[key].getLatLng());
                    }
                  } else {
                    getBoundsRecursive(obj[key]);
                  }
                }
              };
              getBoundsRecursive(markers);
              $scope.map.fitBounds(bounds);
              _onMarkersAdded(markers);
            });
        });

        $scope.$watch( angular.bind(this, function () {
            return mmf.getBounds();
        }), function (_bounds) {
            if ( !_bounds ) { return; }
            console.group('[DIR map] ctrlFn(): mmf.getBounds()');
            console.log( _bounds );
            console.groupEnd();
        });

        $scope.$watch( angular.bind(this, function () {
            return mmf.getFocusIncident();
        }), function (_focusIncident) {

            console.group('_focusIncident marker');
            console.log( _focusIncident );
            console.groupEnd();

            if (!_focusIncident) {
                delete mapMarker.markers.focusIncient;
                return;
            }

            mapMarker.markers.focusIncient = _focusIncident;

            angular.extend( $scope, mapMarker );

        }, true);


        $scope.$watch( angular.bind(this, function () {
            return mmf.getMediaEvents();
        }), function (_mediaEvents) {
            _removeMarkers('MediaEvent');
            if (!_mediaEvents) { return; }
            console.group('mmf.getMediaEvents()');
            console.log(_mediaEvents);
            console.groupEnd();
            if ( mmf.showMediaEvents ) {
                console.info('--- media events ---');
                console.log(_mediaEvents);
                $timeout( function () { _addMarkers('MediaEvent'); },100);
            }
        });

        $scope.$watch( angular.bind(this, function () {
            return mmf.getUnits();
        }), function (_units) {
            if (!_units) { return; }
            _removeMarkers('Unit');
            if ( mmf.showUnits ) {
                $timeout( function () { _addMarkers('Unit'); });
            }
        });

        $scope.$watch( angular.bind(this, function () {
            return mmf.getDevices();
        }), function (_devices) {
            if (!_devices) { return; }
            _removeMarkers('Device');
            if ( mmf.showDevices ) {
              //$timeout( function () { _addMarkers('Device'); });
              _addMarkers('Device');
            }
        });

        function _addMarkers ( type ) {
            var _markerFromTypes;
            switch ( type ) {
                case 'MediaEvent':  _markerFromTypes = mmf.getMediaEvents();    break;
                case 'AnprEvent':   _markerFromTypes = mmf.getAnprEvents();     break;
                case 'Device':      _markerFromTypes = mmf.getDevices();        break;
                case 'Unit':        _markerFromTypes = mmf.getUnits();          break;
            }

            angular.forEach(_markerFromTypes, function (obj, index) {
                mapMarker.markers[index] = obj;
//                console.log(obj);
            });
            angular.extend( $scope, mapMarker );


            console.log($scope);

            console.group('--- L.markerClusterGroup() ---');
            console.log(L.markerClusterGroup());
            console.groupEnd();
           /* $timeout( function () {
              _onMarkersAdded();
            },500);*/
        }



        function _onMarkersAdded (_markers) {
          angular.forEach(_markers, function ( marker ) {
            if(marker.options.markerType == "Device") {
              makeDragableDeviceMarker(marker);
            }
          });
        }

        function makeDragableDeviceMarker(marker) {
          marker.on('add', function (e) {
            console.log(e);
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
              start: function(ui, event) {
                console.log("Start dragging...");
                $(this).data('dragData', { deviceId: $(ui.target).find('.device').attr('ext-id') });
              },
              stop: function() {
                console.log("Stop dragging...");
              },
              handle: '.device, .icon'
            };

            //var el = $('.leaflet-div-icon');
              var el = $(e.target._icon);
            /* ------------------------- HANDLE EVENTS ----------------------- */

            el.draggable(dragOptions);
          });
        }


        function _removeMarkers ( type ) {
            angular.forEach( mapMarker.markers, function (obj,index) {
                if ( index.indexOf(type)!==-1 ) {
                    delete mapMarker.markers[index];
                }
            });
        }

        $scope.$watch( angular.bind(this, function () {
            return mmf.getHoverPath();
        }), function (_paths) {
//            console.group('[DIR map] ctrlFn() mmf.getHoverPath()');
//            console.log( _paths );
//            console.groupEnd();
            if ( !_paths ) { delete mapPaths.hoverPath; }
            if ( _paths ) {
                var latlngs = [];
                angular.forEach( _paths.coordinates, function ( coord ) {
                    latlngs.push({ lat: coord[1], lng: coord[0] });
                });
                mapPaths.hoverPath = {
                    color: 'rgba(28,187,255,0.75)',
                    weight: 4,
                    latlngs: latlngs
                };
            }
//            console.log( mapPaths );
            angular.extend( $scope, { paths: mapPaths } );
        });


        $scope.$watch( angular.bind(this, function () {
            return mmf.showMediaEvents;
        }), function (_show) {
            _removeMarkers('MediaEvent');
            if ( _show ) { _addMarkers('MediaEvent'); }
        });

        $scope.$watch( angular.bind(this, function () {
            return mmf.showAnprEvents;
        }), function (_show) {
            if ( _show ) { _addMarkers('AnprEvent'); }
            else { _removeMarkers('AnprEvent'); }
        });

       /* $scope.$watch( angular.bind(this, function () {
            return mmf.showDevices;
        }), function (_show) {
            if ( _show ) { _addMarkers('Device'); }
            else { _removeMarkers('Device'); }
        });*/

        $scope.$watch( angular.bind(this, function () {
            return mmf.showUnits;
        }), function (_show) {
            if ( _show ) { _addMarkers('Unit'); }
            else { _removeMarkers('Unit'); }
        });

        $scope.$watch( angular.bind(this, function () {
            return mmf.getMediaEventsFilter();
        }), function (_filter) {
            _removeMarkers('MediaEvent');
        });


//        $scope.$watch( angular.bind(this, function () {
//            return mmf.getCountries();
//        }), function (_countries) {
//            if ( !_countries ) { return; }
//            console.group('[DIR map] _countries');
//            console.log(_countries);
//            console.groupEnd();
//
//            _countries.features.push( mmf.getSampleGeoJson() );
//
//            angular.extend($scope, {
//                geojson: {
//                    data: _countries,
//                    style: {
////                        fillColor: "green",
//                        fillColor: 'white',
//                        weight: 1,
//                        opacity: 1,
//                        color: 'rgba(0,255,0,0.25)',
//                        dashArray: '2',
//                        fillOpacity: 0.15
//                    }
//                }
//            });
//        });

//        $scope.$watch( angular.bind(this, function () {
//            return mmf.getSampleGeoJson();
//        }), function (_sampleGeoJson) {
//            if ( !_sampleGeoJson ) { return; }
//            console.group('[DIR map] _sampleGeoJson');
//            console.log(_sampleGeoJson);
//            console.groupEnd();
//            angular.extend($scope, {
//                geojson: {
////                    sample: {
////                        data: angular.fromJson(_sampleGeoJson),
//                        data: _sampleGeoJson,
//                        style: {
//    //                        fillColor: "green",
//                            fillColor: 'white',
//                            weight: 1,
//                            opacity: 1,
//                            color: 'rgba(0,255,0,0.5)',
//                            dashArray: '2',
//                            fillOpacity: 0.35
//                        }
//                    }
////                }
//            });
//        });

    };
    ctrlFn.$inject = ["$scope"];
    var linkFn = function ( $scope, element ) {

        $scope.$on('$destroy', function () {
          leafletMarkersHelpers.resetMarkerGroups();
        });

        $scope.$on('leafletDirectiveMap.load', _onMapLoad);
        $scope.$on('leafletDirectiveMap.resize', _onMapResize);
        $scope.$on('leafletDirectiveMap.contextmenu', _onMapContextmenu);
        //$scope.$on('leafletDirectiveMap.mousedown', _onMapMousedown);
        //$scope.$on('leafletDirectiveMap.mouseup', _onMapMouseup);
        $scope.$on('leafletDirectiveMap.mousemove', _onMapMousemove);
        $scope.$on('leafletDirectiveMap.popupopen', _onLeafletPopupOpen);
        $scope.$on('leafletDirectiveMap.popupclose', _onLeafletPopupClose);
        $scope.$on('leafletDirectiveMarker.mouseover', _onLeafletMarkerMouseover);
        $scope.$on('leafletDirectiveMarker.mouseout', _onLeafletMarkerMouseout);
        $scope.$on('leafletDirectiveMarker.click', _onLeafletMarkerClick);
        $scope.$on('leafletDirectiveMarker.mouseup', _onLeafletMarkerMouseup);
        $scope.$on('leafletDirectiveMap.zoomstart', _onMapZoomStart);
        $scope.$on('leafletDirectiveMap.zoomend', _onMapZoomEnd );
        $scope.$on('leafletDirectiveMap.dragstart', _onMapDragStart );
        $scope.$on('leafletDirectiveMap.drag', _onMapDrag );
        $scope.$on('leafletDirectiveMap.dragend', _onMapDragEnd );


        function _onMapLoad ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onMapLoad ---');
            $rootScope.$emit('mapModuleReady');
            $timeout( function () {
                _setBounds();
                _storeCurrentCenter();
            },500);
        }
        function _onMapResize ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onMapResize ---');
            _setBounds();
            _storeCurrentCenter();
        }
        function _onMapContextmenu ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onMapContextmenu ---');
        }
        function _onMapMousedown ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onMapMousedown ---');
        }
        function _onMapMouseup ( event, args ) {
            console.info('--- [DIR map] linkFn(): _onMapMouseup ---');
            if ( mmf.locationFinderActive ) {
//                console.log($scope.map);
                console.log(args);
                $rootScope.$emit('locationFinderCoordinatesSelected', args.leafletEvent.latlng);
            }
        }
        function _onMapMousemove ( event, args ) {
//            console.info('--- [DIR map] linkFn(): _onMapMousemove ---');
            if ( mmf.locationFinderActive ) {
                $rootScope.$emit('locationFinderCoordinates', args.leafletEvent.latlng);
            }
        }
        function _onLeafletPopupOpen ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onLeafletPopupOpen ---');
        }
        function _onLeafletPopupClose ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onLeafletPopupClose ---');
            mmf.setOpenedPopup(false);
        }
        function _onLeafletMarkerMouseover ( event, data ) {
            console.groupCollapsed('--- [DIR map] linkFn(): _onLeafletMarkerMouseover ---');
            console.log(event);
            console.log(data);
            if ( data.leafletObject.options.unitData ) {
                console.info('route to incident');
                console.log(data.leafletObject.options.unitData.route);
                mmf.setHoverPath( data.leafletObject.options.unitData.route );
            }
            $scope.map.dragging.disable();
            console.groupEnd();
        }
        function _onLeafletMarkerMouseout ( event, data ) {
//            console.info('--- [DIR map] linkFn(): _onLeafletMarkerMouseout ---');
            mmf.setHoverPath(false);
            $scope.map.dragging.enable();
        }
        function _onLeafletMarkerClick ( event, data ) {
            event.stopPropagation();
            console.info('--- [DIR map] linkFn(): _onLeafletMarkerClick ---');
        }

        function _onLeafletMarkerMouseup ( event, data ) {
          event.stopPropagation();
        }

        function _onMapZoomStart ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onMapZoomStart ---');
        }
        function _onMapZoomEnd ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onMapZoomEnd ---');
            _setBounds();
            _storeCurrentCenter();
        }
        function _onMapDragStart ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onMapDragStart ---');
        }
        function _onMapDrag ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onMapDrag ---');
        }
        function _onMapDragEnd ( event, data ) {
            console.info('--- [DIR map] linkFn(): _onMapDragEnd ---');
            _setBounds();
            _storeCurrentCenter();
        }

        function _setBounds () {
            if ( !$scope.map ) { return; }
            mmf.setBounds( $scope.map.getBounds() );
        }

        function _storeCurrentCenter () {
            if ( !$scope.map ) { return; }
//            console.group('--- map.getCenter() ---');
//            console.log( $scope.map.getCenter() );
//            console.groupEnd();
//            mmf.setCurrentCenter( $scope.map.getCenter() );
            mmf.setMapCenter( { lat: $scope.map.getCenter().lat, lng: $scope.map.getCenter().lng, zoom: mmf.getCurrentZoom() } );
        }

        $scope.$watch( angular.bind(this, function () {
            return mmf.getOpenedPopup();
        }), function (_openedPopup) {
            console.group('[DIR map] ctrlFn() mmf.getOpenedPopup()');
            console.log(_openedPopup);
            console.groupEnd();
            $('.divmarker').parent().removeClass('popup-opened');
            if (!_openedPopup) {
                return;
            }
            $('#marker'+_openedPopup.type+_openedPopup.id).parent().addClass('popup-opened');
        });

    };
    return {
        replace: true,
        restrict: 'E',
        template: template,
        link: linkFn,
        controller: ctrlFn
    };
}]);

directives.directive('markerPopup', [ '$compile', '$templateCache', 'MapModuleFactory', 'HelperFactory', 'leafletData', function ( $compile, $templateCache, mmf, hf, leafletData ) {
    var linkFn = function ( $scope, element ) {

        var el = $(element);
        var elContent = el.find('.popup-type-content');

        switch ( $scope.type ) {
            case 'MediaEvent':
                el.addClass('media-event');
                $scope.data = mmf.getMediaEvents( $scope.id );
                $scope.mediaIcon = hf.getIcon($scope.data.mediaData.mediaType);
                if ( $scope.data.mediaData.evidenced ) {
//                    alert('item already assigned as evidence');
                    $scope.data.action[0].label = 'lknkjjk kjhjkhkjhk';
                }
                switch ( $scope.data.mediaData.mediaType ) {
                    case 'picture':
                        el.addClass('picture');
                        elContent.append( $compile('<div popup-media-picture></div>')($scope) );
                        break;
                    case 'video':
                        el.addClass('video');
                        elContent.append( $compile('<div popup-media-video></div>')($scope) );
                        break;
                    case 'audio':
                        el.addClass('audio');
                        elContent.append( $compile('<div popup-media-audio></div>')($scope) );
                        break;
                }
                break;
            case 'Device':
                el.addClass('device');
                $scope.data = mmf.getDevices( $scope.id );
                $scope.title = $scope.data.deviceData.name;
                $scope.mediaIcon = hf.getIcon($scope.data.deviceData.deviceType);
                elContent.append( $compile('<div popup-camera></div>')($scope) );
                break;
            case 'Unit':
                el.addClass('unit');
                $scope.data = mmf.getUnits( $scope.id );
                $scope.title = 'Unit '+$scope.data.unitData.unitIdentifier;
                $scope.mediaIcon = hf.getIcon($scope.data.unitData.unitType);
                elContent.append( $compile('<div popup-unit></div>')($scope) );
                break;
            case 'AnprCollection':
                el.addClass('anpr-collection');
//                $scope.data = mmf.getUnits( $scope.id );
//                $scope.title = 'Unit '+$scope.data.unitData.unitIdentifier;
//                $scope.mediaIcon = hf.getIcon($scope.data.unitData.unitType);
                elContent.append( $compile('<div popup-anpr-collection></div>')($scope) );
                break;
        }


        $scope.callbackButtons = $scope.data.action;


        mmf.setOpenedPopup($scope.type,$scope.id);

        console.group('--- [DIR markerPopup] linkFn() ---');
        console.log('$scope.id  : '+$scope.id);
        console.log('$scope.type: '+$scope.type);
        console.info('scope.data');
        console.log($scope.data);
        console.info('$scope.callbackButtons');
        console.log($scope.callbackButtons);
        console.groupEnd();


        $scope.closePopup = function () {
          leafletData.getMap().then(function(map) {
            map.closePopup();
          });
        };

        $scope.callback = function ( buttonIndex ) {
            console.log('buttonIndex: '+buttonIndex);
            console.log($scope.data.action[buttonIndex]);
            $scope.data.action[buttonIndex].callbackFn( $scope.data );
        };



    };
    return {
        replace: true,
        scope: {
            id: '=',
            type: '@'
        },
        link: linkFn,
        template: $templateCache.get('marker.popup.html')
    };
}]);

directives.directive('popupMediaPicture', [ 'Map', '$timeout', '$http', 'ApiFactory', function ( Map, $timeout, $http, ApiFactory ) {
    var template = [
        '<div class="abs fl fl-vc fl-hc" style="background-color: black; padding: 0; border-bottom: 1px solid black;">',
//            '<img ng-src="{{ imgSrc }}" style="max-width: 100%; max-height: 100%;" />',
        '</div>'
    ].join('\n');
    var linkFn = function ( $scope, element ) {

        var el = $(element);

        console.group('[DIR popupMediaPicture]');
        console.log($scope.data);
        console.groupEnd();

        var mediaStorageUrlArray = $scope.data.mediaData.mediaStorageUrl.split('/');
        var mediaStorageId = mediaStorageUrlArray[mediaStorageUrlArray.length-1];

        console.info('mediaStorageId: '+mediaStorageId);

        $timeout( _loadMedia, 200 );

        function _loadMedia () {

//            $scope.imgSrc = window.location.origin+'/media-storage/rest/media/'+mediaStorageId;

            var img = $('<img>');
                img.css({ maxWidth: '100%', maxHeight: '100%' });
                img.appendTo(el);
                img.hide();

            var loader = $('<div>').addClass('abs fl fl-vc fl-hc loader').css({ color: 'white' }).text('loading...').appendTo(el);
            var image = new Image();

            image.onload = function() {
                console.log($(this).attr('src') + ' - done!');
                img.attr('src',$(this).attr('src')).show();
                loader.hide();
            };
            image.onerror = function (err) {
                console.error(err);
            };
            image.src = window.location.origin+'/media-storage/rest/media/'+mediaStorageId;



//                image.addEventListener('load',function () {
////                    alert('image loaded');
////                    img.attr({ src: this.src });
//                    $timeout( function () {
//                        img.show();
//                        loader.remove();
//                    },250);
//                });
//                image.addEventListener('error',function (err) {
//                    console.error(err);
//                });
//                image.src = window.location.origin+'/media-storage/rest/media/'+mediaStorageId;

//            var jsonHeader = { "Content-Type": 'application/json; charset=UTF-8' };
//            var url = window.location.origin+'/media-storage/rest/media/'+mediaStorageId;
//            var tokens = ApiFactory.getToken();
//            console.info('tokens');
//            console.log(tokens);
//            var request = {
////                headers: jsonHeader,
//                headers: {
//                    "Content-Type": 'application/json; charset=UTF-8',
//                    "Authorization": tokens.tokenType+' '+tokens.accessToken
//                },
//                method: 'GET', url: url };
//            var successFn = function ( res ) {
//                console.group('[DIR popupMediaPicture] load media (picture):');
//                console.log(res);
////                console.log(res.data);
//                console.groupEnd();
////                img.attr({ src: "data:image/png;base64," + res.data });
////                image.src = "data:image/*;base64," + res.data;
////
////                img.attr({ src: image.src });
////                img.show();
////                loader.hide();
//
////                image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
//
////                $scope.imgSrc = window.location.origin+'/media-storage/rest/media/'+mediaStorageId;
//
////                var results = jQuery.parseJSON(res.data);
////                for (var key in results) {
////                    //the results is a base64 string.  convert it to an image and assign as 'src'
////                    img.src = "data:image/png;base64," + results[key];
////                }
//                $timeout( function () {
//                    img.show();
//                    loader.remove();
//                },500);
//            };
//            var errorFn = function ( err ) {
//                alert('error login');
//                console.error(err);
//            };
//            $http( request ).then( successFn, errorFn );

        }

    };
    return {
        replace: true,
        scope: false,
        template: template,
        link: linkFn
    };
}]);

directives.directive('popupMediaVideo', [ '$timeout', '$compile', function ( $timeout, $compile ) {
    var template = [
        '<div class="abs fl fl-vc fl-hc" style="background-color: black;"></div>'
    ].join('\n');
    var linkFn = function ( $scope, element ) {

        var el = $(element);

        console.group('[DIR popupMediaVideo]');
        console.log($scope.data);
        console.groupEnd();

        var mediaStorageUrlArray = $scope.data.mediaData.mediaStorageUrl.split('/');
        var mediaStorageId = mediaStorageUrlArray[mediaStorageUrlArray.length-1];

        console.info('mediaStorageId: '+mediaStorageId);

        $timeout( _loadMedia, 500 );

        function _loadMedia () {

            el.empty();

            var videoId = 'popupVideo'+mediaStorageId;
            var videoEl = $('<video>');
                videoEl.css({ position: 'absolute', maxHeight: '100%', maxWidth: '100%', pointerEvents: 'all' });
                videoEl.attr({ id: videoId });
                videoEl.appendTo(el);
            var video = document.getElementById( videoId );
                video.src = window.location.origin+'/media-storage/rest/media/'+mediaStorageId;

                video.addEventListener('canplaythrough', _onCanplaythrough);
                video.addEventListener('durationchange', _onDurationchange);
                video.addEventListener('timeupdate', _onTimeupdate);
                video.addEventListener('ended', _onEnded);

            $scope.videoPlaying = false;

            var videoControl = [
                '<div class="abs fl rows video-control" style="border:;">',
                    '<div class="fl-s"></div>',
                    '<div class="fl-a fl cols fl-vc control" style="border:; background-color: rgba(0,0,0,0.5);">',
                        '<div class="fl-a" style="border:; padding: 5px 2px;" ng-click="playPauseVideo($event);">',
                            '<i ng-class="{\'icons8-play\':!videoPlaying, \'icons8-pause\':videoPlaying}"></i>',
                        '</div>',
                        '<div class="fl-s" style="border:;"></div>',
                        '<div class="f-auto" style="border:; padding: 5px 2px; font-family: Digital7Mono;">{{ time | millisToTime }} / {{ duration | millisToTime }}</div>',
                    '</div>',
                '</div>'
            ].join('\n');

            el.append( $compile(videoControl)($scope) );

            function _onCanplaythrough (event) {
//                alert('_onCanplaythrough');
            }

            function _onDurationchange (event) {
                $scope.$apply( function () {
                    $scope.time = 0;
//                $scope.duration = event.src.duration*1000;
                    $scope.duration = Math.round(video.duration)*1000;
//                console.info('_onDurationchange');
//                console.log(event);
//                console.log(video);
                });
            }

            function _onTimeupdate () {
//                console.info('_onTimeupdate: time: '+video.currentTime);
                $scope.$apply( function () {
                    $scope.time = Math.round(video.currentTime)*1000;
                });
            }

            function _onEnded () {
                $scope.$apply( function () {
                    $scope.videoPlaying = false;
                });
            }

//            $scope.$watch('videoPlaying', function (_playing) {
//                if (_playing) { video.play(); }
//                else { video.pause(); }
//            });

            $scope.playPauseVideo = function (event) {
                event.stopPropagation();
                $scope.videoPlaying = !$scope.videoPlaying;
                if ( $scope.videoPlaying ) { video.play(); }
                else { video.pause(); }
            };

            video.addEventListener('play', function () {
                console.info('asset grid item video on.play');
            });
            video.addEventListener('pause', function () {
                console.info('asset grid item video on.pause');
            });

        }

    };
    return {
        replace: true,
        scope: false,
        template: template,
        link: linkFn
    };
}]);

directives.directive('popupMediaAudio', [ '$timeout', '$interval', '$compile', function ( $timeout, $interval, $compile ) {
    var template = [
        '<div class="abs fl rows" style="background-color: black;">',
            '<div class="fl-a" style="flex: 0 1 60px;">',
                '<div class="abs waveform" style=""></div>',
            '</div>',
            '<div class="fl-s rel control" style="border-top: 1px solid #2b2c30; pointer-events: all;">',

                '<div class="abs fl rows video-control" style="border:;">',
                    '<div class="fl-s"></div>',
                    '<div class="fl-a fl cols fl-vc control" style="border:; background-color: rgba(0,0,0,0.5);">',
                        '<div class="fl-a" style="border:; padding: 5px 2px;" ng-click="playPauseAudio($event);">',
                            '<i ng-class="{\'icons8-play\':!wavePlaying, \'icons8-pause\':wavePlaying}"></i>',
                        '</div>',
                        '<div class="fl-s" style="border:;"></div>',
                        '<div class="f-auto" style="border:; padding: 5px 2px; font-family: Digital7Mono;">{{ currentTime*1000 | millisToTime }} / {{ duration*1000 | millisToTime }}</div>',
                    '</div>',
                '</div>',

            '</div>',
        '</div>'
    ].join('\n');
    var linkFn = function ( $scope, element ) {

        var el = $(element);

        console.group('[DIR popupMediaAudio]');
        console.log($scope.data);
        console.groupEnd();

        $scope.audioWaveId = 'audioWave'+$scope.data.id;

        var mediaStorageUrlArray = $scope.data.mediaData.mediaStorageUrl.split('/');
        var mediaStorageId = mediaStorageUrlArray[mediaStorageUrlArray.length-1];

        var wavesurfer;

//        $scope.stageWaveformId = 'stageWaveform-'+$scope.id;


        el.find('.waveform').attr('id',$scope.audioWaveId);


        $scope.waveLoaded = false;
        $scope.duration = 0;
        $scope.currentTime = 0;


//        $timeout( function () {
//            makeWave();
//        },100);

        $timeout( makeWave );

        var interval;

        function makeWave () {

//            var audioControl = [
//                '<div class="abs fl rows video-control" style="border:;">',
//                    '<div class="fl-s"></div>',
//                    '<div class="fl-a fl cols fl-vc control" style="border:; background-color: rgba(0,0,0,0.5);">',
//                        '<div class="fl-a" style="border:; padding: 5px 2px;" ng-click="playPauseAudio($event);">',
//                            '<i ng-class="{\'icons8-play\':!wavePlaying, \'icons8-pause\':wavePlaying}"></i>',
//                        '</div>',
//                        '<div class="fl-s" style="border:;"></div>',
//                        '<div class="f-auto" style="border:; padding: 5px 2px; font-family: Digital7Mono;">{{ currentTime | millisToTime }} / {{ duration | millisToTime }}</div>',
//                    '</div>',
//                '</div>'
//            ].join('\n');
//
//            el.find('.control').append( $compile(audioControl)($scope) );

            var waveOptions = {
                container      : '#'+$scope.audioWaveId,
                waveColor      : '#46484d',
                progressColor  : '#257cbf',
                normalize      : true,
                hideScrollbar  : true,
                cursorColor    : '#257cbf',
                cursorWidth    : 1,
                height         : 60
            };

    //            console.info('[DIR detailsAudio] linkFn(): $scope.audio');
    //            console.log($scope.audio);
    //            console.log($scope.audio.media.src);
    //            console.log('window.location.origin: '+window.location.origin);

            wavesurfer = WaveSurfer.create( waveOptions );

            wavesurfer.load( window.location.origin+'/media-storage/media/'+mediaStorageId );

//            wavesurfer.setMute( true );

            wavesurfer.on('ready', function () {

//                alert('wavesurfer ready: '+$scope.id);

                wavesurfer.play();

                $('#'+$scope.stageWaveId)
                .find('canvas')
//                .addClass('abs')
                .css({ border: '2px dashed red', width: el.find('.waveform').width(), height: el.find('.waveform').height() });

                wavesurfer.pause();

                $scope.duration = wavesurfer.getDuration();
                $scope.currentTime = wavesurfer.getCurrentTime();
                $scope.waveLoaded = true;
                $scope.$apply();


                $('#'+$scope.stageWaveId).find('wave').addClass('abs').css({ width: '100%' });


            });

            wavesurfer.on('error', function (err) {
                alert('wavesurfer ERRROR');
                console.warn(err);
            });

            wavesurfer.on('finish', function () {
//                $interval.cancel( interval );
                wavesurfer.stop();
                $scope.wavePlaying = false;
                $scope.$apply();
            });

            wavesurfer.on('seek', function () {
                $scope.currentTime = wavesurfer.getCurrentTime();
                $scope.$apply();
            });

            wavesurfer.on('play', function () {
//                updateTimeOutput();
                $scope.wavePlaying = true;
                interval = window.requestAnimationFrame(_updateTime);
            });

            wavesurfer.on('pause', function () {
                $interval.cancel( interval );
                $scope.wavePlaying = false;
                window.cancelAnimationFrame(interval);
            });

        }

        function _updateTime () {
            $scope.currentTime = wavesurfer.getCurrentTime();
            $scope.$apply();
//            console.log('currentTime: '+$scope.currentTime);
            interval = window.requestAnimationFrame(_updateTime);
        }

        $scope.playPauseAudio = function ( event ) {
//            event.stopPropagation();
            console.log('wavesurferPlaying: '+wavesurfer.isPlaying());
//            wavesurfer.play();
            if ( wavesurfer.isPlaying() ) {
                wavesurfer.pause();
            }
            else {
                wavesurfer.play();
            }
        };

    };
    return {
        replace: true,
        scope: false,
        template: template,
        link: linkFn
    };
}]);

directives.directive('popupCamera', [ '$timeout', '$compile', function ( $timeout, $compile ) {
    var template = [
        '<div class="abs fl fl-vc fl-hc" style="background-color: black;">',
            '<div id="{{ videoId }}" class="div-rtmp-player" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color:;">',

            '</div>',
        '</div>'
    ].join('\n');
    var linkFn = function ( $scope, element ) {

        $scope.videoId = 'camera'+$scope.data.deviceData.id;

        var el = $(element);

        console.group('[DIR popupCamera]');
        console.log($scope.data);
        console.groupEnd();

//        $scope.streamUri = 'streams.dallmeier.com:1935/live/camera2';
        $scope.streamUri = 'rtmp://streams.dallmeier.com/live/'+$scope.data.deviceData.name;

        console.info('--- new $scope.streamUri: '+$scope.streamUri);

        $timeout( function () {

            $f( $scope.videoId , {
                src: '../js/flowplayer/flowplayer-3.2.18.swf',
                wmode: 'opaque'
            }, {
                clip: {
//                    url: $scope.streamUri,
//                    scaling: 'fit',
//                    live: true,
//                    autoplay: true,
                    // configure clip to use hddn as our provider, referring to our rtmp plugin
                    provider: 'hddn'
                },
                autoplay: true,
                // streaming plugins are configured under the plugins node
                plugins: {
                    controls: null, //disable controlbar
//                        controls: true,
                    // here is our rtmp plugin configuration
                    hddn: {
                        url: '../js/flowplayer/flowplayer.rtmp/flowplayer.rtmp-3.2.13.swf',
                        autoplay: true,
                        // netConnectionUrl defines where the streams are found
                        netConnectionUrl: $scope.streamUri
                    }
                },
                canvas: {
                    backgroundGradient: 'none'
                }
            });

        },0);

    };
    return {
        replace: true,
        scope: false,
        template: template,
        link: linkFn
    };
}]);

directives.directive('popupUnit', [ '$timeout', '$templateCache', 'MapModuleFactory', function ( $timeout, $templateCache, mmf ) {
    var linkFn = function ( $scope, element ) {

        var el = $(element);

        $scope.data = mmf.getUnits( $scope.id );

//        alert('$scope.id: '+$scope.id);

        $timeout( function () {
            console.group('[DIR popupUnit]');
            console.log($scope.data);
            console.groupEnd();
        },1000);

    };
    return {
        replace: true,
        scope: true,
        link: linkFn,
        template: $templateCache.get('marker.popup.unit.html')
    };
}]);


directives.directive('popupAnprCollection', [ '$timeout', '$templateCache', 'MapModuleFactory', function ( $timeout, $templateCache, MapModuleFactory ) {
    var linkFn = function () {};
    return {
        link: linkFn,
        template: $templateCache.get('marker.popup.anprCollection.html')
    };
}]);






var mapFilters = angular.module('dlmap.filters',[]);

mapFilters.filter('mediaIcon', function() {
    return function(mediaType) {
        var icon;
        switch (mediaType) {
            case 'picture':
                icon = '<i class="icons8-play"></i>';
                break;
        }
        return icon;
    };
});

mapFilters.filter('millisToTime', function () {
    return function ( millis, includeHrs, includingMs ) {
        var ms = millis % 1000;
        millis = (millis - ms) / 1000;
        var secs = millis % 60;
        millis = (millis - secs) / 60;
        var mins = millis % 60;
        var hrs = (millis - mins) / 60;
        hrs  = (hrs<10) ? '0'+hrs : hrs;
        mins = (mins<10) ? '0'+mins : mins;
        secs = (secs<10) ? '0'+secs : secs;
        var output = '';
        if ( includeHrs ) {
            output += hrs + ':';
        }
        output += mins + ':' + secs;
        if ( includingMs ) {
            output += ':' + ms;
        }
        return output;
    };
});

mapFilters.filter('secondsToTime', function () {
    return function ( seconds ) {
//        var ms = millis % 1000;
//        millis = (millis - ms) / 1000;
//        var secs = millis % 60;
//        millis = (millis - secs) / 60;
        var secs = seconds;
        var mins = seconds % 60;
        var hrs = (seconds - mins) / 60;
        hrs  = (hrs<10) ? '0'+hrs : hrs;
        mins = (mins<10) ? '0'+mins : mins;
        secs = (secs<10) ? '0'+secs : secs;
        var output = '';
        output += mins + ':' + secs;
        return output;
    };
});

