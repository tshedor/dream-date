/*globals DD, FCH */

(function() {
  'use strict';

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
        selector: 'svg-lunch-room',
        content: 'Lunch Room',
        objectives: {
          '0': {
            type: 'audio',
            nextValue: 50
          },
          '50': {
            type: 'waypoint',
            nextValue: 100
          },
          '100': {
            type: 'blank'
          }
        }
      },
      {
        selector: 'svg-turbine-hall',
        content: 'Earthquake House',
        objectives: {
          '0': {
            type: 'audio',
            nextValue: 50
          },
          '50': {
            type: 'waypoint',
            nextValue: 100
          },
          '100': {
            type: 'blank'
          }
        }
      },
      {
        selector: 'svg-physics-lab',
        content: 'Physics Lab',
        objectives: {
          '0': {
            type: 'audio',
            nextValue: 50
          },
          '50': {
            type: 'waypoint',
            nextValue: 100
          },
          '100': {
            type: 'blank'
          }
        }
      },
      {
        selector: 'svg-earth-hall',
        content: 'Earth Hall',
        objectives: {
          '0': {
            type: 'audio',
            nextValue: 50
          },
          '50': {
            type: 'waypoint',
            nextValue: 100
          },
          '100': {
            type: 'blank'
          }
        }
      },
      {
        selector: 'svg-planetarium',
        content: 'Planetarium',
        objectives: {
          '0': {
            type: 'audio',
            nextValue: 100
          },
          '100': {
            type: 'blank'
          }
        }
      }
    ]
  };
})();
