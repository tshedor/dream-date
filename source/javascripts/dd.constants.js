'use strict';

(function() {

  DD.constants = {
    ready: function() {
      this.setDefaults();
      this.has_touch = ( ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch )
    },

    setDefaults: function() {
      if(!this.last_mission) {
        this.last_mission = 0;
      }

      if(!this.max_mission) {
        this.max_mission = 0;
      }
    },

    get last_mission() {
      return parseInt( FCH.localGet('dreamdateappcom_last_mission_id') );
    },

    set last_mission(new_value) {
      return FCH.localSet('dreamdateappcom_last_mission_id', new_value);
    },

    get max_mission() {
      return parseInt( FCH.localGet('dreamdateappcom_max_mission_id') );
    },

    set max_mission(new_value) {
      return FCH.localSet('dreamdateappcom_max_mission_id', new_value);
    },

    get has_onboarded() {
      return FCH.localGet('dreamdateappcom_has_onboarded', new_value);
    },

    set has_onboarded(new_value) {
      return FCH.localSet('dreamdateappcom_has_onboarded', new_value);
    },

    missions: [
      {
        desc: "Opening scene",
        objectives: {
          "0" : {
              "type" : "audio",
              "content" : "1.0_1",
              "point" : 0,
              "nextValue" : 90
          },
          "50" : {
              "name" : "Lair Hill Bistro",
              "type" : "waypoint",
              "point" : [45.502544, -122.678885],
              "nextValue" : 100
          },
          "100" : {
            "type" : "blank"
          }
        }
      },
      {
        desc: "Opening scene",
        objectives: {
          "0" : {
              "type" : "audio",
              "content" : "1.0_1",
              "point" : 0,
              "nextValue" : 90
          },
          "50" : {
              "name" : "Lair Hill Bistro",
              "type" : "waypoint",
              "point" : [45.502544, -122.678885],
              "nextValue" : 100
          },
          "100" : {
            "type" : "blank"
          }
        }
      },
      {
        desc: "Opening scene",
        objectives: {
          "0" : {
              "type" : "audio",
              "content" : "1.0_1",
              "point" : 0,
              "nextValue" : 90
          },
          "50" : {
              "name" : "Lair Hill Bistro",
              "type" : "waypoint",
              "point" : [45.502544, -122.678885],
              "nextValue" : 100
          },
          "100" : {
            "type" : "blank"
          }
        }
      },
      {
        desc: "Opening scene",
        objectives: {
          "0" : {
              "type" : "audio",
              "content" : "1.0_1",
              "point" : 0,
              "nextValue" : 90
          },
          "50" : {
              "name" : "Lair Hill Bistro",
              "type" : "waypoint",
              "point" : [45.502544, -122.678885],
              "nextValue" : 100
          },
          "100" : {
            "type" : "blank"
          }
        }
      },
    ]
  };
})();
