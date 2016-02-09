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


  /**
   * Move panel with translates
   * @param  {Event} e
   * @fires callback
   */
  function panelMoveUpdate(e) {
    if(!this.allow_to_fire) {
      return;
    }

    var new_pos = parseInt(e.touches[0].pageX);

    // If new position is less than starting position, user is swiping left
    if(new_pos <= this.start_pos) {
      new_pos = new_pos * -1;
    }

    this.el.setAttribute('style', 'transform: translate3d(' + (this.current_transform + new_pos) + 'px,0,0)');
  }

  /**
   * If the threshold isn't cleared by touchend, bounce back to the begining; otherwise, advance or decrease
   * @param  {Event} e
   */
  function panelEnd(e) {
    var end_pos = e.changedTouches[0].pageX;
    var changed_pos = this.start_pos - end_pos;
    var abs_changed_pos = Math.abs(changed_pos);

    if(abs_changed_pos < this.touch_threshold) {
      this.el.setAttribute('style',  'transform: translate3d(' + this.last_transform + 'px,0,0)');

    } else {
      // If negative, swipe was to the right
      if(changed_pos < 0) {
        resetAllowToFire.call(this);
        this.last_transform = this.callback(false);

      } else {
        resetAllowToFire.call(this);
        this.last_transform = this.callback(true);

      }

      this.current_transform = this.last_transform;
    }
  }

  /**
   * Determine if panel change will be next or previous based on click position
   * @param  {Event} e
   * @fires callback
   */
  function nextOrPreviousClick(e) {
    // If click occurs in a position that is greater than the threshold, go to next
    if(this.click_threshold > -1) {
      this.callback( e.pageX >= this.click_threshold );

    } else {
      this.callback(true);
    }
  }

  /**
   * Save touch start position
   * @param  {Event} e
   */
  function panelUpdate(e) {
    this.start_pos = e.touches[0].pageX;
  }

  /**
   * Update params to allow touch move events to fire - prevents duplicate firings
   */
  function resetAllowToFire() {
    this.allow_to_fire = false;
    clearTimeout(this.reset_timer);

    function changeAllowToFire() {
      this.allow_to_fire = true;
    }

    this.reset_timer = setTimeout(changeAllowToFire.bind(this), 100);
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
    this.el = elem
    this.start_pos = 0;
    this.allow_to_fire = true;
    // Default to noop function
    this.callback = options.callback || function() {};
    this.touch_threshold = FCH.setDefault(options.touch_threshold, 50);
    this.click_threshold = FCH.setDefault(options.click_threshold, (this.el.offsetWidth / 2));

    // setTimeout object holder
    this.reset_timer = null;
    this.last_transform = 0;
    this.current_transform = 0;

    // Bind listeners depending on touch availability
    if( DD.constants.has_touch ) {
      this.el.addEventListener('touchstart', panelUpdate.bind(this));
      this.el.addEventListener('touchmove', panelMoveUpdate.bind(this));
      this.el.addEventListener('touchend', panelEnd.bind(this));
    } else {
      this.el.addEventListener('click', nextOrPreviousClick.bind(this));
    }

    return this;
  }

  return Swiper;
});
