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
