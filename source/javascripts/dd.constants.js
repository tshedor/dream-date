'use strict';

(function() {

  DD.constants = {
    mission_count: 5,

    ready: function() {
      this.setDefaults();
      this.has_touch = !!( ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch )
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
      FCH.localSet('dreamdateappcom_last_mission_id', new_value);
    },

    get max_mission() {
      return parseInt( FCH.localGet('dreamdateappcom_max_mission_id') );
    },

    set max_mission(new_value) {
      FCH.localSet('dreamdateappcom_max_mission_id', new_value);
    },

    get has_onboarded() {
      return FCH.localGet('dreamdateappcom_has_onboarded');
    },

    set has_onboarded(new_value) {
      FCH.localSet('dreamdateappcom_has_onboarded', new_value);
    },

    missions: [
      {
        objectives: {
          '0': {
            type: 'audio',
            nextValue: 50
          },
          '50': {
            type: 'waypoint',
            selector: 'svg-turbine-hall',
            content: 'Earthquake House',
            nextValue: 100
          },
          '100': {
            type: 'blank'
          }
        }
      },
      {
        objectives: {
          '0': {
            type: 'audio',
            nextValue: 50
          },
          '50': {
            type: 'waypoint',
            selector: 'svg-physics-lab',
            content: 'Physics Lab',
            nextValue: 100
          },
          '100': {
            type: 'blank'
          }
        }
      },
      {
        objectives: {
          '0': {
            type: 'audio',
            nextValue: 50
          },
          '50': {
            type: 'waypoint',
            selector: 'svg-earth-hall',
            content: 'Earth Hall',
            nextValue: 100
          },
          '100': {
            type: 'blank'
          }
        }
      },
      {
        objectives: {
          '0': {
            type: 'audio',
            nextValue: 50
          },
          '50': {
            type: 'waypoint',
            selector: 'svg-planetarium',
            content: 'Planetarium',
            nextValue: 100
          },
          '100': {
            type: 'blank'
          }
        }
      },
      {
        objectives: {
          '0': {
            type: 'audio',
            nextValue: 50
          },
          '50': {
            type: 'waypoint',
            selector: 'svg-lunch-room',
            content: 'Lunch Room',
            nextValue: 100
          },
          '100': {
            type: 'blank'
          }
        }
      },
    ]
  };
})();
