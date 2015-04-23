;(function() {

  var ngModule = angular.module('eha.queueable', [
    'eha.queueable.factory'
  ]);

  // Check for and export to commonjs environment
  /* istanbul ignore if */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule;
  }

})();

;(function() {
  'use strict';
  /**
   * @ngdoc service
   * @function
   * @name ehaQueueableFactory
   * @module eha.queueable
   */
  var ngModule = angular
                  .module('eha.queueable.factory', []);

  ngModule.factory('ehaQueueableFactory', ['$q', function($q) {
    return function(workflow) {
      var queue = [];
      var running = false;

      function checkRun() {
        if (!queue.length) {
          running = false;
          return;
        }

        running = true;
        // Take the entire work queue, resolve those
        var queued = queue.splice(0, queue.length);

        // Use the arguments from the first call,
        // cause we have to pick something
        var deferreds = queued.map(function(item) { return item.deferred; });
        workflow.apply(null, queued[0].args)
          .then(function() {
            var args = arguments;
            deferreds.forEach(function(def) {
              def.resolve.apply(def, args);
            });
          })
          .catch(function() {
            var args = arguments;
            deferreds.forEach(function(def) {
              def.reject.apply(def, args);
            });
          })
          .finally(checkRun);
      }

      return function queuecall() {
        var args = Array.prototype.slice.call(arguments, 0);
        var item = {
          deferred: $q.defer(),
          args: args
        };

        queue.push(item);

        // Start the workflow in case we're not busy
        if (!running) {
          checkRun();
        }

        return item.deferred.promise;
      };
    };
  }]);

  // Check for and export to commonjs environment
  /* istanbul ignore if */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ngModule;
  }

})();
