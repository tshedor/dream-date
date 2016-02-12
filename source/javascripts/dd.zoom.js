/*globals DD, FCH */

(function() {
  'use strict';

  var zoom_box = document.getElementById('js-map-zoom');
  var max = 3;
  var increment = 0.5;
  var min = 0.5;

  /**
   * Retrieve present level of zoom
   * @return {Double}
   */
  function zoomLevel() {
    return parseFloat( zoom_box.getAttribute('data-zoom-level') );
  }

  /**
   * Apply zoom increase or decrease
   * @param  {Event} e
   */
  function zoomChange(e) {
    var target = e.target;
    var is_plus = FCH.hasClass(target, '-plus');
    var current_level = zoomLevel();
    var modified_level = current_level;

    FCH.loopAndExecute('.js-zoom-control', function(control) {
      FCH.removeClass(control, '-disabled');
    });

    if(is_plus) {
      DD.analytics.event('Navigation', 'Zoom', 'Increase');

      if(current_level < max) {
        modified_level += increment;
      } else {
        FCH.addClass(target, '-disabled');
      }

      if(modified_level === max) {
        FCH.addClass(target, '-disabled');
      }
    } else {
      DD.analytics.event('Navigation', 'Zoom', 'Decrease');

      if(current_level >= 1) {
        modified_level -= increment;
      } else {
        FCH.addClass(target, '-disabled');
      }

      if(modified_level === min) {
        FCH.addClass(target, '-disabled');
      }
    }

    zoom_box.style.height = (100 * modified_level) + '%';
    zoom_box.setAttribute('data-zoom-level', modified_level);
  }

  /**
   * Show onboarding and remove overlay when button clicked
   */
  function onClickListeners() {
    FCH.loopAndExecute('.js-zoom-control', function(control) {
      control.addEventListener('click', zoomChange);
    });
  }

  DD.zoom = {

    ready: function() {
      onClickListeners();
    },

    /**
     * Set map back to start position
     * @see DD.plot.missionObjectiveDidUpdate
     */
    resetZoom: function() {
      FCH.loopAndExecute('.js-zoom-control', function(control) {
        FCH.removeClass(control, '-disabled');
      });

      zoom_box.style.height = '100%';
      zoom_box.setAttribute('data-zoom-level', 1);
    }

  };

})();
