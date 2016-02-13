/*globals DD, FCH */

(function() {
  'use strict';

  var switcher = document.getElementById('js-switcher');
  var inner = document.getElementById('js-inner-switcher');
  var directions = document.getElementById('js-directions');

  /**
   * Display transcript window
   */
  function openTranscriptWindow() {
    var transcipt_identifier = 'transcript-' + DD.plot.current_mission.id;

    var transcript_window = document.getElementById('js-' + transcipt_identifier);

    DD.analytics.page(transcipt_identifier);
    FCH.addClass(transcript_window, 'active');
  }

  /**
   * Rewind all scenes and go back to the good ol' days in the first scene
   */
  function resetAfterCompletion() {
    DD.plot.current_mission.objectiveComplete();

    FCH.loopAndExecute(DD.plot.missions, function(mission) {
      mission.replay();
    });

    DD.plot.resume(0);
    DD.plot.removeMapMarkers();

    FCH.removeClass(directions, 'active');
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
    } else {
      DD.analytics.page('');
    }
  }

  /**
   * Show onboarding and remove overlay when button clicked
   */
  function onClickListeners() {
    var onboarding = document.getElementById('js-onboarding-button');
    onboarding.addEventListener('click', hideAllViewsExcept.bind(null, 'onboarding'));


    var completion_close = document.getElementById('js-completion-close');
    completion_close.addEventListener('click', resetAfterCompletion);

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
   * After transition, reset directions styling for the next time the directions bar appears
   * @see  directionSpeedbump#acknowledgeDirections
   */
  function resetDirectionsElem() {
    FCH.removeClass(directions, 'active');
    directions.removeAttribute('style');
  }

  /**
   * Overlay on player must be dismissed by swipe or click before scene advances
   */
  function directionsSpeedbump() {
    function acknowledgeDirections(next) {
      DD.analytics.event('Navigation', 'Directions', ('Advance from ' + DD.plot.current_mission.id) );

      DD.utils.translate(this.el, FCH.dimensions.ww, '0.4s');

      DD.plot.updateMap(true);

      setTimeout(resetDirectionsElem, 400);

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

      var switcher_space = 38;
      var style = inner.getAttribute('style');
      var transform = 0;
      var max_transform = (DD.constants.mission_count * switcher_space * -1) + switcher_space;

      // Find the Y value of the translate3d transform
      transform = DD.utils.vertTranslate(inner);

      if(typeof(next) === 'boolean'){
        if(next) {
          DD.analytics.event('Navigation', 'Switcher', 'Next');
          transform += switcher_space;
        } else {
          DD.analytics.event('Navigation', 'Switcher', 'Previous');
          transform -= switcher_space;
        }
      } else {
        if(next <= 0) {
          transform = max_transform;
        } else {
          transform = (max_transform + (next * switcher_space));
        }
      }

      // Go back to start if it's too much or too little
      if(transform > 0 || transform < max_transform) {
        transform = max_transform;
      }

      // Update indicators of previous/next
      var current_mission = Math.abs( (Math.abs(transform) / switcher_space) - DD.constants.mission_count);
      if(current_mission === 1) {
        FCH.removeClass(switcher, '-after');
        FCH.addClass(switcher, '-before');

      } else if(current_mission === DD.constants.mission_count) {
        FCH.addClass(switcher, '-after');
        FCH.removeClass(switcher, '-before');

      } else {
        FCH.addClass(switcher, '-after');
        FCH.addClass(switcher, '-before');
      }

      // Minus 1 because `DD.plot.missions` and js-scene-<int> are zero-indexed
      var zero_indexed_mission = current_mission - 1;
      var mission_node = document.getElementById('js-scene-' + zero_indexed_mission);

      if(!FCH.hasClass(mission_node, '-disabled')) {
        DD.utils.translate(inner, transform, null, true);

        if(should_fire_resume) {
          DD.plot.resume(zero_indexed_mission, false);
        }
      } else {
        // Skip over disabled missions and go back to last-active one
        this.updateSwitcher(current_mission, should_fire_resume);
      }
    }

  };

})();
