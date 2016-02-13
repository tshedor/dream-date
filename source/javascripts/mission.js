(function (window, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define([], factory(window));
  } else if (typeof exports === 'object') {
    module.exports = factory(window);
  } else {
    window.Mission = factory(window);
  }

})(window, function factory(window) {
  'use strict';

  var directions = document.getElementById('js-directions');

  /**
   * Retrieve maximum progress from local storage
   * @param  {Int} id
   * @return {Int} maximum progress
   */
  function loadMaximumProgress(id) {
    var stored_maximum = FCH.localGet('dreamdateappcom_max_progress' + id);

    if(stored_maximum) {
      stored_maximum = stored_maximum.split(',');

      return parseInt( stored_maximum[id] );

    } else {
      var initial_max_progress = [];

      for(var i = 0; i < DD.constants.mission_count; i++) {
        initial_max_progress.push( 0 );
      }

      FCH.localSet('dreamdateappcom_max_progress' + id, initial_max_progress.join(',') );

      return 0;
    }
  }

  /**
   * The Mission global initialization
   * @class
   * @param {Integer} id
   * @return {Mission}
   */
  function Mission(id) {
    var max_progress = loadMaximumProgress(id);

    this.id = id;

    this.type = '';
    this.max_progress = max_progress;
    this.mission_node = document.getElementById('js-scene-' + this.id);

    // If max_progress is greater than 0 or is equal/lessthan max mission, then remove the disabled specifier
    if(this.max_progress || this.id <= DD.constants.max_mission) {
      FCH.removeClass( this.mission_node, '-disabled');
    }

    var mission_object = DD.constants.missions[this.id];

    this.objectives = mission_object.objectives;
    this.waypoint_name = mission_object.content;
    this.map_selector = mission_object.selector;

    Object.defineProperty(this, 'max_progress', {
      get: function() {
        var stored_maximum = FCH.localGet('dreamdateappcom_max_progress' + this.id);
        stored_maximum = stored_maximum.split(',');

        return parseInt( stored_maximum[this.id] );
      },

      set: function(new_value) {
        var stored_maximum = FCH.localGet('dreamdateappcom_max_progress' + this.id);
        stored_maximum = stored_maximum.split(',');

        stored_maximum[ this.id ] = new_value;

        FCH.localSet('dreamdateappcom_max_progress' + this.id, stored_maximum.join(','));
      }
    });

    var private_progress = 0;
    Object.defineProperty(this, 'progress', {
      get: function() {
        return private_progress;
      },

      set: function(new_value) {
        this.progressSet(new_value);

        private_progress = new_value;

        // TODO - does this execute BEFORE or AFTER the progress is set?
        // (it executes after)
        DD.plot.missionObjectiveDidUpdate();
      }
    });

    return this;
  };

  Mission.prototype.progressSet = function(objective) {
    if( !this.objectives.hasOwnProperty( String(objective) ) ) {
      return;
    }

    var executeNext = this.objectives[String(objective)];

    // Update maximum progress if it's less than the new progress
    if(this.max_progress < objective) {
      this.max_progress = objective;
    }

    if(objective === 100) {
      this.max_progress = 100;
      DD.plot.nextMission(this.id);
    } else {
      this.objectiveAction(executeNext);
    }
  };

  Mission.prototype.objectiveComplete = function(next_value) {
    if(typeof next_value === 'number') {
      if(next_value <= 100) {
        this.progress = next_value;
      }
    } else {
      next_value = FCH.setDefault(next_value, this.objectives[this.progress]);

      if(next_value.hasOwnProperty('nextValue')) {
        next_value = next_value['nextValue'];
        this.progress = next_value;
      } else {
        this.progress = 100;
      }
    }

    return this.progress;
  };

  Mission.prototype.objectiveAction = function(data) {
    this.type = data.type;

    var objective_label = this.id + ' - ' + this.progress + ' [' + this.type + ']';
    DD.analytics.event('Mission', 'Objective Start', objective_label);

    switch(this.type) {
      case 'audio' :
        DD.player.resumeTrack( this.id );

      break;
      case 'waypoint' :
        FCH.addClass(directions, 'active');

        // Update span title and activate directions bar
        directions.querySelector('span').innerHTML = this.waypoint_name;
        console.log('fire')
        DD.plot.updateMap();

      break;
      case 'blank' :
        this.objectiveComplete();

      break;
    }
  };

  Mission.prototype.replay = function() {
    this.progress = 0;
  };

  return Mission;

});
