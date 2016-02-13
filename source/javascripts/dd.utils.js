/*globals DD, FCH */

(function() {
  'use strict';

  /**
   * Detect any necessary prefixes
   * @see  {@link https://github.com/meandmax/lory/blob/master/dist/lory.js#L608}
   */
  function detectPrefixes() {
    var transform = undefined;
    var transition = undefined;

    (function () {
      var el = document.createElement('_');
      var style = el.style;

      var prop = undefined;

      if (style[prop = 'webkitTransition'] === '') {
          transition = prop;
      }

      if (style[prop = 'transition'] === '') {
          transition = prop;
      }

      if (style[prop = 'webkitTransform'] === '') {
          transform = prop;
      }

      if (style[prop = 'msTransform'] === '') {
          transform = prop;
      }

      if (style[prop = 'transform'] === '') {
          transform = prop;
      }

      document.body.insertBefore(el, null);
      style[transform] = 'translate3d(0,0,0)';
      document.body.removeChild(el);
    })();

    return {
      transform: transform,
      transition: transition
    };
  }

  var prefixes = detectPrefixes();

  DD.utils = {

    /**
     * Translate an element using translate3d and vendor prefixes (updates element)
     * @param  {Node} el
     * @param  {Integer} to
     * @param  {String} transition - If unsupplied, transition will not be applied
     * @see  {@link https://github.com/meandmax/lory/blob/master/dist/lory.js#L178}
     */
    translate: function(el, to, transition, y_axis) {
      var style = el && el.style;

      if (el.style) {
        if(transition) {
          el.style[prefixes.transition] = 'transform ' + transition;
        }

        if(y_axis) {
          el.style[prefixes.transform] = 'translate3d(0,' + to + 'px,0)';
        } else {
          el.style[prefixes.transform] = 'translate3d(' + to + 'px,0,0)';
        }
      }
    },

    /**
     * Find element's vertical translation based on its inline style
     * @param  {Node} el
     * @return {Integer}
     */
    vertTranslate: function(el) {
      var y_regex = new RegExp(/.*3d\(\w{1,3}?\,\s?(-?\d{1,3})px\,\s?\w{1,3}?\)/);

      // Find the Y value of the translate3d transform
      return parseInt( el.getAttribute('style').match(y_regex)[1] );
    }
  };

})();
