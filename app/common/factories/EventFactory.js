(function(){
    'use strict';
    
    function EventFactory(){
        var incidentList = [
            {
                type: "BookMarkEvent",
                created: "10/10/2017",                
                encoderName: "encodername",
                encoderNumber: "encodername",
                description: "abc",
                id: 1    
            },
            {
                type: "BookMarkEvent",
                created: "10/10/2017",
                encoderName: "encodername",
                encoderNumber: "encodername",
                description: "def",
                id: 2    
            },
            {
                type: "BookMarkEvent",
                created: "10/10/2017",
                encoderName: "encodername",
                encoderNumber: "encodername",
                description: "fgj",
                id: 3   
            }
        ];
        
        var selectedIncidentId = 1;
        
        var _parmas = {
            type: "",
            page: 0,
            size: 20,
            sort: "created,desc",
        };
        var _dataPost = {criterias:[]};

        var services = {
            getIncidentList: getIncidentList,
            getSelectedIncidentId: getSelectedIncidentId,
            getIncident: getIncident,
            setIncident: setIncident,

            getParams: getParams,
            getDataPost: getDataPost
        };
        return services;

        /* ------------------------- FUNCTION DETAIL ------------------------ */
        
        function getIncidentList() {
            return incidentList;
        }
        
        function getSelectedIncidentId(){
            return selectedIncidentId;
        }
        
        function getIncident(id) {
            var incident = null;
            var idx = incidentList.map(function(item) { return item.id; }).indexOf(id);
            if(idx !== -1) {
                incident = incidentList[idx];
            }
            return incident;
        }
        
        function setIncident(incident) {
            var idx = incidentList.map(function(item) { return item.id; }).indexOf(incident.id);
            if(idx !== -1) {
                incidentList[idx] = incident;
            }
        }

        //---------------------------------------------------

        function getParams(){
            return _parmas;
        }

        function getDataPost(){
            return _dataPost;
        }
    }
    angular.module('app').factory('EventFactory', EventFactory);
    
})();