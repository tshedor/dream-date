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

  var el;
  var panel_pos = 0;
  var allow_to_fire = true;
  var touch_threshold;
  var click_threshold;
  // Noop function
  var callback = function() {};
  // setTimeout object holder
  var reset_timer;
  var last_transform = 'transform: translate3d(0px, 0, 0)';

  /**
   * On touch move, advance or descrease number
   * @param  {Event} e
   * @fires callback
   */
  function panelMoveUpdate(e) {
    if(!allow_to_fire) {
      return;
    }

    var new_pos = e.touches[0].pageX;

    // If new position is less than starting position, user is swiping left
    if(new_pos <= panel_pos) {
      new_pos = new_pos * -1;
    }

    var plus_threshold = panel_pos + touch_threshold;
    var minus_threshold = panel_pos - touch_threshold;

    el.setAttribute('style', 'transform: translate3d(' + parseInt(new_pos) + 'px, 0, 0)');

    if(new_pos >= plus_threshold) {
      // Move to previous
      resetAllowToFire();
      last_transform = callback(false);

    } else if (new_pos <= minus_threshold ) {
      // Move to next
      resetAllowToFire();
      last_transform = callback(true);

    }
  }

  /**
   * If the threshold isn't cleared by touchend, bounce back to the begining
   * @param  {Event} e
   */
  function panelEnd(e) {
    var new_pos = e.changedTouches[0].pageX;

    if(new_pos < touch_threshold) {
      el.setAttribute('style', last_transform);
    }
  }

  /**
   * Determine if panel change will be next or previous based on click position
   * @param  {Event} e
   * @fires callback
   */
  function nextOrPreviousClick(e) {
    // If click occurs in a position that is greater than the threshold, go to next
    if(click_threshold > -1) {
      callback( e.pageX >= click_threshold );

    } else {
      callback(true);
    }
  }

  /**
   * Save touch start position
   * @param  {Event} e
   */
  function panelUpdate(e) {
    panel_pos = e.touches[0].pageX;
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
   * @param {Object} options
     * @param {Function} callback - Fires with first argument (Boolean) declaring whether next pane is requested (right for X, down for Y)
     * @param {Integer} touch_threshold - How far a drag is completed before another panel is snapped
     * @param {Integer} click_threshold - How far from the edge before a click event snaps to another panel. Setting to -1 applies a click listener to the entire element
   * @return {Swiper}
   */
  function Swiper(elem, options) {
    el = elem
    callback = options.callback;
    touch_threshold = FCH.setDefault(options.touch_threshold, 50);
    click_threshold = FCH.setDefault(options.click_threshold, (el.offsetWidth / 2));

    // Bind listeners depending on touch availability
    if( DD.constants.has_touch ) {
      el.addEventListener('touchstart', panelUpdate);
      el.addEventListener('touchmove', panelMoveUpdate);
      el.addEventListener('touchend', panelEnd);
    } else {
      el.addEventListener('click', nextOrPreviousClick);
    }

    return this;
  }

  return Swiper;
});
