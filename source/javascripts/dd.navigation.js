'use strict';

(function() {
  var switcher = document.getElementById('js-switcher');
  var inner = document.getElementById('js-inner-switcher');
  var directions = document.getElementById('js-directions');

  /**
   * Display transcript window
   */
  function openTranscriptWindow() {
    var id = DD.plot.current_mission.id;

    var transcript_window = document.getElementById('js-transcript-' + (id + 1));

    FCH.addClass(transcript_window, 'active');
  }

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
      close_button.addEventListener('click', hideAllViewsExcept.bind(null, false));
    });

    var transcript = document.getElementById('js-transcript-button');
    transcript.addEventListener('click', openTranscriptWindow);

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
      directions.style = 'transform: translate3d(100%, 0, 0)';
      FCH.removeClass(directions, 'active');
      DD.plot.current_mission.objectiveComplete();
    }

    var swiper = new Swiper(directions, {
      callback: acknowledgeDirections,
      touch_threshold: 100,
      click_threshold: directions.offsetWidth
    });
  }

  DD.navigation = {

    ready: function() {
      onClickListeners.call(this);
      applyYear();
      directionsSpeedbump();
    },

    /**
     * Modify switcher number
     * @param  {Boolean|Integer} next - Whether or not to increase number, or a number to increase to
     * @param {Boolean} [should_fire_resume=true]
     * @see  snapSwitcher | DD.plot.resume
     */
    updateSwitcher: function(next, should_fire_resume) {
      should_fire_resume = FCH.setDefault(should_fire_resume, true);

      console.log('fire');

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
          transform = (next * -50);
        } else {
          transform = 0;
        }
      }

      // Go back to start
      if(transform <= -200) {
        transform = 0;
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
            DD.plot.resume(zero_indexed_current_mission, false);
          }
        }
      }
    }

  };

})();
