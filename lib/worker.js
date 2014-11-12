(function() {
  var ChildProcess, EventEmitter, Worker, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  EventEmitter = require('events').EventEmitter;

  ChildProcess = require('child_process');

  module.exports = Worker = (function(_super) {
    __extends(Worker, _super);

    Worker.prototype.WORKER_PATH = 'runner';

    Worker.prototype.STATE_READY = 'ready';

    Worker.prototype.STATE_WORKING = 'working';

    function Worker(workerId) {
      this.workerId = workerId;
      this.process = ChildProcess.fork(this._getRunnerPath(), [this.workerId]);
      this.state = this.STATE_READY;
      this._listen();
    }

    Worker.prototype.isReady = function() {
      var result;
      result = this.state === this.STATE_READY;
      return result;
    };

    Worker.prototype.request = function(options, deferred) {
      this.state = this.STATE_WORKING;
      this.deferred = deferred;
      return this.process.send({
        type: 'request',
        options: options
      });
    };

    Worker.prototype._getRunnerPath = function() {
      var script;
      script = path.join(path.dirname(module.filename), this.WORKER_PATH);
      return script;
    };

    Worker.prototype._listen = function() {
      this.process.on('message', (function(_this) {
        return function(message) {
          return _this._handleMessage(message);
        };
      })(this));
      return this.process.on('error', function(error) {
        return this.deferred.reject(error);
      });
    };

    Worker.prototype._handleMessage = function(message) {
      switch (message.type) {
        case 'request-error':
          return this.deferred.reject(message.error);
        case 'request-response':
          return this.deferred.resolve(message.data);
        case 'request-ready':
          this.state = this.STATE_READY;
          this.deferred = void 0;
          return this.emit('ready');
      }
    };

    return Worker;

  })(EventEmitter);

}).call(this);
