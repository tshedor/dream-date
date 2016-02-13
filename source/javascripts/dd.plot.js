/*globals DD, FCH */

(function() {
  'use strict';

  var map_id = '#map-rasterized';

  /**
   * Initialize missions array
   * @private
   * @param  {Integer} missionCount
   */
  function seedMissions(missionCount) {
    for(var i = 0; i < missionCount; i++) {
      var mission = new Mission(i);
      this.missions.push( mission );
    }
  }

  DD.plot = {
    missions: [],
    current_mission: null,

    ready: function() {
      var private_mission;
      Object.defineProperty(this, 'current_mission', {
        get: function() {
          return private_mission;
        },

        set: function(new_value) {
          DD.constants.last_mission = new_value.id;

          if(DD.constants.max_mission < new_value.id) {
            DD.constants.max_mission = new_value.id;
          }

          private_mission = new_value;
        }
      });

      seedMissions.call(this, DD.constants.mission_count);
      this.resume();
    },

    /**
     * Start/resume specific mission
     * @param  {Integer} id              Mission id
     * @param  {Boolean} [update_switcher=true] Should the switcher be modified
     * @return {Mission}
     */
    resume: function(id, update_switcher) {
      update_switcher = FCH.setDefault(update_switcher, true);

      if(typeof id === 'undefined') {
        var cached_mission_id = DD.constants.last_mission;

        if(cached_mission_id) {
          id = cached_mission_id;
        } else {
          id = 0;
        }
      }

      DD.analytics.event('Mission', 'Change To', id);
      this.current_mission = this.missions[id];

      FCH.removeClass(this.current_mission.mission_node, '-disabled');

      DD.player.pause();
      this.removeMapMarkers();
      this.current_mission.progress = 0;

      // Update switcher view
      if(update_switcher) {
        DD.navigation.updateSwitcher(id, false);
      }

      return this.current_mission;
    },

    nextMission: function(mission_id) {
      var nextMissionId = mission_id + 1;

      if(nextMissionId < this.missions.length) {
        DD.analytics.event('Mission', 'Change To', nextMissionId);
        this.resume(nextMissionId);

      } else {
        DD.analytics.page('completion');

        var completion_view = document.getElementById('js-completion-view');
        FCH.addClass(completion_view, 'active');
      }
    },

    /**
     * Strip all map markers and classes
     * @see {@link DD.navigation#resetAfterCompletion}
     */
    removeMapMarkers: function() {
      // Remove active classes from map SVG and add it to the appropriate one
      FCH.loopAndExecute(map_id + ' .active', function(active_item) {
        active_item.removeAttribute('class');
      });

      FCH.loopAndExecute(map_id + ' .present', function(active_item) {
        active_item.removeAttribute('class');
      });
    },

    /**
     * Remove animated map markers and set a new one
     * @param {Boolean} [set_to_present=false] - Remove active and set to present, disabling circle animation
     */
    updateMap: function(set_to_present) {
      set_to_present = FCH.setDefault(set_to_present, false);

      this.removeMapMarkers();

      var new_map_element = document.querySelector(map_id + ' #' + this.current_mission.map_selector);
      var klass = set_to_present ? 'present' : 'active';

      new_map_element.setAttribute('class', klass);
    },

    missionObjectiveDidUpdate: function() {
      var objective_label = this.current_mission.id + ' - ' + this.current_mission.progress + ' [' + this.current_mission.type + ']';
      DD.analytics.event('Mission', 'Objective Complete', objective_label);

      DD.zoom.resetZoom();
    }
  };

})();
