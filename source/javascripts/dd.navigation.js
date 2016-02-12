'use strict';

(function() {
  var switcher = document.getElementById('js-switcher');
  var inner = document.getElementById('js-inner-switcher');
  var directions = document.getElementById('js-directions');

  /**
   * Display transcript window
   */
  function openTranscriptWindow() {
    var transcipt_identifier = 'transcript-' + (DD.plot.current_mission.id + 1);

    var transcript_window = document.getElementById('js-' + transcipt_identifier);

    DD.analytics.page(transcipt_identifier);
    FCH.addClass(transcript_window, 'active');
  }

  /**
   * Remove all overlay views
   * @param  {String|Boolean} display_view_id
   */
  function hideAllViewsExcept(display_view_id){
    FCH.loopAndExecute('.js-view.active', function(view) {
      FCH.removeClass(view, 'active');
    });

    if(display_view_id) {
      DD.analytics.page(display_view_id);
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
      close_button.addEventListener('click', hideAllViewsExcept.bind(null, false));
    });

    var transcript = document.getElementById('js-transcript-button');
    transcript.addEventListener('click', openTranscriptWindow);

    // Once onboarding window is closed, ensure onboarding is marked as true
    var onboarding_close = document.getElementById('js-onboarding-close');
    onboarding_close.addEventListener('click', function() {
      DD.constants.has_onboarded = true;
    });

    switcher.addEventListener('click', this.updateSwitcher.bind(this, true));
  }

  /**
   * Ensure year is always updated even if a static build isn't completed
   */
  function applyYear() {
    var year = document.getElementById('js-year');
    year.innerHTML = new Date().getFullYear();
  }

  /**
   * Overlay on player must be dismissed by swipe or click before scene advances
   */
  function directionsSpeedbump() {
    function acknowledgeDirections(next) {
      console.log(directions)
      DD.analytics.event('Navigation', 'Directions', ('Advance from ' + DD.plot.current_mission.id) );

      FCH.removeClass(directions, 'active');
      DD.plot.current_mission.objectiveComplete();

      return FCH.dimensions.ww;
    }

    var swiper = new Swiper(directions, {
      callback: acknowledgeDirections,
      touch_threshold: 100,
      click_threshold: -1
    });
  }

  DD.navigation = {

    ready: function() {
      onClickListeners.call(this);
      applyYear();
      directionsSpeedbump();

      // Show onboarding screen
      if(!DD.constants.has_onboarded) {
        hideAllViewsExcept.call(null, 'onboarding');
      }
    },

    /**
     * Modify switcher number
     * @param  {Boolean|Integer} next - Whether or not to increase number, or a number to increase to
     * @param {Boolean} [should_fire_resume=true]
     * @see  snapSwitcher | DD.plot.resume
     * @return {Integer} Updated transform position
     */
    updateSwitcher: function(next, should_fire_resume) {
      should_fire_resume = FCH.setDefault(should_fire_resume, true);

      var switcher_space = 50;
      var style = inner.getAttribute('style');
      var transform = 0;
      var y_regex = new RegExp(/.*3d\(0\,(-?\d{1,3})px\,0\)/);

      // Find the Y value of the translate3d transform
      transform = parseInt( inner.getAttribute('style').match(y_regex)[1] );

      if(typeof(next) === 'boolean'){
        if(next) {
          DD.analytics.event('Navigation', 'Switcher', 'Next');
          transform -= switcher_space;
        } else {
          DD.analytics.event('Navigation', 'Switcher', 'Previous');
          transform += switcher_space;
        }
      } else {
        if(next > 0) {
          transform = (next * (switcher_space * -1) );
        } else {
          transform = 0;
        }
      }

      var max_transform = DD.constants.mission_count * switcher_space * -1;

      // Go back to start
      if(transform <= max_transform) {
        transform = 0;
      }

      if(transform >= (max_transform + switcher_space) && transform <= 0) {
        inner.setAttribute('style', 'transform: translate3d(0,' + transform + 'px,0)');

        // Update indicators of previous/next
        var current_mission = (Math.abs(transform) + switcher_space) / switcher_space;
        if(current_mission === 1) {
          FCH.removeClass(switcher, '-prev');
          FCH.addClass(switcher, '-next');

        } else if(current_mission === DD.constants.mission_count) {
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
            DD.plot.resume(zero_indexed_current_mission, false);
          }
        }
      }
    }

  };

})();
