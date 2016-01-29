'use strict';

(function() {

  EX.constants = {
    get last_mission() {
      return FCH.localGet('theexchangeappcom_last_mission_id');
    },

    set last_mission(new_value) {
      return FCH.localSet('theexchangeappcom_last_mission_id', new_value);
    },

    get last_read() {
      return FCH.localGet('theexchangeappcom_last_read');
    },

    set last_read(new_value) {
      return FCH.localSet('theexchangeappcom_last_read', new_value);
    }
  };

})();
