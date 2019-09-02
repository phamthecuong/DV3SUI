(function() {
    'use strict';

    function config($stateProvider, $locationProvider, $urlRouterProvider, $translateProvider, cfpLoadingBarProvider, $qProvider, tmhDynamicLocaleProvider) {
        $translateProvider.useSanitizeValueStrategy("sanitize");
        $translateProvider
            .registerAvailableLanguageKeys(['en', 'de'], {
                'en_US': 'en',
                'en_UK': 'en',
                'de_DE': 'de',
                'de_CH': 'de'
            })
            .determinePreferredLanguage()
            .useStaticFilesLoader({
                prefix: 'locales/',
                suffix: '/translation.json'
            });
        tmhDynamicLocaleProvider.localeLocationPattern("/bower_components/angular-i18n/angular-locale_{{locale}}.js");

        $locationProvider
            .html5Mode({
                enabled: false,
                requireBase: false
            })
            .hashPrefix('');

        $stateProvider
        .state('root', {
            url: '',
            abstract: true,
            views: {
                'header': {
                    templateUrl: 'components/header/header.html',
                    controller: 'HeaderController',
                    controllerAs: 'vmHeader'
                }
            },
            resolve: {
                userProfile : setUserProfile,
                serverConfig: serverConfig
            }
        })

        .state({
            name: 'root.surveillance',
            url: '/surveillance',
            views: {
                'content@': {
                    templateUrl: 'components/surveillance/surveillance.html',
                    controller: 'SurveillanceController',
                    controllerAs: 'vmSurveillance'
                }
            }
        })
        /*.state({
          name: 'root.inbox',
          url: '/inbox',
          views: {
            'content@': {
              templateUrl: 'components/inbox/inbox.html',
              controller: 'InboxController',
              controllerAs: 'vmInbox'
            }
          }
        })*/

        .state({
            name: 'root.setting',
            url: '/setting',
            views: {
                'content@': {
                    templateUrl: 'components/setting/setting.html',
                    controller: 'SettingController',
                    controllerAs: 'vmSetting'
                }
            }
        })

        .state({
          name: 'root.chanel',
          url: '/channel/:channelId',
          cache: false,
          views: {
            'content@': {
              templateUrl: 'components/surveillance/surveillance.html',
              controller: 'SurveillanceController',
              controllerAs: 'vmSurveillance'
            }
          }
        })
        .state({
          name: 'root.preview',
          url: '/preview/channel/:channelId',
          cache: false,
          views: {
            'content@': {
              templateUrl: 'components/surveillance/surveillance.html',
              controller: 'SurveillanceController',
              controllerAs: 'vmSurveillance'
            }
          }
        })
        //$state.go('root.surveillance');
        $urlRouterProvider.otherwise('/surveillance');
        cfpLoadingBarProvider.includeSpinner = false;
        $qProvider.errorOnUnhandledRejections(false);
    }

    function setUserProfile(AuthService, $translate, tmhDynamicLocale, $filter) {
           AuthService.setCurrentPerson(currentPerson);
           currentPersonPermissions = AuthService.setCurrentPersonPermissions(currentPerson.authGroups);
           $translate.use(preferedLanguage);
           tmhDynamicLocale.set(preferedLanguage);
    };

    function serverConfig(UtilFactory, URLS) {
        var originUrl;
        var signalingUrl;
        if(UtilFactory.getDeviceInfo().indexOf('Electron') !== -1) {
            originUrl = URLS.BACKEND_URL_ELECTRON;
            signalingUrl = URLS.SIGNALING_URL_DEFAULT;
        } else {
            originUrl = URLS.BACKEND_URL_WEB;
            signalingUrl = '';
        }
        UtilFactory.setOriginUrl(originUrl);
        UtilFactory.setSignalingUrl(signalingUrl);
    }

    function mapConfig(MapProvider) {
      var mapConfigObject = {
        appId: 1,
        mapTech: 'leaflet', // oder 'mapbox'
        theme: 'dark',
        //            mapStyle: 'asaDallmeier',
        mapStyle: 'cartodbDark',
        map: {
          center: {
            // TODO Set appropriate default values for individual customer
            lat: 16.053609,
            lng: 108.205746,
            zoom: 18
          },
          defaults: {
            scrollWheelZoom: true,
            zoomControl: true,
            zoomControlPosition: 'topright',
            minZoom: 4,
            maxZoom: 18
          },
          controls: {
            scale: false
          }
        },
        focusIncident: {
          interactive: true
        },
        backend: {
          baseUrl: window.location.origin,
          flashPlayer: {
            src: '../js/flowplayer/flowplayer-3.2.18.swf',
            rtmpPlugin: '../js/flowplayer/flowplayer.rtmp/flowplayer.rtmp-3.2.13.swf'
          }
        }
      };

      MapProvider.setConfig(mapConfigObject);
    }

    function run(EEPSettingsFactory, MapStyles, MapModuleFactory) {

      EEPSettingsFactory.loadSettings().then(function (eepSettings) {
        console.log('EEPSettings: ' + JSON.stringify(eepSettings));

        // Apply to dlmap
        // MapStyles.styles.asaDallmeier.url = settings['osmServerUrl'] || 'https://asa-staging.dallmeier.com/osm/{z}/{x}/{y}.png';
        // MapStyles.styles.asaDallmeier.url = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        MapStyles.styles.asaDallmeier.url = eepSettings['urls']['osmServerUrl'];
        MapStyles.mapDefaults = {
          scrollWheelZoom: true,
          zoomControl: false,
        /*  minZoom: eepSettings['map']['minZoom'],
          maxZoom: eepSettings['map']['maxZoom']*/
          minZoom: 4
        };
        MapStyles.mapControls = {
          scale: {
            position: 'bottomright'
          }
        };

        //MapModuleFactory.streamServer = eepSettings['urls']['evoStreamUrl'];
        MapModuleFactory.streamServer = '';

      }, function (error) {
        //console.log(error);
      });
    }

    function notificationConfig(NotificationProvider) {
      NotificationProvider.setOptions({
        delay: 5000,
        startTop: 10,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'top'
      });
    }

     config.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider', '$translateProvider', 'cfpLoadingBarProvider', '$qProvider', 'tmhDynamicLocaleProvider'];
     mapConfig.$inject = ['MapProvider'];
     notificationConfig.$inject = ['NotificationProvider'];
     run.$inject = ['EEPSettingsFactory', 'MapStyles', 'MapModuleFactory'];

    angular.module('app')
      .config(mapConfig)
      .run(run)
      .config(config)
      .config(notificationConfig);

})();

