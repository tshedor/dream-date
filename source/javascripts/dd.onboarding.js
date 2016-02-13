/*globals DD, FCH */

(function() {
  'use strict';

  var scenes = document.getElementById('js-scenes');
  var inner = document.getElementById('js-inner-scenes');
  var total_scenes = document.querySelectorAll('.onboarding-scene').length;
  var pagination = document.getElementById('js-onboarding-pagination');

  /**
   * Find index of list_item given the element
   * @param  {Node} list_item
   * @see {@link http://stackoverflow.com/a/11762035}
   * @return {Integer}
   */
  function findPositionOfPaginationItem(list_item) {
    var pagination_list_items = Array.prototype.slice.call( pagination.children );
    return pagination_list_items.indexOf( list_item );
  }

  /**
   * Advance scene
   * @param  {Boolean|Integer} next - Whether or not to increase number, or a number to increase to
   * @return {Integer} Updated transform position
   */
  function changeScene(next) {
    var switcher_space = document.documentElement.clientWidth;
    var full_onboarding_scene_width = (total_scenes - 1) * switcher_space;

    var index = findPositionOfPaginationItem( document.querySelector('.pagination li.active') );
    var transform = 0;
    var switcher_index = -1;

    // Find the X value of the translate3d transform
    if(typeof(next) === 'boolean'){
      if(next) {
        switcher_index = index < total_scenes ? (index + 1) : index;
        transform = (switcher_space * switcher_index * -1);
      } else {
        switcher_index = index > 0 ? (index - 1) : index;
        transform = (switcher_space * switcher_index * -1);
      }
    } else {
      if(next > 0) {
        // Negate the switcher space
        transform = ( next * (switcher_space * -1) );
      } else {
        transform = 0;
      }
    }

    // Always make sure we're going forwards, not backwards
    if( transform > 0 ) {
      transform = 0;
    }

    // Make sure we don't go past the last slide
    if( Math.abs(transform) > full_onboarding_scene_width ) {
      transform = full_onboarding_scene_width * -1;
    }

    inner.setAttribute('style', 'transform: translate3d(' + transform + 'px,0,0); transition: transform 0.4s;');

    // switcher_index isn't always calculated
    var index_position = ( (Math.abs(transform) + switcher_space) / switcher_space ) - 1;
    DD.analytics.event('Onboarding', 'Change To', index_position);

    // Update pagination
    FCH.removeClass(pagination.childNodes[index], 'active');
    FCH.addClass(pagination.childNodes[index_position], 'active');

    // Update active class on scenes
    FCH.removeClass(inner.childNodes[index], 'active');
    FCH.addClass(inner.childNodes[index_position], 'active');

    return transform;
  }

  /**
   * On pagination dots click, go to page
   */
  function onPaginationClick() {
    function changeToPagination() {
      var pagination_index = findPositionOfPaginationItem( this );
      DD.onboarding.swiper.last_transform = changeScene( pagination_index );
    }

    // Add it to all list items
    FCH.loopAndExecute(pagination.querySelectorAll('li'), function(list_item) {
      list_item.addEventListener('click', changeToPagination);
    });

    /**
     * Catch touch event that bubbles down from js-scenes
     */
    function allowCreditsTouchScroll(e) {
      e.stopPropagation();
    }

    var credits = document.querySelector('.onboarding-graphic.credits');
    credits.addEventListener('touchstart', stopP);
    credits.addEventListener('touchmove', stopP);
  }

  DD.onboarding = {

    ready: function() {
      onPaginationClick();

      this.swiper = new Swiper(scenes, {
        el: inner,
        callback: changeScene,
        touch_threshold: 180,
        click_threshold: (FCH.dimensions.ww / 2)
      });

      // I don't know why this works but this is necessary for the onboarding scene changes to work - TS
      // document.body.addEventListener('touchstart', function() {});
    },
  };

})();
