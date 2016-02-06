'use strict';

(function() {
  var player = document.getElementById('js-player');
  var track = document.getElementById('js-track');
  var scrubber = document.getElementById('js-scrubber-input');
  var progress = document.getElementById('js-scrubber-progress');
  var handle = document.getElementById('js-scrubber-handle');
  var audio_folder = '/static/audio/';
  var control_button = document.getElementById('js-control-button');

  // Cache track dimensions variables so that touch operations are less expensive
  var track_from_left, track_from_right;
  var duration;

  /**
   * Create main audio player instance
   * @param  {String} audio_folder - Root path to audio files
   * @return {Audio}
   */
  function initPlayer() {
    var audio = new Audio();
    audio.src = audio_folder + '0.mp3';

    audio.addEventListener('canplaythrough', function() {
      scrubber.setAttribute('max', this.duration);
      duration = this.duration;
      FCH.addClass(player, '-ready');
    });

    audio.addEventListener('ended', function() {
      this.currentTime = 0;
      scrubber.value = 0;
      control_button.src = control_button.getAttribute('data-play-src');
      DD.plot.current_mission.objectiveComplete();
    });

    return audio;
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
      if( this.audio.paused ) {
        this.play();
      } else {
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
      var offset = determineAudioPosition( scrubber_value );
    }
    scrubber.addEventListener('input', onPlayScrubberChange.bind(this));

    /**
     * On track click, slider updates
     */
    function onTrackTouch(e) {
      determineAudioPosition(e.offsetX);
    }
    track.addEventListener('click', onTrackTouch);
    scrubber.addEventListener('click', onTrackTouch);

    /**
     * On handle drag, slider updates
     */
    function onTouchHandle(e) {
      // e.stopPropagation();
      var pos = e.touches[0].pageX;
      var offset = pos - track_from_left;

      if(pos < track_from_right) {
        determineAudioPosition(offset);
      }
    }

    if(DD.constants.has_touch) {
      handle.addEventListener('touchstart', this.pause.bind(this) );
      handle.addEventListener('touchmove', onTouchHandle);
      handle.addEventListener('touchend', this.play.bind(this) );
    }

  }

  DD.player = {
    audio: null,

    ready: function() {
      this.audio = initPlayer();

      controlsEventListeners.call(this);

      var track_dimensions = track.getBoundingClientRect();
      track_from_left = track_dimensions.left;
      track_from_right = track_dimensions.right + 24;
    },

    play: function() {
      scrubber.setAttribute('max', this.audio.duration);
      duration = this.audio.duration;
      this.audio.addEventListener('timeupdate', updateScrubber);
      control_button.src = control_button.getAttribute('data-pause-src');
      this.audio.play();
    },

    pause: function() {
      this.audio.removeEventListener('timeupdate', updateScrubber);
      control_button.src = control_button.getAttribute('data-play-src');
      this.audio.pause();
    },

    /**
     * Update audio with new track based on the current mission
     * @param {Integer} id - Mission ID
     * @see  DD.plot.resume
     */
    resumeTrack: function(id) {
      // Disable interaction
      FCH.removeClass(player, '-ready');

      // Set button to be pause
      control_button.src = control_button.getAttribute('data-pause-src');

      // Load new track
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = audio_folder + id + '.mp3';

      // Finally load it
      this.audio.load();
    },

    missionObjectiveDidUpdate: function() {
      var is_a_track = DD.plot.current_mission.type === 'audio';

      this.audio.pause();
      FCH.removeClass(control_button, 'notify');
      this.audio.currentTime = 0;
      scrubber.value = 0;

      console.log(DD.plot.current_mission.progress)

      if( is_a_track ) {
        FCH.addClass(control_button, 'notify');
      }
    }
  };

})();
