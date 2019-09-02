(function() {
    'use strict';
    
    function SharedFactory() {
        var browserOpenPreview;
        var collapseSideLeft;
        var collapseSideRight;
        var getCollapseSideLeftStatus;
        var getCollapseSideRightStatus;
        var setCollapseSideLeftStatus;
        var setCollapseSideRightStatus;

        var loadEvent;
        var updatePagination;
        var setCurrentEvent;

        var openDetail;

        return {
            browserOpenPreview: browserOpenPreview,
            
            collapseSideLeft: collapseSideLeft,
            collapseSideRight: collapseSideRight,
            getCollapseSideLeftStatus: getCollapseSideLeftStatus,
            setCollapseSideLeftStatus: setCollapseSideLeftStatus,
            getCollapseSideRightStatus: getCollapseSideRightStatus,
            setCollapseSideRightStatus: setCollapseSideRightStatus,

            loadEvent: loadEvent,
            updatePagination: updatePagination,
            setCurrentEvent: setCurrentEvent,

            openDetail: openDetail
        };
    }
    angular.module('app').factory('SharedFactory', SharedFactory);
})();