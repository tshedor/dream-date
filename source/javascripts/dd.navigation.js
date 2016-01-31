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
      var inner = document.getElementById('js-inner-switcher');
      var threshold = 10;
      var switcher_space = 50;

      function switcherUpdate(e) {
        this.switcher_y_pos = e.originalEvent.touches[0].pageY;
      }

      function switcherMoveUpdate(e) {
        var pos_y = e.originalEvent.touches[0].pageY - this.switcher_y_pos;

        var plus_threshold = this.switcher_y_pos + threshold;
        var minus_threshold = this.switcher_y_pos - threshold;

        if(pos_y >= plus_threshold) {
          changeItem(true);

        } else if (pos_y <= minus_threshold ) {
          changeItem(false)

        }
      }

      function changeItem(next) {
        next = FCH.setDefault(next, true);
        var style = inner.getAttribute('style');
        var transform = 0;
        var y_regex = new RegExp(/.*3d\(0\,(-?\d{1,3})px\,0\)/);

        var transform = parseInt( inner.getAttribute('style').match(y_regex)[1] );

        if(next) {
          transform -= switcher_space;
        } else {
          transform += switcher_space;
        }

        inner.setAttribute('style', 'transform: translate3d(0,' + transform + 'px,0)');
      }

      if(Modernizr.touch) {
        switcher.addEventListener('touchstart', switcherUpdate.bind(this));
        switcher.addEventListener('touchend', switcherUpdate.bind(this));
        switcher.addEventListener('touchmove', switcherMoveUpdate.bind(this));
      } else {
        switcher.addEventListener('click', changeItem);
      }
    }

  };

})();
