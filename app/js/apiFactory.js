
angular.module('dlvwc.api.factory')
.factory('ApiFactory', [ 'URLS', '$rootScope', '$q', '$http', '$timeout', 'CAMERA_MODES', '$resource', 'UtilFactory', function ( urls, $rootScope, $q, $http, $timeout, cameraModes, $resource, UtilFactory) {

    var origin = UtilFactory.getOriginUrl();

    var jsonHeader = {
        "Content-Type": 'application/json',
        "Accept": 'application/json'
    };

    var auth = {
        tokenType: false,
        accessToken: false
    };

    var callback = false;
    var storedDefer = false;

/*  ----------------------------------------------------------------------------- */

    var getChannels = function () {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'GET',
            url: origin + '/channels'
        };
        var successFn = function ( res ) {
            console.log("Test getChannel successfully, res = " + angular.toJson(res));
            defer.resolve(res);
        };
        var errorFn = function ( err ) {
            defer.reject(err);
        };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var getChannelInfo = function ( channelId ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'GET',
            url: origin+'/channels/'+channelId
        };
        var successFn = function ( res ) {
            console.info('[ApiFactory.getChannelInfo()]: successFn(): response:');
            console.log(res);
            defer.resolve(res.data);
        };
        var errorFn = function ( err ) {
            defer.reject(err);
        };
        $http( request ).then(successFn, errorFn);
        return defer.promise;
    };

    var getChannelInfoByDevice = function ( deviceId ) {
      var defer = $q.defer();
      var request = {
        headers: jsonHeader,
        method: 'GET',
        url: origin+'/channels/device/'+deviceId
      };
      var successFn = function ( res ) {
        console.info('[ApiFactory.getChannelInfo()]: successFn(): response:');
        console.log(res);
        defer.resolve(res.data);
      };
      var errorFn = function ( err ) {
        defer.reject(err);
      };
      $http( request ).then(successFn, errorFn);
      return defer.promise;
    };

    var getChannelStream = function ( channelId ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'GET',
            url: origin+'/channels/'+channelId+'/streams'
        };
        var successFn = function ( res ) {
            console.log("res stream from channels", res);
            var enrichedArray = parseChannelStreams( res.data );
            defer.resolve(enrichedArray);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var getRecordingStreamInfo = function ( streamId ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'GET',
            url: origin+'/streams/'+streamId
        };
        var successFn = function ( res ) {
            console.info('[ApiFactory.getRecordingStreamInfo()]: successFn(): response:');
            console.log(res);
            defer.resolve(res.data);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var createSessionStream = function ( streamId, options ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'POST',
            url: origin+'/streams/'+streamId+'/sessions',
            data: options
        };

        var successFn = function ( res ) {
            console.log("Test TTTTTTTTTTT go to createSessionStream 7a, res = " + angular.toJson(res));
            defer.resolve(res);
        };
        var errorFn = function ( err ) {
            console.log("Test TTTTTTTTTTT go to createSessionStream 7b, err = " + angular.toJson(err));
            defer.reject(err);
        };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var getLiveStream = function ( channelId ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'GET',
            url: origin+'/channels/'+channelId+'/streams/live'
        };
        console.log("Test TTTTTTTTTTT go to getLiveStream 1a, url = " + request.url);
        var successFn = function ( res ) {
            console.log("Test TTTTTTTTTTT go to getLiveStream 1b, res = " + angular.toJson(res));
            defer.resolve(res.data[0]);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var getRecordingStream = function ( channelId ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'GET',
            url: origin+'/channels/'+channelId+'/streams/recording'
        };
        var successFn = function ( res ) {
            console.log("Test TTTTTTTTTTT go to getRecordingStream 2b, res = " + angular.toJson(res));
            defer.resolve(res.data[0]);
        };

        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var destroySession = function ( sessionId ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'DELETE',
            url: origin+'/sessions/'+sessionId
        };
        var successFn = function ( res ) {
            console.info('[ApiFactory.destroySession('+sessionId+')]: successFn(): response:');
            console.log(res);
            defer.resolve(res);
        };
        var errorFn = function ( err ) {
            console.error( err );
            defer.reject(err);
        };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var getSessionState = function ( sessionId, paneId ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'GET',
            url: origin+'/sessions/'+sessionId+'/panes/'+paneId+'/state'
        };
        var successFn = function ( res ) {
            console.info('[ApiFactory.getSessionState()]: successFn(): response:');
            console.log(res);
            defer.resolve(res);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var getActionList = function ( sessionId, paneId ) {
        var defer = $q.defer();
        var request = {
            header: jsonHeader,
            method: 'GET',
            url: origin + '/sessions/' + sessionId + '/panes/' + paneId + '/actions'
        };

        var successFn = function ( res ) {
            defer.resolve(res);
        };

        var errorFn = function ( err ) {
            defer.reject(err);
        };

        $http( request ).then( successFn, errorFn );
        return defer.promise;
    }

    var playbackAction = function ( sessionId, paneId, cameraType, action, mode, switchMode ) {
        var defer = $q.defer();
        var url = origin + '/sessions/' + sessionId + '/panes/' + paneId;

        var request = {
            headers: jsonHeader,
            method: 'POST'
        }

        if(cameraType === 'Panomera' && switchMode) {
            mode = mode.charAt(0).toUpperCase() + mode.slice(1);
            url = url + '/mode/' + mode;
            request.data = {};
        } else {
            url = url + '/actions/' + action;
        }

        console.log("Test 111111 url panomera = " + url);
        console.log("Test 111111 mode panomera = " + mode);

        request.url = url;

        var successFn = function ( res ) {
            defer.resolve(res);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var seekInRecording = function ( sessionId, paneId, time ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'POST',
            url: origin+'/sessions/'+sessionId+'/panes/'+paneId+'/actions/seek',
            data: {
                time: time
            }
        };
        var successFn = function ( res ) {
            defer.resolve(res.data);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var getCameraPosition = function ( sessionId, paneId ) {
        var defer = $q.defer();
        var request = {
            header: jsonHeader,
            method: 'GET',
            url: origin+'/sessions/'+sessionId+'/panes/'+paneId+'/ptz/position',
        }
        var successFn = function ( res ) {
            defer.resolve(res.data);
        }
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    }

    var cameraMoveTo = function ( sessionId, paneId, data ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'POST',
            url: origin+'/sessions/'+sessionId+'/panes/'+paneId+'/ptz/move/to',
            data: data
        };
        var successFn = function ( res ) {
            defer.resolve(res);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var cameraMoveBy = function ( sessionId, paneId, data ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'POST',
            url: origin+'/sessions/'+sessionId+'/panes/'+paneId+'/ptz/move/by',
            data: data
        };
        var successFn = function ( res ) {
            defer.resolve(res);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var cameraMoveStop = function ( sessionId, paneId ) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'POST',
            url: origin+'/sessions/'+sessionId+'/panes/'+paneId+'/ptz/move/stop'
        };
        var successFn = function ( res ) {
            defer.resolve(res);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };

    var getPane = function (sessionId) {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'GET',
            url: origin+'/sessions/'+sessionId+'/panes'
        }
        var successFn = function ( res ) {
            defer.resolve(res);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise
    };

    var applyPreset = function (sessionId, paneId, presetNumber) {
      var defer = $q.defer();
      var request = {
        headers: jsonHeader,
        method: 'POST',
        url: origin+'/sessions/'+sessionId+'/panes/'+paneId+'/ptz/use/preset',
        data: presetNumber
      }
      var successFn = function ( res ) {
        defer.resolve(res);
      };
      var errorFn = function ( err ) { defer.reject(err); };
      $http( request ).then( successFn, errorFn );
      return defer.promise
    };

    var getListPresets = function () {
      var defer = $q.defer();
      var request = {
        headers: jsonHeader,
        method: 'GET',
        url: origin+'/sessions/'+sessionId+'/panes/'+paneId+'/ptz/use/preset/' + presetNumber
      }
      var successFn = function ( res ) {
        defer.resolve(res);
      };
      var errorFn = function ( err ) { defer.reject(err); };
      $http( request ).then( successFn, errorFn );
      return defer.promise
    };



/*  ----------------------------------------------------------------------------- */

    var formatVideo = function(cid, formatType, activeMode) {
        activeMode = activeMode === cameraModes.REPLAY ? cameraModes.RECORDING : cameraModes.LIVE;
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'POST',
            url: origin+'/channels/'+cid+'/'+activeMode+'/'+formatType
        };
        var successFn = function ( res ) {
            defer.resolve(res);
        };
        var errorFn = function ( err ) { defer.reject(err); };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    }

/*  ----------------------------------------------------------------------------- */

    function parseChannelStreams ( data ) {
        var returnArray = [];
        angular.forEach(data, function (obj, index) {
            var newObj = obj;
            newObj.live = obj.displayName.indexOf('Live')!==-1 ? true : false;
            returnArray.push(newObj);
        });
        return returnArray;
    }

    var getVersionFrontend = function () {
        return $http.get("package.json");
    }

    var getVersionBackend = function() {
      var defer = $q.defer();
      var request = {
        headers: jsonHeader,
        method: 'GET',
        url:  origin + '/system'
      };
      var successFn = function ( res ) {
        defer.resolve(res);
      };
      var errorFn = function ( err ) { defer.reject(err); };
      $http( request ).then( successFn, errorFn );
      return defer.promise;
    }


    var getIpPublic = function() {
        var defer = $q.defer();
        var request = {
            headers: jsonHeader,
            method: 'GET',
            url: 'https://ipinfo.io/json'
        };

        $http(request).then(successFn, errorFn);
        return defer.promise;

        function successFn(res) {
            defer.resolve(res);
        }
        function errorFn(err) {
            defer.reject(err);
        }
    }

/*  ----------------------------------------------------------------------------- */

    this.getChannels            = getChannels;
    this.getChannelInfo         = getChannelInfo;
    this.getChannelStream       = getChannelStream;
    this.getRecordingStreamInfo = getRecordingStreamInfo;
    this.createSessionStream    = createSessionStream;
    this.getLiveStream          = getLiveStream;
    this.getRecordingStream     = getRecordingStream;
    this.destroySession         = destroySession;
    this.getSessionState        = getSessionState;
    this.playbackAction         = playbackAction;
    this.seekInRecording        = seekInRecording;
    this.cameraMoveTo           = cameraMoveTo;
    this.cameraMoveBy           = cameraMoveBy;
    this.cameraMoveStop         = cameraMoveStop;
    this.getActionList          = getActionList;
    this.getCameraPosition      = getCameraPosition;
    this.formatVideo            = formatVideo;

    this.getPane                = getPane;
    this.getVersionFrontend     = getVersionFrontend;
    this.getVersionBackend      = getVersionBackend;
    this.getListPresets         = getListPresets;
    this.applyPreset            = applyPreset;
    this.getIpPublic            = getIpPublic;
    this.getChannelInfoByDevice = getChannelInfoByDevice;

    return this;

}]);
