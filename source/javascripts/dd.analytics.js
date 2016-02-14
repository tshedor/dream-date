/*globals DD, FCH */

(function() {
  'use strict';

  var debug = false;

  DD.analytics = {
    /**
     * Log pages to Google Analytics
     * @param  {String} page_name
     * @param  {String} full_name
     * @see  {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications}
     */
    page: function(page_name, full_name) {
      if(debug) {
        return;
      }

      var page_with_slash = '/' + page_name;

      ga('set', {
        page: page_with_slash,
        title: full_name
      });

      ga('send', 'pageview');
    },

    /**
     * Log events to Google Analytics
     * @param  {String} category
     * @param  {String} action
     * @param  {String} label
     */
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
