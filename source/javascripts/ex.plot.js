'use strict';

(function() {

  EX.plot = {
    missions: [],
    current_mission: null,

    ready: function() {
      this.seedMissions(16);

      Object.defineProperty(this, 'current_mission', {
        set: function(new_value) {
          EX.constants.last_mission = new_value.id;
          // TODO - update conversation view

          return new_value;
        }
      });
    },

    seedMissions: function(missionCount) {
      for(var i = 0; i < missionCount; i++) {
        var mission = new Mission(i);
        this.missions.push( mission );
      }

      this.current_mission = this.missions[0];
    },

    resume: function(id) {
      var cached_mission_id = EX.constants.last_mission;

      if(cached_mission_id) {
        id = FCH.setDefault(id, parseInt( cached_mission_id ) );
      } else {
        id = 0;
      }

      // TODO get all messages

      this.current_mission = this.missions[id];

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

    missionObjectiveDidUpdate: function() {
      EX.player.missionObjectiveDidUpdate();
      // TODO update contacts view
      // TODO update replay view
    }
  };

})();
