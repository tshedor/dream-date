'use strict';

(function() {
  /** @type {Boolean} Is geolocation approved and possible? */
  var accessible = true;

  DD.locate = {
    /** @type {Double} */
    lat: null,
    /** @type {Double} */
    lng: null,

    ready: function() {
      this.watchLocation();

      /** @type {Boolean} Is the app currently watching location changes? */
      var private_is_tracking = false;

      Object.defineProperty(this, 'is_tracking', {
        get: function(){
          return private_is_tracking;
        },

        set: function(new_value){
          var location_button = document.getElementById('js-location');

          if(new_value) {
            FCH.addClass(location_button, 'active');
          } else {
            FCH.removeClass(location_button, 'active');
          }

          private_is_tracking = new_value;
        },
      });

    },

    /**
     * Begin watching changes in user's location
     */
    watchLocation: function() {
      function error() {
        alert('To use Dream Date, please allow access to your location.');
        accessible = false;
      }

      function success(position) {
        this.is_tracking = true;
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      }

      if(navigator.geolocation && accessible) {
        if(this.is_tracking) {
          return;

        } else {

          navigator.geolocation.watchPosition(
            success.bind(this),
            error.bind(this),
            {
              enableHighAccuracy: true,
              maximumAge: 5000,
              timeout: 27000
            }
          );

          // Ensure tracking boolean is reset
          setTimeout(function() {
            DD.locate.is_tracking = false;
          }, 30100);

        }

      } else {
        alert('Our apologies, but your browser is not supported.');
        accessible = false;

      }
    },

    /**
     * Use Haversine formula to calculate distance between two points
     * @param Array<Double> origLatLng
     * @param Array<Double> newLatLng
     * @param {Double}
     */
    distance: function(origLatLng, newLatLng) {
      var orig_lat = origLatLng[0];
      var orig_lng = origLatLng[1];

      var new_lat = newLatLng[0];
      var new_lng = newLatLng[1];

      var distance_lat = (orig_lat - new_lat) * Math.PI / 180;
      var distance_lng = (orig_lng - new_lng) * Math.PI / 180;
      var a = 0.5 - Math.cos(distance_lat) / 2 + Math.cos(new_lng * Math.PI / 180) * Math.cos(orig_lat * Math.PI / 180) * (1 - Math.cos(distance_lng)) / 2;

      return Math.round(6371000 * 2 * Math.asin(Math.sqrt(a)));
    },

    /**
     * Find distance from current location
     * @param  {Double} lat
     * @param  {Double} lng
     * @return {Double|Boolean} False if error encountered
     */
    currentDistance: function(lat, lng) {
      // Exit early if no location
      if(!navigator.geolocation || !accessible) {
        console.warn('Browser not supported');
        return false;
      }

      function error() {
        console.warn('Could not determine your location.');
        return false;
      }

      // Update coordinates on parent
      function success(position) {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        return this.distance([lat, lng], [this.lat, this.lng]);
      }

      // Use establish coordinates if they're available
      if(this.is_tracking) {
        return this.distance([lat, lng], [this.lat, this.lng]);
      } else {
        return navigator.geolocation.getCurrentPosition(success.bind(this), error, { enableHighAccuracy: true });
      }
    },

    /**
     * If user is within region, trigger next mission
     */
    withinRegion: function() {
      if(DD.plot.current_mission) {

        if(this.currentDistance(DD.plot.current_mission.latitude, DD.plot.current_mission.longitude) <= 10) {
          DD.plot.nextMission();

        }
      }
    }
  };

})();
