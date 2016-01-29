'use strict';

(function() {

  EX.locate = {
    ready: function() {
      this.watchLocation();
    },

    watchLocation: function() {
      function error() {
        alert('To use the Exchange, please allow access to your location.');
      }

      function success(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
      }

      if(navigator.geolocation) {
        navigator.geolocation.watchPosition(success, error, {enableHighAccuracy: true, maximumAge: 30000, timeout: 27000});
      } else {
        alert('Our apologies, but your browser is not supported.')
      }
    },

    distance: function(lat, lng) {
      // Exit early if no location
      if(!navigator.geolocation) {
        return alert('Our apologiess, but your browser is not supported');
      }

      /**
       * Use Haversine formula to calculate distance between two points
       */
      function calcDistance(currentLat, currentLng) {
        var distanceLat = (lat - currentLat) * Math.PI / 180;
        var distanceLng = (lng - currentLng) * Math.PI / 180;
        var a = 0.5 - Math.cos(distanceLat) / 2 + Math.cos(currentLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * (1 - Math.cos(distanceLng)) / 2;
        return Math.round(6371000 * 2 * Math.asin(Math.sqrt(a)));
      }

      function error() {
        alert('Could not determine your location.');
      }

      function success(position) {
        return calcDistance(position.coords.latitude, position.coords.longitude);
      }

      return navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });
    },

    withinRegion: function() {
      if(EX.plot.current_mission) {
        if(this.distance(EX.plot.current_mission.latitude, EX.plot.current_mission.longitude)) {
          EX.mission.nextMission()
        }
      }
    }
  };

})();
