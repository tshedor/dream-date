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
      seedMissions.call(this, 4);

      Object.defineProperty(this, 'current_mission', {
        set: function(new_value) {
          DD.constants.last_mission = new_value.id;

          if(DD.constants.max_mission < new_value.id) {
            DD.constants.max_mission = new_value.id;
          }

          return new_value;
        }
      });
    },

    resume: function(id) {
      var cached_mission_id = DD.constants.last_mission;

      if(cached_mission_id) {
        id = FCH.setDefault(id, parseInt( cached_mission_id ) );
      } else {
        id = 0;
      }

      this.current_mission = this.missions[id];

      // Resume audio if current objective is an audio type
      this.current_mission.resumeAudio( this.current_mission.type === 'audio' );

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

    /**
     * If next mission is playable
     * @return {Boolean}
     */
    isNextEnabled: function() {
      return (this.current_mission.id + 1) <= DD.constants.max_mission;
    },

    missionObjectiveDidUpdate: function() {
      DD.player.missionObjectiveDidUpdate();
    }
  };

})();
