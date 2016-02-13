/*globals DD, FCH */

(function() {
  'use strict';

  var debug = false;

  DD.analytics = {
    page: function(page_name) {
      if(debug) {
        return;
      }

      ga('send', {
        hitType: 'pageview',
        page: '/' + page_name
      });

      ga('send', 'screenview', { screenName: page_name });
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
