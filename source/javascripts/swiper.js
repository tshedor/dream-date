/** @author Tim Shedor */

(function (window, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define([], factory(window));
  } else if (typeof exports === 'object') {
    module.exports = factory(window);
  } else {
    window.Swiper = factory(window);
  }

})(window, function factory(window) {
  'use strict';

  var panel_pos = 0;
  var allow_to_fire = true;
  var threshold = 25;
  var y_axis = true;
  // Noop function
  var callback = function() {};
  // setTimeout object holder
  var reset_timer;

  /**
   * On touch move, advance or descrease number
   * @param  {Event} e
   * @fires callback
   */
  function panelMoveUpdate(e) {
    if(!allow_to_fire) {
      return;
    }

    var new_pos;

    if(y_axis) {
      new_pos = e.touches[0].pageY;
    } else {
      new_pos = e.touches[0].pageX;
    }

    var plus_threshold = panel_pos + threshold;
    var minus_threshold = panel_pos - threshold;

    if(new_pos >= plus_threshold) {
      // Move to previous
      callback(false);
      resetAllowToFire();

    } else if (new_pos <= minus_threshold ) {
      // Move to next
      callback(true);
      resetAllowToFire();

    }
  }

  /**
   * Determine if panel change will be next or previous based on click position
   * @param  {Event} e
   * @fires callback
   */
  function nextOrPreviousClick(e) {
    // If on the bottom half of the panel, go to next
    if(e.offsetY >= threshold) {
      callback(true);

    // If on the top half, go to previous
    } else {
      callback(false);

    }
  }

  /**
   * Save touch start position
   * @param  {Event} e
   */
  function panelUpdate(e) {
    if(y_axis) {
      panel_pos = e.touches[0].pageY;
    } else {
      panel_pos = e.touches[0].pageX;
    }
  }

  /**
   * Update params to allow touch move events to fire - prevents duplicate firings
   * @return {setTimeout}
   */
  function resetAllowToFire() {
    allow_to_fire = false;
    clearTimeout(reset_timer);

    function changeAllowToFire() {
      allow_to_fire = true;
    }

    reset_timer = setTimeout(changeAllowToFire, 500);

    return reset_timer;
  }

  /**
   * New Swiper object
   * @param {Node} el - Panel to watch
   * @param {Function} private_callback - Fires with first argument (Boolean) declaring whether next pane is requested (right for X, down for Y)
   * @param {Boolean} [along_y_axis=true] - If listener should be applied along Y or X axis
   * @return {Swiper}
   */
  function Swiper(el, private_callback, along_y_axis) {
    along_y_axis = FCH.setDefault(along_y_axis, true);

    y_axis = along_y_axis;
    callback = private_callback;

    // Bind listeners depending on touch availability
    if( ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch ) {
      el.addEventListener('touchstart', panelUpdate);
      el.addEventListener('touchmove', panelMoveUpdate);
    } else {
      el.addEventListener('click', nextOrPreviousClick);
    }

    return this;
  }

  return Swiper;
});
