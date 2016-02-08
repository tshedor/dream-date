'use strict';

(function() {
  var scenes = document.getElementById('js-scenes');
  var inner = document.getElementById('js-inner-scenes');
  var total_scenes = document.querySelectorAll('.onboarding-scene').length - 1;
  var pagination = document.getElementById('js-onboarding-pagination');

  /**
   * Advance scene
   * @param  {Boolean|Integer} next - Whether or not to increase number, or a number to increase to
   * @return {Integer} Updated transform position
   */
  function changeScene(next) {
    var transform = 0;

    var switcher_space = FCH.dimensions.ww;
    var style = inner.getAttribute('style');
    var x_regex = new RegExp(/.*3d\((-?\d{1,5})px\,0\,0\)/);

    // Find the X value of the translate3d transform
    transform = parseInt( inner.getAttribute('style').match(x_regex)[1] );
    if(typeof(next) === 'boolean'){
      if(next) {
        transform -= switcher_space;
      } else {
        transform += switcher_space;
      }
    } else {
      if(next > 0) {
        // Negate the switcher space
        transform = ( next * (switcher_space * -1) );
      } else {
        transform = 0;
      }
    }

    if(Math.abs(transform) <= (total_scenes * switcher_space) && transform <= 0) {
      inner.setAttribute('style', 'transform: translate3d(' + transform + 'px,0,0)');

      var index_position = ( (Math.abs(transform) + switcher_space) / switcher_space ) - 1;

      // Update pagination
      FCH.loopAndExecute(pagination.querySelectorAll('li'), function(list_item) {
        FCH.removeClass(list_item, 'active');
      });
      FCH.addClass(pagination.childNodes[index_position], 'active');

      // Update active class on scenes
      FCH.loopAndExecute(inner.querySelectorAll('.onboarding-scene'), function(scene) {
        FCH.removeClass(scene, 'active');
      });
      FCH.addClass(inner.childNodes[index_position], 'active');
    }

    return transform;
  }

  /**
   * On pagination dots click, go to page
   */
  function onPaginationClick() {
    function changeToPagination() {
      // http://stackoverflow.com/a/11762035
      var pagination_list_items = Array.prototype.slice.call( pagination.children );
      var pagination_index = pagination_list_items.indexOf( this );

      changeScene( pagination_index );
    }

    // Add it to all list items
    FCH.loopAndExecute(pagination.querySelectorAll('li'), function(list_item) {
      list_item.addEventListener('click', changeToPagination);
    });
  }

  DD.onboarding = {

    ready: function() {
      onPaginationClick();

      var swiper = new Swiper(inner, {
        callback: changeScene,
        touch_threshold: 300,
        click_threshold: (FCH.dimensions.ww / 2)
      });
    },
  };

})();
