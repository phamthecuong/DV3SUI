(function() {
    'use strict';

    function SocketService(urls, typeMessages, typeDevices, $timeout, PanesFactory, listenerNames, UtilFactory) {
        var _candidate;
        var destinationId;
        var originId;
        var signalingUrl    = UtilFactory.getSignalingUrl();
        var iceServer       = {"iceServers":[{"url": urls.ICE_SERVER_URL}]};
        var connection      = {};
        var peerManager     = {};
        var socketManager   = {};

        setSocket(signalingUrl);

        //Client send request to server
        this.sendToServer   = sendToServer;
        this.sendPeerToPeer = sendPeerToPeer;
        this.setSocket      = setSocket;    

        /* -------------------- FUNCTION DETAILS -------------------- */
      
        function setSocket(newUrl) {
            if(newUrl === '') { return; }
            if(signalingUrl !== '' && socketManager[signalingUrl]) {
                socketManager[signalingUrl].io.disconnect();
            }
            
            if(angular.isUndefined(socketManager[newUrl])) {
                socketManager[newUrl] = io.connect(newUrl, {forceNew: true});
                socketManager[newUrl].on(typeMessages.MESSAGE, handleDataReceive)
            } else {
                socketManager[newUrl].io.connect();
            }
            
            signalingUrl = newUrl;
        }

        function handleDataReceive(object) {
            switch (object.type) {
                case typeMessages.WELCOME:
                    originId = object.id;
                    sendInfoToServer();
                    break;
                case typeMessages.USER_LIST:
                    break;
                case typeMessages.OFFER:
                    connectToControl(object.data, object.id);
                    break;
                case typeMessages.CANDIDATE:
                    receiveCandidate(object.data, object.id);
                default:
            }
        }

        function sendInfoToServer() {
            sendToServer(null, typeMessages.USER_INFO, typeDevices.PLAYER);
        }

        function connectToControl(offer, controlId) {
            var sdpConstraints = {
                'mandatory': {
                    'OfferToReceiveAudio': false,
                    'OfferToReceiveVideo': false
                }
            };

            var peerConnection = new webkitRTCPeerConnection(iceServer, connection);

            peerManager[controlId] = {};
            peerManager[controlId].peer = peerConnection;

            peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
                .catch(function(e) { console.log(e); });
            peerConnection.createAnswer(sdpConstraints).then(createAnswer);

            peerConnection.onicecandidate   = onicecandidate;
            peerConnection.ondatachannel    = ondatachannel;

            function createAnswer(answer) {
                return peerConnection.setLocalDescription(answer).then(function() {
                    sendToServer(controlId, typeMessages.ANSWER, answer);
                    peerManager[controlId].peer = peerConnection;
                })
            }

            function onicecandidate(e) {
                if(e.candidate && handleCandidate(e.candidate.candidate)) {
                    sendToServer(controlId, typeMessages.CANDIDATE, e.candidate);
                }
            }

            function ondatachannel(e) {
                console.log("---------- DATACHANNEL READY ----------");
                var playerChannel = e.channel;

                playerChannel.onopen = function() {
                    console.log("---------- DATACHANNEL OPENED ----------");
                    console.log("----- Send state of player to controller -----");
                    peerManager[controlId].channel = playerChannel;
                    var object = {};
                    object.splitIdx     = PanesFactory.getActiveSplitsIndex();
                    object.paneIdx      = PanesFactory.getActivePaneIndex();
                    object.activeMode   = PanesFactory.getActivePaneMode();
                    object.split        = PanesFactory.getActiveSplit();

                    sendPeerToPeer(controlId, typeMessages.INIT_PLAYER, object);
                }
                playerChannel.onclose = function() {console.log("---------- DATACHANNEL CLOSED ----------");}
                playerChannel.onerror = function() {console.log("--------- DATACHANNEL ERRORED ----------");}

                playerChannel.onmessage = function(e) {
                    handlePeerToPeer(e.data);
                }
            }

            function handleCandidate(candidate) {
                var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/
                var ip_addrs = ip_regex.exec(candidate);

                if (ip_addrs && typeof ip_addrs[0] !== 'undefined' && candidate.indexOf('network-cost')!==-1 && candidate.indexOf('udp')!==-1) {
                    return true;
                }
                return false;
            }
        }

        function sendToServer(id, type, data) {
            var object = {};
            object.id   = id;
            object.type = type;
            object.data = data;
            
            if(socketManager[signalingUrl]) {
                socketManager[signalingUrl].emit(typeMessages.MESSAGE, object);
            }
        }

        function receiveCandidate(data, controlId) {
            if(peerManager[controlId]) {
                var peer = peerManager[controlId].peer;
                peer.addIceCandidate(new RTCIceCandidate(data))
                    .catch(function(e) {
                    console.log(e);
                })
                peerManager[controlId].peer = peer;
            }
        }

        function sendPeerToPeer(controlId, type, data) {
            var dataSend = {};
            var keyArr = Object.keys(peerManager);

            dataSend.playerId = originId;
            dataSend.type = type;
            dataSend.data = data;
            
            dataSend = angular.toJson(dataSend);

            if(type === typeMessages.INIT_PLAYER) {
                var channel = peerManager[controlId].channel;
                handleChannelStatus(channel, dataSend);
            } else {
                for(var i = 0; i < keyArr.length; i++) {
                    if(keyArr[i] !== controlId) {
                        var channel = peerManager[keyArr[i]].channel;
                        handleChannelStatus(channel, dataSend);
                    }
                }
            }
        }

        function handleChannelStatus(channel, data) {
            switch(channel.readyState) {
                case 'open':
                    channel.send(data);
                    break;
                case 'connecting':
                    channel.onopen = function() {
                        channel.send(data);
                    }
                    break;
                case 'closing':
                    break;
                case 'closed':
                    break;
            }
        }

        function handlePeerToPeer(dataReceived) {
            dataReceived = angular.fromJson(dataReceived);

            switch(dataReceived.type) {
                case typeMessages.UPDATE_PANE:
                    PanesFactory.notifyEvent(listenerNames.UPDATE_PANE, dataReceived);
                    break;
                case typeMessages.UPDATE_SPLIT:
                    PanesFactory.notifyEvent(listenerNames.UPDATE_SPLIT, dataReceived);
                    break;
                case typeMessages.UPDATE_STREAM:
                    PanesFactory.setActivePaneIndex(dataReceived.data.channelObj.activePaneIdx);
                    PanesFactory.notifyEvent(listenerNames.REMOTE_STREAM, dataReceived);
                    break;
                case typeMessages.DISCONNECT_PANE:
                    PanesFactory.notifyEvent(listenerNames.DISCONNECT_PANE, dataReceived);
            }
        }
    }

    SocketService.$inject = ['URLS', 'TYPE_MESSAGES', 'TYPE_DEVICES', '$timeout', 'PanesFactory', 'LISTENER_NAMES', 'UtilFactory'];
    angular.module('app').service('SocketService', SocketService);
})();
