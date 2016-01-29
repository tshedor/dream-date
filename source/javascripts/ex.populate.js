'use strict';

(function() {
  EX.populate = {
    ready: function() {
      this.credits();
    },

    credits: function() {
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        // Only move forward if we've got a clean response
        if (xhr.readyState !== 4 || xhr.status !== 200) {
          return;
        }

        console.log(xhr.responseText);

        var json = JSON.parse(xhr.responseText);

        console.log(json);
      };

      xhr.open('GET', '/tourist/credits.json', true)
      return xhr.send();
    },


  };

})();
