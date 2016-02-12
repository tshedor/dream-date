'use strict';

(function() {
  var player = document.getElementById('js-player');
  var track = document.getElementById('js-track');
  var scrubber = document.getElementById('js-scrubber-input');
  var progress = document.getElementById('js-scrubber-progress');
  var handle = document.getElementById('js-scrubber-handle');
  var control_button = document.getElementById('js-control-button');
  var audio_folder = '/static/audio/';

  // Cache track dimensions variables so that touch operations are less expensive
  var track_dimensions = {
    left: 0,
    right: 0,
    width: 0
  }
  var duration;

  var audio = new Audio();

  /**
   * Resets audio position, scrubber, and progress bar
   */
  function resetAudioProgress() {
    FCH.removeClass(control_button, 'notify');

    if( !audio.paused ) {
      this.pause();
    }

    audio.currentTime = 0;
    scrubber.value = 0;
    progress.style.width = '0%';

    // Reset everything
    audio.removeEventListener('canplaythrough', audioLoaded);
    audio.removeEventListener('load', audioLoaded);
    audio.removeEventListener('ended', audioEnded);
    audio = null;
  }

  /**
   * Once audio file is available, set duration and make player available for touch interactions
   */
  function audioLoaded() {
    // Remove all event listeners to prevent duplicate firing - sometimes iOS doesn't recognize canplaythrough and Chrome sometimes doesn't recognize loaded; it's absolute mayhem out there
    audio.removeEventListener('canplaythrough', audioLoaded);
    audio.removeEventListener('loaded', audioLoaded);

    scrubber.setAttribute('max', this.duration);
    duration = this.duration;
    FCH.addClass(player, '-ready');
  }

  /**
   * Once audio file plays through, reset scrubber and notify the hub in `DD.plot`
   * @fires DD.plot.current_mission.objectiveComplete()
   */
  function audioEnded() {
    // Prevent duplicate firing
    audio.removeEventListener('ended', audioEnded);

    DD.analytics.event('Player', 'Audio', 'Ended');

    this.currentTime = 0;
    scrubber.value = 0;
    control_button.src = control_button.getAttribute('data-play-src');
    DD.plot.current_mission.objectiveComplete();
  }

  /**
   * Change time position of the scrubber
   * @param  {Event} e
   */
  function updateScrubber(e) {
    var current_time = parseInt(this.currentTime, 10);
    scrubber.setAttribute('value', this.currentTime);

    var scrubber_input_val = parseInt( this.currentTime, 10 );
    var offset = scrubber_input_val / duration;

    progress.style.width = (offset * 100) + '%';
  }

  /**
   * Event listeners for play/pause and the scrubber
   */
  function controlsEventListeners() {
    /**
     * Play/Pause is changed
     */
    function onControlClick() {
      FCH.removeClass(control_button, 'notify');

      if( audio.paused ) {
        DD.analytics.event('Player', 'Control Button', (DD.plot.current_mission + ' - Play'));
        this.play();
      } else {
        DD.analytics.event('Player', 'Control Button', (DD.plot.current_mission + ' - Pause'));
        this.pause();
      }
    }
    control_button.addEventListener('click', onControlClick.bind(this) );

    /**
     * Determine scrubber position and update time
     * @param {Integer} new_value
     * @return {Integer}
     */
    function determineAudioPosition(new_value) {
      DD.player.audio.currentTime = new_value;

      var offset = new_value / duration;
      progress.style.width = (offset * 100) + '%';

      return offset;
    }

    /**
     * Slider updates handle and play bar as audio progresses
     */
    function onPlayScrubberChange() {
      var scrubber_value = parseInt(scrubber.value);
      determineAudioPosition( scrubber_value );
    }
    scrubber.addEventListener('input', onPlayScrubberChange.bind(this));

    /**
     * On track click, slider updates
     */
    function onTrackTouch(e) {
      var position_click = e.pageX - track_dimensions.left;
      var track_time = (position_click / track_dimensions.width) * duration;
      determineAudioPosition(track_time);
    }
    track.addEventListener('click', onTrackTouch);

    /**
     * On handle drag, slider updates
     */
    function onTouchHandle(e) {
      var pos = e.touches[0].pageX;
      var offset = pos - track_dimensions.left;

      var track_time = (offset / track_dimensions.width) * duration;

      // Don't allow user to go ALL the way to the end
      if(pos < (track_dimensions.right - 20)) {
        determineAudioPosition(track_time);
      }
    }

    /**
     * On mouse down, track mouse movement on screen and bind the mouseup listener
     */
    function onMouseDownHandle() {
      document.addEventListener('mousemove', onTrackTouch);
      document.addEventListener('mouseup', onMouseUpHandle);

      DD.player.pause();
    }

    /**
     * On mouse up, remove event listeners for mousemove and the mouseup to prevent duplicate firings
     */
    function onMouseUpHandle() {
      document.removeEventListener('mousemove', onTrackTouch);
      document.removeEventListener('mouseup', onMouseUpHandle);

      DD.player.play();
    }

    if(DD.constants.has_touch) {
      handle.addEventListener('touchstart', this.pause.bind(this) );
      handle.addEventListener('touchmove', onTouchHandle);
      handle.addEventListener('touchend', this.play.bind(this) );
    } else {
      handle.addEventListener('mousedown', onMouseDownHandle);
    }
  }

  DD.player = {
    audio: null,

    ready: function() {
      audio = this.resumeTrack( 0 );
      this.audio = audio;

      controlsEventListeners.call(this);

      var track_bounds = track.getBoundingClientRect();
      track_dimensions.left = track_bounds.left;
      // Handle width + absolute positioning to the right
      track_dimensions.right = track_bounds.right + 24;
      track_dimensions.width = track.offsetWidth;
    },

    play: function() {
      scrubber.setAttribute('max', audio.duration);
      duration = audio.duration;
      audio.addEventListener('timeupdate', updateScrubber);
      control_button.querySelector('img').src = control_button.getAttribute('data-pause-src');

      audio.play();
    },

    pause: function() {
      audio.removeEventListener('timeupdate', updateScrubber);
      control_button.querySelector('img').src = control_button.getAttribute('data-play-src');
      audio.pause();
    },

    /**
     * Update audio with new track based on the current mission
     * @param  {Integer|String} file_name - mp3 file name within the audio_folder (usually the mission ID)
     * @see  DD.plot.resume
     * @return {Audio}
     */
    resumeTrack: function(file_name) {
      // Disable interaction
      FCH.removeClass(player, '-ready');

      resetAudioProgress.call(this);

      audio = new Audio();

      // Bind events for load and complete
      audio.addEventListener('canplaythrough', audioLoaded);
      audio.addEventListener('load', audioLoaded);
      audio.addEventListener('ended', audioEnded);

      // Load new track
      audio.src = audio_folder + file_name + '.mp3';

      // Finally load it
      audio.load();

      this.audio = audio;

      return audio;
    },

    missionObjectiveDidUpdate: function() {
      var is_a_track = DD.plot.current_mission.type === 'audio';

      resetAudioProgress.call(this);

      if( is_a_track ) {
        FCH.addClass(control_button, 'notify');
      }
    }
  };

})();
