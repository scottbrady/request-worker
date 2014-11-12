(function() {
  var EventEmitter, Q, RequestWorker, Worker,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  Q = require('q');

  Worker = require('./worker');


  /*
   * Module to make HTTP requests using worker processes.
   */

  module.exports = RequestWorker = (function(_super) {
    __extends(RequestWorker, _super);

    RequestWorker.prototype.WORKERS_DEFAULT = 2;

    RequestWorker.prototype.pending = [];

    RequestWorker.prototype.workers = [];

    RequestWorker.getInstance = function(options) {
      if (options == null) {
        options = {};
      }
      if (!RequestWorker.instance) {
        RequestWorker.instance = new RequestWorker(options);
      } else {

      }
      return RequestWorker.instance;
    };

    function RequestWorker(options) {
      if (options == null) {
        options = {};
      }
      this.workerCount = options.count || this.WORKERS_DEFAULT;
      this._startWorkers();
    }

    RequestWorker.prototype.getWorkerCount = function() {
      return this.workerCount;
    };

    RequestWorker.prototype.hasPending = function() {
      return this.pending.length > 0;
    };

    RequestWorker.prototype.getPending = function() {
      return this.pending.pop();
    };

    RequestWorker.prototype.request = function(options) {
      var deferred, worker;
      deferred = Q.defer();
      worker = this._getReadyWorker();
      if (worker) {
        worker.request(options, deferred);
      } else {
        this.pending.push({
          options: options,
          deferred: deferred
        });
      }
      return deferred.promise;
    };

    RequestWorker.prototype._getReadyWorker = function() {
      var worker, _i, _len, _ref;
      _ref = this.workers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        worker = _ref[_i];
        if (worker.isReady()) {
          return worker;
        }
      }
    };

    RequestWorker.prototype._startWorkers = function() {
      var workerId, _i, _ref, _results;
      _results = [];
      for (workerId = _i = 0, _ref = this.workerCount; 0 <= _ref ? _i < _ref : _i > _ref; workerId = 0 <= _ref ? ++_i : --_i) {
        _results.push(this._startWorker(workerId + 1));
      }
      return _results;
    };

    RequestWorker.prototype._startWorker = function(workerId) {
      var worker;
      worker = new Worker(workerId);
      this.workers.push(worker);
      return worker.on('ready', (function(_this) {
        return function() {
          var pending;
          if (_this.hasPending()) {
            pending = _this.getPending();
            return worker.request(pending.options, pending.deferred);
          }
        };
      })(this));
    };

    return RequestWorker;

  })(EventEmitter);

}).call(this);
