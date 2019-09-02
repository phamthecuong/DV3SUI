(function() {
    'use strict';

    function ParseHTMLService() {
      this.isLogin = function (data) {
        if (typeof data !== 'string') {
          return false;
        }
        var cleaned = data;
        cleaned = cleaned.replace(/\s{2,}/g, ' ');
        cleaned = cleaned.trim();
        var parsed = jQuery.parseHTML(cleaned);
        parsed = $('<div></div>').append(parsed);
        if (parsed.find('form input[name="username"]').length > 0 && parsed.find('form input[name="password"]').length > 0) {
          console.log('login form found');
          return true;
        } else {
          return false;
        }
      }

    }
    angular.module('app').service('ParseHTMLService', ParseHTMLService);
})();
