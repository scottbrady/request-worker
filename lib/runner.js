(function() {
  var RequestRunner, extend, request;

  extend = require('extend');

  request = require('request');


  /*
   * Module to make HTTP requests.
   */

  RequestRunner = (function() {
    function RequestRunner() {
      this.workerId = process.argv[2];
      this._listen();
    }

    RequestRunner.prototype._listen = function() {
      return process.on('message', (function(_this) {
        return function(data) {
          switch (data.type) {
            case 'request':
              return _this._request(data.options);
            default:
              throw new Error("Unknown message type " + data.type);
          }
        };
      })(this));
    };

    RequestRunner.prototype._request = function(options) {
      var start;
      start = Date.now();
      return request(options, (function(_this) {
        return function(error, response, body) {
          var results;
          results = {
            workerId: _this.workerId,
            options: options,
            time: Date.now() - start
          };
          if (error) {
            process.send({
              type: 'request-error',
              error: error
            });
          } else {
            process.send({
              type: 'request-response',
              data: extend(results, {
                body: body,
                response: response
              })
            });
          }
          return process.send({
            type: 'request-ready'
          });
        };
      })(this));
    };

    return RequestRunner;

  })();

  new RequestRunner;

}).call(this);
