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

  EX.navigation = {
    ready: function() {
      this.onClickListeners();
      this.tabbedBrowsing();
    },

    onClickListeners: function() {
      function onClickRevealPlayer() {
        var player = document.getElementById('js-player');

        if( FCH.hasClass(player, 'reveal') ) {
          FCH.removeClass(player, 'reveal');
        } else {
          FCH.addClass(player, 'reveal');
        }
      }

      var drag_indicator = document.getElementById('js-drag-indicator');
      drag_indicator.addEventListener('click', onClickRevealPlayer);

      var onboarding = document.getElementById('js-onboarding-button');
      onboarding.addEventListener('click', function() {
        hideAllViewsExcept('onboarding');
      });

      var replay = document.getElementById('js-replay-button');
      replay.addEventListener('click', function() {
        hideAllViewsExcept('replay');
      });

      FCH.loopAndExecute('.js-overlay-close', function(close_button) {
        close_button.addEventListener('click', function() {
          hideAllViewsExcept();
        });
      })
    },

    tabbedBrowsing: function() {
      function onClickChangeToTab() {
        var main_nav = document.getElementById('js-main-nav');
        var contacts_view = document.getElementById('js-contacts-view');
        var map_view = document.getElementById('js-map-view');

        if( FCH.hasClass(this, 'map-tab') ) {

          FCH.removeClass(main_nav, 'message-active');
          FCH.addClass(main_nav, 'map-active');

          FCH.removeClass(contacts_view, 'active');
          FCH.addClass(map_view, 'active');

        } else {
          FCH.removeClass(main_nav, 'map-active');
          FCH.addClass(main_nav, 'message-active');

          FCH.removeClass(map_view, 'active');
          FCH.addClass(contacts_view, 'active');

        }
      }

      FCH.loopAndExecute('.tab', function(tab) {
        tab.addEventListener( 'click', onClickChangeToTab );
      });
    }

  };

})();
