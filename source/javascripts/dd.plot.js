'use strict';

(function() {

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

    this.current_mission = this.missions[0];
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

      seedMissions.call(this, 4);
      this.resume();
    },

    resume: function(id) {
      var cached_mission_id = DD.constants.last_mission;

      if(cached_mission_id) {
        id = FCH.setDefault(id, cached_mission_id );
      } else {
        id = 0;
      }

      this.current_mission = this.missions[id];

      FCH.removeClass(this.current_mission.mission_node, '-disabled');

      // Resume audio if current objective is an audio type
      if(this.current_mission.max_progress >= 50 || this.current_mission.type === 'audio') {
        DD.player.resumeTrack(id);
      }

      // Update switcher view
      DD.navigation.updateSwitcher(id, false);

      return this.current_mission;
    },

    nextMission: function() {
      var nextMissionId = this.current_mission.id + 1;

      if(nextMissionId < this.missions.length) {
        this.resume(nextMissionId);
      } else {
        // TODO App complete
      }
    },

    missionObjectiveDidUpdate: function() {
      DD.player.missionObjectiveDidUpdate();
    }
  };

})();
