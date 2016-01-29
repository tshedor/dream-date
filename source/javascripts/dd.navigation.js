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
    ready: function() {
      this.onClickListeners();
    },

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

  };

})();
