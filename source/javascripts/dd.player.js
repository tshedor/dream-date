'use strict';

(function() {
  var scrubber = document.getElementById('js-scrubber');
  var scrubber_handle = document.getElementById('js-scrubber-handle');
  var audio_folder = '/static/audio/missions/';
  var control_button = document.getElementById('js-control-button');

  /**
   * Create main audio player instance
   * @param  {String} audio_folder - Root path to audio files
   * @return {Audio}
   */
  function initPlayer(audio_folder) {
    var audio = new Audio();
    audio.src = audio_folder + '0.mp3';

    audio.addEventListener('load', function() {
      scrubber.setAttribute('max', this.duration);
      this.play();
    });

    audio.addEventListener('ended', function() {
      this.currentTime = 0;
      DD.plot.missionObjectiveDidUpdate();
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
    var offset = scrubber_input_val / parseInt( scrubber.getAttribute('max') );

    scrubber_handle.style.width = (offset * 100) + '%';
  }

  /**
   * Event listeners for play/pause and the scrubber
   */
  function controlsEventListeners() {
    function onControlClick() {
      if( this.audio.paused ) {
        this.play();
      } else {
        this.pause();
      }
    }

    control_button.addEventListener('click', onControlClick.bind(this) );

    // Slider is moved
    var scrubber_handle = document.getElementById('js-scrubber-handle');

    function onScrubberChange() {
      var scrubber_input_val = parseInt( scrubber.value );
      var offset = scrubber_input_val / parseInt( scrubber.getAttribute('max') );

      this.audio.currentTime = scrubber_input_val;
      scrubber_handle.style.width = (offset * 100) + '%';
    }

    scrubber.addEventListener('input', onScrubberChange.bind(this));
  }

  DD.player = {
    audio: null,

    ready: function() {
      this.audio = initPlayer( audio_folder );

      controlsEventListeners.call(this);
    },

    play: function() {
      scrubber.setAttribute('max', this.audio.duration);
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
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = audio_folder + id + '.mp3';

      this.audio.load();
    },

    missionObjectiveDidUpdate: function() {
      var is_a_track = DD.plot.current_mission.type === 'audio';

      this.audio.pause();
      FCH.removeClass(control_button, 'notify');
      this.audio.currentTime = 0;
      scrubber.value = 0;

      if( is_a_track ) {
        FCH.addClass(control_button, 'notify')
      }

      this.next_button.setAttribute( 'disabled', is_next_enabled );
    }
  };

})();
