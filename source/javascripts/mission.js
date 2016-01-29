'use strict'

/**
 * The Mission global initialization
 * @class
 */
function Mission(id) {
  /** @lends Mission.prototype */
  return this.init(id);
}

(function() {

  /**
   * Make a message using an objective object
   * @param  {Object} data
   * @param  {Int} id
   * @return {Message}
   */
  function generateMessage(data, id) {
    var content;

    if(data.messageType === 'location') {
      var points = data.point;
      content = points[0] + ',' + points[1];
    }

    var message = new Message({
      senderId: data.sender,
      content: content,
      nextValue: data.nextValue,
      type: data.messageType,
      missionId: id,
      conversationWith: data.conversationWith
    });

    return message;
  }

  /**
   * Find the index in the array of the current track being played
   * @param  {Int} from_point
   * @return {Int}
   */
  function currentTrackIndex(from_point) {
    from_point = FCH.setDefault(from_point, this.progress);

    // If we're on the money, return that as the current track index
    if(this.tracks.indexOf(from_point) !== -1) {
      return this.tracks.indexOf(from_point);
    } else {
      var lower_track = 0;

      // If we're at the ceiling, grab the last track
      if(this.maximumProgress === 100) {
        return (this.tracks.length - 1);

      } else {

        // Loop through until we find something bigger then exit
        for(var i = 0; i < tracks.length; i++) {
          if(tracks[i] >= this.maximumProgress) {
            lower_track = tracks[i];

            break;
          }
        }
      }

      // See where that is in the array
      var track_index = this.tracks.indexOf(lower_track);

      if(track_index !== -1) {
        if(track_index === 0) {
          return track_index;
        } else {
          return (track_index - 1);
        }
      } else {
        return 0;
      }
    }
  }

  /**
   * Retrieve maximum progress from local storage
   * @param  {Int} id
   * @return {Int} maximum progress
   */
  function loadMaximumProgress(id) {
    var stored_maximum = FCH.localGet('theexchangeappcom_maximum_progress' + id);

    if(stored_maximum) {
      stored_maximum = stored_maximum.split(',');

      return parseInt( stored_maximum[id] );

    } else {
      var initial_max_progress = [];

      for(var i = 0; i < 16; i++) {
        initial_max_progress.push( 0 );
      }

      FCH.localSet('theexchangeappcom_maximum_progress' + id, initial_max_progress.join(',') );

      return 0;
    }
  }

  Mission.prototype.init = function(id) {
    var _this = this;
    var max_progress = loadMaximumProgress(id);

    this.id = id;

    function getMissionJSON(id) {
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        // Only move forward if we've got a clean response
        if (xhr.readyState !== 4 || xhr.status !== 200) {
          return;
        }

        var json = JSON.parse(xhr.responseText);

        _this.objectives = json['objectives'];
        _this.tracks = json['tracks'];
      };

      xhr.open('GET', '/tourist/Tourist' + id + '.json', true)
      return xhr.send();
    }

    this.type = '';
    this.destinationCoordinate = null;
    this.destinationObjective = null;
    this.maximumProgress = max_progress;

    Object.defineProperty(this, 'maximumProgress', {
      get: function() {
        var stored_maximum = FCH.localGet('theexchangeappcom_maximum_progress' + _this.id);
        stored_maximum = stored_maximum.split(',');

        return parseInt( stored_maximum[_this.id] );
      },

      set: function(new_value) {
        var stored_maximum = FCH.localGet('theexchangeappcom_maximum_progress' + _this.id);
        stored_maximum = stored_maximum.split(',');

        stored_maximum[ _this.id ] = new_value;

        FCH.localSet('theexchangeappcom_maximum_progress' + _this.id, stored_maximum.join(','));

        return new_value;
      }
    })

    Object.defineProperty(this, 'progress', {
      set: function(new_value) {
        this.destinationCoordinate = null;
        this.destinationObjective = null;
        this.progressSet(new_value);
        // TODO - does this execute BEFORE or AFTER the progress is set?
        EX.plot.missionObjectiveDidUpdate();

        return new_value;
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
    if(this.maximumProgress < objective) {
      this.maximumProgress = objective;
    }

    if(objective === 100) {
      this.maximumProgress = 100;
      EX.plot.nextMission();
    } else {
      if(objective === 0) {
        this.objectiveAction(executeNext);
      }
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

    switch(this.type) {
      case 'message' :
        var content;

        if(data.messageType === 'location') {
          var points = data.point;
          content = points[0] + ',' + points[1];
        }

        var message = generateMessage(data, id);

        message.send();

      break;
      case 'audio' :
        this.playAudio(data.content);

      break;
      case 'waypoint' :
        this.addWaypoint(data.point, data.nextValue);

      break;
      case 'follow' :
        this.drawFollowMarkers(data.point, data.nextValue, data.previousPoints);

      break;
      case 'prompt' :
        var prompt = new Prompt(data.yesValue, data.noValue);

        prompt.sender = data.sender;
        var content = data.content;

        if(data.promptType === 'audio') {
          prompt.audioFile = content;
        } else {
          prompt.text = content;
        }

        prompt.show();

      break;
      case 'blank' :
        this.objectiveComplete();

      break;
    }
  };

  Mission.prototype.replay = function() {
    this.progress = 0;
  };

  // MARK: Audio

  /**
   * Initiate previous track
   */
  Mission.prototype.previous = function() {
    var trackIndex = currentTrackIndex().bind(this);

    if(trackIndex !== 0) {
      trackIndex = trackIndex - 1
    }

    this.progress = this.tracks[trackIndex];

    this.repopulateMessages(progress);
  };

  /**
   * Initiate next track
   */
  Mission.prototype.next = function() {
    var trackIndex = currentTrackIndex().bind(this);
    var actualTracksCount = tracks.count - 1;

    if(trackIndex !== actualTracksCount) {
      trackIndex = trackIndex + 1;
    }

    this.progress = this.tracks[trackIndex];

    this.repopulateMessages(this.progress);
  };

  /**
   * See if current progress is a track position
   * @return {Boolean}
   */
  Mission.prototype.isProgressATrack = function() {
    return this.tracks.indexOf( this.progress ) !== -1;
  };

  /**
   * See if there's a previous track available
   * @return {Boolean}
   */
  Mission.prototype.isPreviousEnabled = function() {
    var track_index = currentTrackIndex().bind(this);

    // Enable button if greater than zero, otherwise, leave it disabled
    return track_index > 0;
  };

  /**
   * See if there's a next track available
   * @return {Boolean}
   */
  Mission.prototype.isNextEnabled = function() {
    var track_index = currentTrackIndex().bind(this);
    var max_track_index = currentTrackIndex(this.maximumProgress).bind(this);

    return track_index < max_track_index;
  };

  // MARK: Messages

  /**
   * Repopulate messages of self, but only up to a specific point
   * @param  {Int} progress_point_value
   * @return {Array<Message>}
   */
  Mission.prototype.repopulateMessages = function(progress_point_value) {
    progress_point_value = FCH.setDefault(progress_point_value, 100);

    var messages = [];
    var keys = Object.keys(this.objectives);

    for(var i = 0; i < keys.length; i++) {
      var item = this.objectives[ keys[i] ];

      if(item.nextValue <= progress_point_value) {
        break;
      }

      if(item.type === 'message') {
        var message = generateMessage(item, this.id);

        messages.push( message );
      }
    }

    return messages;
  };

})();
