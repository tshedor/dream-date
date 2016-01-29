'use strict';

(function() {
  var scrubber = document.getElementById('js-scrubber');
  var scrubber_handle = document.getElementById('js-scrubber-handle');

  /**
   * Create main audio player instance
   * @param  {String} audio_folder - Root path to audio files
   * @return {Audio}
   */
  function initPlayer(audio_folder) {
    var audio = new Audio();
    audio.src = audio_folder + '1.0_1.mp3';

    audio.addEventListener('load', function() {
      scrubber.setAttribute('max', this.duration);
      this.play();
    });

    audio.addEventListener('ended', function() {
      this.currentTime = 0;
      EX.plot.missionObjectiveDidUpdate();
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

  EX.player = {
    audio_folder: '/assets/audio/missions/',
    audio: null,

    ready: function() {
      this.scrubber = scrubber;
      this.control_button = document.getElementById('js-control-button');
      this.previous_button = document.getElementById('js-previous-button');
      this.next_button = document.getElementById('js-next-button');

      this.audio = initPlayer( this.audio_folder );

      this.controlsEventListeners();
    },

    play: function() {
      EX.player.scrubber.setAttribute('max', EX.player.audio.duration);
      this.audio.addEventListener('timeupdate', updateScrubber);
      this.control_button.src = '/assets/images/controls/pause.svg';
      this.audio.play();
    },

    pause: function() {
      this.audio.removeEventListener('timeupdate', updateScrubber);
      this.control_button.src = '/assets/images/controls/play.svg';
      this.audio.pause();
    },

    controlsEventListeners: function() {
      function onControlClick() {
        if( EX.player.audio.paused ) {
          EX.player.play();
        } else {
          EX.player.pause();
        }
      }

      this.control_button.addEventListener('click', onControlClick);

      // Fired on both previous and next
      function trackSkippers(new_src) {
        EX.player.audio.pause();
        EX.player.audio.currentTime = 0;
        EX.player.audio.src = new_src;

        EX.player.audio.load();
      }

      // Next is pressed
      function onNextClick() {
        trackSkippers( this.getAttribute('data-src') );
      }

      // Previous is pressed
      function onPreviousClick() {
        trackSkippers( this.getAttribute('data-src') );
      }

      this.next_button.addEventListener('click', onNextClick);
      this.previous_button.addEventListener('click', onPreviousClick);

      // Slider is moved
      var scrubber_handle = document.getElementById('js-scrubber-handle');

      function onScrubberChange() {
        var scrubber_input_val = parseInt( EX.player.scrubber.value );
        var offset = scrubber_input_val / parseInt( EX.player.scrubber.getAttribute('max') );

        EX.player.audio.currentTime = scrubber_input_val;
        scrubber_handle.style.width = (offset * 100) + '%';
      }

      this.scrubber.addEventListener('input', onScrubberChange);
    },

    missionObjectiveDidUpdate: function() {
      var is_a_track = EX.plot.current_mission.isProgressATrack();
      var is_previous_enabled = EX.plot.current_mission.isPreviousEnabled();
      var is_next_enabled = EX.plot.current_mission.isNextEnabled();

      this.audio.pause();
      FCH.removeClass(this.control_button, 'notify');
      this.audio.currentTime = 0;
      this.scrubber.value = 0;

      if( is_a_track ) {
        FCH.addClass(this.control_button, 'notify')
      }

      this.previous_button.setAttribute( 'disabled', is_previous_enabled );
      this.next_button.setAttribute( 'disabled', is_next_enabled );
    }
  };

})();
