angular.module('dlvwc.semsy.api.factory')

.factory('SemsyApiFactory', [ 'Base64', 'URLS', '$rootScope', '$q', '$http', '$timeout', function ( Base64, URLS, $rootScope, $q, $http, $timeout ) {
    
    var origin = window.location.origin+'/SeMSyNext/rest';
    
    var basicAuth = '';
    var authPragma = '';
    
    var callback = false;
    var storedDefer = false;
    
    var auth = function () {
        console.log('SEMSY: do login first');
        var username = 'admin';
        var password = 'admin';
        basicAuth = Base64.encode(username + ':' + password);
        var defer = $q.defer();
        var url = origin+'/core/setusercredentials/admin/admin';
        var request = {
//            headers: jsonHeader,
            headers: {
                "Content-Type": "application/json", 
                "Authorization": "Basic "+basicAuth
            }, 
            method: 'GET', 
            url: url
        };
        var successFn = function ( res ) { 
            
            console.info('[SemsyApiFactory] auth(): success res:');
            console.log(res);
            console.info('[SemsyApiFactory] auth(): success header:');
            console.log(res.headers());
            
            authPragma = res.headers('pragma');
            
            console.info('--- basicAuth: '+basicAuth);
            console.info('--- pragma   : '+authPragma);
            
            semsyHeartbeat();
            
            if ( callback!==false ) { 
                callback(); 
            }
            
            defer.resolve(res.data); 
        };
        var errorFn = function ( err ) { 
//            console.error(err);
//            alert('error login');
            console.error('--- SEMSY auth error ---');
            console.error(err);
            defer.reject(err); 
        };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };
    
    var semsyHeartbeat = function () {
//        console.log('--- semsyHeartbeat ---');
        var url = origin+'/core/heartbeat';
        var request = {
            headers: { "Pragma": authPragma },
            method: 'GET',
            url: url
        };
        var successFn = function ( res ) { 
            console.info('[SemsyApiFactory] semsyHeartbeat(): response:');
//            console.log(res);
            $timeout( semsyHeartbeat, 20*1000);
        };
        var errorFn = function ( err ) { 
            alert('SeMSy session expired');
            console.error(err);
        };
        $http( request ).then( successFn, errorFn );
    };
    
    var cameraTree = function () {
//        var defer = $q.defer();
//        var request = {
//            headers: jsonHeader, 
//            method: 'GET', 
//            url: origin+'/channels'
//        };
//        var successFn = function ( res ) { 
////            console.info('[ApiFactory.getChannels()]: successFn(): response:');
////            console.log(res);
//            defer.resolve(res); 
//        };
//        var errorFn = function ( err ) { 
//            defer.reject(err); 
//        };
//        $http( request ).then( successFn, errorFn );
//        return defer.promise;
        
        callback = function () { return cameraTree(); };
        var defer = storedDefer ? storedDefer : $q.defer();
        var url = origin+'/core/getUserVideoChannelNavigation';
        var request = {
            headers: {
                "Content-Type": 'application/json', 
                "Authorization": 'Basic '+basicAuth, 
                "Pragma": authPragma
            },
            method: 'GET',
            url: url
        };
        var successFn = function ( res ) { 
            console.info('[SemsyApiFactory] cameraTree(): response:');
            console.log(res);
            
            var tree = parseCameraTree( res.data.result[0].data.videoChannelNavigation[0].children );
            
//            if ( res.status===401 || res.data.toString().indexOf('<!DOCTYPE html>')!==-1 ) {
//                $rootScope.$emit('openLogin');
//                storedDefer = defer;
//                return;
//            }
            
            console.info('--- cameraTree: naked navigation object ---');
            console.log(tree);
            
//            defer.resolve( res );
                
            defer.resolve( tree );
            
            storedDefer = false;
            callback = false;
        };
        var errorFn = function ( err ) { 
            
//            if ( err.status === 401 ) {
//                alert('auth');
//            }            
            
//            if ( err.status===-1 ) {
//                $rootScope.$emit('openLogin');
//                storedDefer = defer;
//                return; 
//            }
            console.error(err);
            defer.reject(err); 
        };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
        
    };
    
    var getVideoChannelInput = function () {
        callback = function () { return cameraTree(); };
        var defer = storedDefer ? storedDefer : $q.defer();
        var url = origin+'/core/getUserVideoChannelNavigation';
        var request = {
            headers: {
                "Content-Type": 'application/json', 
                "Authorization": 'Basic '+basicAuth, 
                "Pragma": authPragma
            },
            method: 'GET',
            url: url
        };
        var successFn = function ( res ) { 
            console.info('[SemsyApiFactory] cameraTree(): response:');
            console.log(res);
            
            var tree = parseCameraTree( res.data.result[0].data.videoChannelNavigation[0].children );
            
//            if ( res.status===401 || res.data.toString().indexOf('<!DOCTYPE html>')!==-1 ) {
//                $rootScope.$emit('openLogin');
//                storedDefer = defer;
//                return;
//            }
            
            console.info('--- cameraTree: naked navigation object ---');
            console.log(tree);
            
//            defer.resolve( res );
                
            defer.resolve( tree );
            
            storedDefer = false;
            callback = false;
        };
        var errorFn = function ( err ) { 
            
//            if ( err.status === 401 ) {
//                alert('auth');
//            }            
            
//            if ( err.status===-1 ) {
//                $rootScope.$emit('openLogin');
//                storedDefer = defer;
//                return;
//            }
            console.error(err);
            defer.reject(err); 
        };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
        
    };
    
    var getArchiver = function () {
        var defer = $q.defer();
        var url = origin+'/data/semsyArchiveServer/0/?withChildren=false';
        var request = {
            headers: {
                "Content-Type": 'application/json', 
                "Authorization": 'Basic '+basicAuth, 
                "Pragma": authPragma
            },
            method: 'GET',
            url: url
        };
        var successFn = function ( res ) { 
            console.info('[SemsyApiFactory] getSemsyArchiver(): response:');
            console.log(res);
            var archiveServer = res.data.result[0].data.semsyArchiveServer[0];
            console.info('archiveServer obj');
            console.log(archiveServer);
            defer.resolve(archiveServer);
        };
        var errorFn = function ( err ) { 
            console.error(err);
            defer.reject(err); 
        };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };
    
    var postBackup = function ( archiveServerId, data ) {
        var defer = $q.defer();
        var url = origin+'/archive/jobs/'+archiveServerId+'//';
        var request = {
            headers: {
                "Content-Type": 'application/json', 
                "Authorization": 'Basic '+basicAuth, 
                "Pragma": authPragma
            },
            method: 'POST',
            url: url, 
            data: data
        };
        var successFn = function ( res ) { 
            console.info('[SemsyApiFactory] postBackup(): response:');
            console.log(res);
            defer.resolve(res);
        };
        var errorFn = function ( err ) { 
            console.error(err);
            defer.reject(err); 
        };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };
    
    var getVideoChannelInputId = function ( navItemObjectId ) {
        var defer = $q.defer();
        var url = origin+'/data/videoChannelInput/0/?videoChannelID='+navItemObjectId;
        var request = {
            headers: {
                "Content-Type": 'application/json', 
                "Authorization": 'Basic '+basicAuth, 
                "Pragma": authPragma
            },
            method: 'GET',
            url: url
        };
        var successFn = function ( res ) { 
            console.info('[SemsyApiFactory] getVideoChannelInputId(): response:');
            console.log(res);
            defer.resolve(res);
        };
        var errorFn = function ( err ) { 
            console.error(err);
            defer.reject(err); 
        };
        $http( request ).then( successFn, errorFn );
        return defer.promise;
    };
    
/*  ----------------------------------------------------------------------------- */    
    
    function parseCameraTree ( data ) {
        
        var tree = [];
        
        angular.forEach(data, function (folderObj, folderIndex) {
            var folder = { 
                id: folderObj.ID, 
                objectId: folderObj.objectID, 
                label: folderObj.label, 
                originalObj: folderObj, 
                open: false, 
                devices: []
            };
            angular.forEach(folderObj.children, function (deviceObj, devideIndex) {
                var device = {
                    id: deviceObj.ID, 
                    displayName: deviceObj.label, 
                    objectId: deviceObj.objectID, 
                    encoderNumber: deviceObj.encoderNumber, 
                    type: deviceObj.type, 
                    originalObj: deviceObj
                };
                folder.devices.push(device);
            });
            tree.push(folder);
        });
        
        return tree;
        
    }
    
/*  ----------------------------------------------------------------------------- */        
    
    this.auth                   = auth;
    this.semsyHeartbeat         = semsyHeartbeat;
    this.cameraTree             = cameraTree;
    this.getVideoChannelInput   = getVideoChannelInput;
    this.getArchiver            = getArchiver;
    this.postBackup             = postBackup;
    this.getVideoChannelInputId = getVideoChannelInputId;
    
    return this;
    
}])

.factory('Base64', function () {
    /* jshint ignore:start */
  
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
  
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
  
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
  
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
  
            return output;
        },
  
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
  
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
  
                output = output + String.fromCharCode(chr1);
  
                if (enc3 !== 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output = output + String.fromCharCode(chr3);
                }
  
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
  
            } while (i < input.length);
  
            return output;
        }
    };
  
    /* jshint ignore:end */
});


