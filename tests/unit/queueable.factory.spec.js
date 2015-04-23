/*jshint expr: true*/
describe('eha.queueable.factory', function() {
  'use strict';

  var factory;
  var workflow;
  var $q;
  var resolution;
  var flush;
  var myFlow;

  beforeEach(module('eha.queueable.factory'));
  beforeEach(inject(function(_ehaQueueableFactory_, _$q_, $browser) {
    $q = _$q_;
    factory = _ehaQueueableFactory_;

    flush = function() {
      try {
        $browser.defer.flush();
      } catch (e) {  }
    };

    resolution = $q.defer();
    workflow = sinon.spy(function() {
      return resolution.promise;
    });

    myFlow = factory(workflow);
  }));

  describe('Public API', function() {
    it('should expose a method', function() {
      expect(factory).to.be.a('Function');
    });
  });

  describe('Queueable', function() {
    it('Should run a workflow', function() {
      myFlow();

      expect(workflow.called).to.be.true;
    });

    it('Doesnt run the workflow a 2nd time if the 1st isnt done', function() {
      myFlow();
      myFlow();

      expect(workflow.callCount).to.equal(1);
    });

    it('Runs the 2nd one when the first is done', function() {
      myFlow();
      myFlow();

      // Resolve 1st call
      resolution.resolve();

      flush();

      expect(workflow.callCount).to.equal(2);
    });

    it('Passes arguments on', function() {
      myFlow(1, 2);

      var call = workflow.firstCall;
      expect(call.calledWith(1, 2)).to.be.true;
    });

    it('Propagates return vals to the outside', function(done) {
      var result = myFlow();

      // workflow done, result 5
      resolution.resolve(5);

      result
        .then(function(res) {
          expect(res).to.equal(5);
          done();
        });

      flush();
    });

    it('Propagates errors to the outside', function(done) {
      var result = myFlow();

      // workflow done, result 5
      resolution.reject('Missing document');

      result
        .catch(function(err) {
          expect(err).to.equal('Missing document');
          done();
        });

      flush();
    });

    it('If several calls are getting made while the 1st is processing,' +
        ' it only does one', function(done) {
      var res = myFlow();
      var rA = myFlow();
      var rB = myFlow();
      var rC = myFlow();

      // resolve 1st call,
      // since all workflows use the same deferred, this will resolve
      // the next workflow as well
      resolution.resolve(1);

      res
        .then(function() {
          return $q.all([rA, rB, rC]);
        })
        .then(function() {
          expect(workflow.callCount).to.equal(2);
          done();
        });

      flush();
    });
  });
});
