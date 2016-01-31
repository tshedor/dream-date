'use strict';

(function() {

  var switcher_y_pos = 0;
  var allow_to_fire = true;

  var switcher = document.getElementById('js-switcher');
  var inner = document.getElementById('js-inner-switcher');

  function hideAllViewsExcept(display_view_id){
    FCH.loopAndExecute('.js-view.active', function(view) {
      FCH.removeClass(view, 'active');
    });

    if(display_view_id) {
      var view = document.getElementById('js-' + display_view_id + '-view');
      FCH.addClass(view, 'active');
    }
  }

  /**
   * Show onboarding and remove overlay when button clicked
   */
  function onClickListeners() {
    var onboarding = document.getElementById('js-onboarding-button');
    onboarding.addEventListener('click', hideAllViewsExcept.bind(null, 'onboarding'));

    FCH.loopAndExecute('.js-overlay-close', function(close_button) {
      close_button.addEventListener('click', hideAllViewsExcept);
    });
  }

  /**
   * Control switcher and snap numbers to box
   */
  function snapSwitcher() {
    var threshold = 30;

    /**
     * Save touch start position
     * @param  {Event} e
     */
    function switcherUpdate(e) {
      switcher_y_pos = e.touches[0].pageY;
    }

    /**
     * Update params to allow touch move events to fire - prevents duplicate firings
     * @return {setTimeout}
     */
    function resetAllowToFire() {
      allow_to_fire = false;

      function changeAllowToFire() {
        allow_to_fire = true;
      }

      return setTimeout(changeAllowToFire, 500);
    }

    /**
     * On touch move, advance or descrease number
     * @boundTo DD.navigation
     * @param  {Event} e
     * @fires changeItem
     */
    function switcherMoveUpdate(e) {
      if(!allow_to_fire) {
        return;
      }

      var pos_y = e.touches[0].pageY;

      var plus_threshold = switcher_y_pos + threshold;
      var minus_threshold = switcher_y_pos - threshold;

      if(pos_y >= plus_threshold) {
        // Move to previous
        this.updateSwitcher(false);
        resetAllowToFire();

      } else if (pos_y <= minus_threshold ) {
        // Move to next
        this.updateSwitcher(true);
        resetAllowToFire();

      }
    }

    /**
     * Determine if switcher change will be next or previous based on click position
     * @boundTo DD.navigation
     * @param  {Event} e
     */
    function nextOrPreviousClick(e) {
      // If on the bottom half of the switcher, go to next
      if(e.offsetY >= 25) {
        this.updateSwitcher(true);

      // If on the top half, go to previous
      } else {
        this.updateSwitcher(false);

      }
    }

    // Bind listeners depending on touch availability
    if( ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch ) {
      switcher.addEventListener('touchstart', switcherUpdate);
      switcher.addEventListener('touchmove', switcherMoveUpdate.bind(this));
    } else {
      switcher.addEventListener('click', nextOrPreviousClick.bind(this));
    }
  }

  DD.navigation = {

    ready: function() {
      onClickListeners();
      snapSwitcher.call(this);
    },

    /**
     * Modify switcher number
     * @param  {Boolean|Integer} next - Whether or not to increase number, or a number to increase to
     * @param {Boolean} [should_fire_resume=true]
     * @see  snapSwitcher | DD.plot.resume
     */
    updateSwitcher: function(next, should_fire_resume) {
      should_fire_resume = FCH.setDefault(should_fire_resume, true);

      var switcher_space = 50;
      var style = inner.getAttribute('style');
      var transform = 0;
      var y_regex = new RegExp(/.*3d\(0\,(-?\d{1,3})px\,0\)/);

      // Find the Y value of the translate3d transform
      var transform = parseInt( inner.getAttribute('style').match(y_regex)[1] );

      if(typeof(next) === 'boolean'){
        if(next) {
          transform -= switcher_space;
        } else {
          transform += switcher_space;
        }
      } else {
        if(next > 0) {
          transform = (next * -50) - 50;
        } else {
          transform = 0;
        }
      }

      if(transform >= -150 && transform <= 0) {
        inner.setAttribute('style', 'transform: translate3d(0,' + transform + 'px,0)');

        // Update indicators of previous/next
        var current_mission = (Math.abs(transform) + 50) / 50;
        if(current_mission === 1) {
          FCH.removeClass(switcher, '-prev');
          FCH.addClass(switcher, '-next');

        } else if(current_mission === 4) {
          FCH.removeClass(switcher, '-next');
          FCH.addClass(switcher, '-prev');

        } else {
          FCH.addClass(switcher, '-prev');
          FCH.addClass(switcher, '-next');
        }

        if(should_fire_resume) {
          // Minus 1 because `DD.plot.missions` and js-scene-<int> are zero-indexed
          var zero_indexed_current_mission = current_mission - 1;
          var mission_node = document.getElementById('js-scene-' + zero_indexed_current_mission);

          if(!FCH.hasClass(mission_node, '-disabled')) {
            DD.plot.resume(zero_indexed_current_mission);
          }
        }
      }
    }

  };

})();
