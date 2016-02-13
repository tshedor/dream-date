/*globals DD, FCH */

(function() {
  'use strict';

  var debug = true;

  DD.analytics = {
    page: function(page_name) {
      if(debug) {
        return;
      }

      ga('send', {
        hitType: 'pageview',
        page: '/' + page_name
      });
    },

    event: function(category, action, label) {
      if(debug) {
        return;
      }

      ga('send', {
        hitType: 'event',
        eventCategory: category,
        eventAction: action,
        eventLabel: label
      });
    }
  };

})();
