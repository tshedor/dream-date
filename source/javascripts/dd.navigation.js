'use strict';

(function() {

  function hideAllViewsExcept(display_view_id){
    FCH.loopAndExecute('.js-view.active', function(view) {
      FCH.removeClass(view, 'active');
    });

    if(display_view_id) {
      var view = document.getElementById('js-' + display_view_id + '-view');
      FCH.addClass(view, 'active');
    }
  }

  DD.navigation = {
    switcher_y_pos: 0,

    ready: function() {
      this.onClickListeners();

      if(!Modernizr.scrollsnappoints) {
        this.snapSwitcher();
      }
    },

    /**
     * Show onboarding and remove overlay when button clicked
     */
    onClickListeners: function() {
      var onboarding = document.getElementById('js-onboarding-button');
      onboarding.addEventListener('click', function() {
        hideAllViewsExcept('onboarding');
      });

      FCH.loopAndExecute('.js-overlay-close', function(close_button) {
        close_button.addEventListener('click', function() {
          hideAllViewsExcept();
        });
      })
    },

    snapSwitcher: function() {
      var switcher = document.getElementById('js-switcher');
      var threshold = 50;

      function switcherUpdate(e, scroll) {
        if(scroll) {
          this.switcher_y_pos = switcher.scrollTop;
        } else {
          var touches = e.originalEvent.touches[0];

          this.switcher_y_pos = touches.pageY;
        }
      }

      function switcherMoveUpdate(e, scroll) {
        var pos_y;

        if(scroll) {
          pos_y = switcher.scrollTop;
        } else {
          pos_y = e.originalEvent.touches[0].pageY;
        }

        var plus_threshold = this.switcher_y_pos + threshold;
        var minus_threshold = this.switcher_y_pos - threshold;

        if(pos_y >= plus_threshold) {
          alert('increase');
        } else if (pos_y <= minus_threshold ) {
          alert('decrease');
        }
      }

      if(Modernizr.touch) {
        switcher.addEventListener('touchstart', switcherUpdate.bind(this, false));
        switcher.addEventListener('touchend', switcherUpdate.bind(this, false));
        switcher.addEventListener('touchmove', switcherMoveUpdate.bind(this, false));
      } else {
        switcher.addEventListener('scroll', switcherMoveUpdate.bind(this, true));
        switcher.addEventListener('scroll', FCH.debounce( switcherMoveUpdate.bind(this, true) ));
      }
    }

  };

})();
