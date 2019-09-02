"use strict";

(function(){

    function EEPSettingsFactory($resource, $q, ParseHTMLService){

        var EEPSettingsResource = $resource('/eep/rest/settings/', {}, {
            getAll:{
                method: 'GET',
                isArray: true,
                transformResponse: function (data, headersGetter, status) {
                    if (ParseHTMLService.isLogin(data)) {
                      return data;
                    }
                    console.log('RESPONSE GET /eep/rest/settings: ' + data);
                    var parsedData = JSON.parse(data);
                    if (parsedData.content && parsedData.content !== undefined && parsedData.content !== null) {
                        return parsedData.content;
                    }
                    return [];
                }
            }
        });

        // var eepSettings = null;
        var eepSettings = {
            urls: {
                osmServerUrl: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            },
            map: {
                mapCenter: { coordinates: [ 12.100500, 49.014764 ], type: 'Point' },
                defaultZoom: 15,
                minZoom: 4,
                maxZoom: 18
            }
        };

        return {

            loadSettings: function () {
                //console.log('Fetching settings for id: ' + id);
                var dfd = $q.defer();
                EEPSettingsResource.getAll().$promise.then(function success(content){
                    for (var i = 0; i < content.length; i++) {
                        var entity = content[i];
                        if (entity.settings !== undefined && entity.settings !== null) {
                            if (!eepSettings.hasOwnProperty(entity.name)) {
                                eepSettings[entity.name] = {};
                            }
                            for (var j = 0; j < entity.settings.length; j++) {
                                var setting = entity.settings[j];
                                if (setting.name !== undefined && setting.value !== undefined) {
                                    if (setting.type === 'GEOMETRY') {
                                        eepSettings[entity.name][setting.name] = JSON.parse(setting.value);
                                    } else {
                                        eepSettings[entity.name][setting.name] = setting.value;
                                    }
                                }
                            }
                        }
                    }
                    dfd.resolve(eepSettings);
                }, function error(error){
                    dfd.reject(error);
                });
                return dfd.promise;
            },

            get: function (entityName, settingName) {
                if (eepSettings[entityName] !== undefined && eepSettings[entityName] !== null) {
                    if (settingName === undefined || settingName === null || settingName === '') {
                        return eepSettings[entityName];
                    } else if (eepSettings[entityName][settingName] !== undefined) {
                        return eepSettings[entityName][settingName];
                    }
                }
/*
                for (var i = 0; i < result.length; i++) {
                    var entity = eepSettings[i];
                    if (entity.name === entityName && entity.settings !== undefined) {
                        for (var j = 0; j < entity.settings.length; j++) {
                            var setting = entity.settings[j];
                            if (setting.name === settingName) {
                                return setting.value;
                            }
                        }
                    }
                }
*/
                return null;
/*
                var dfd = $q.defer();
                this.getSettings().then(function (result) {
                    if (result !== undefined && result !== null) {
                        for (var i = 0; i < result.length; i++) {
                            var entity = result[i];
                            if (entity.name === entityName && entity.settings !== undefined) {
                                for (var j = 0; j < entity.settings.length; j++) {
                                    var setting = entity.settings[j];
                                    if (setting.name === settingName) {
                                        dfd.resolve(setting.value);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                    dfd.resolve(null);
                }, function () {
                    dfd.resolve(null);
                });
                return dfd.promise;
*/
            }

        };
    }

    angular.module('app').factory('EEPSettingsFactory', EEPSettingsFactory);

})();
