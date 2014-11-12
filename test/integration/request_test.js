var should        = require('should'),
    RequestWorker = require('../../lib/index');

RequestWorker.getInstance({count:2});

describe('lib/index.js', function () {
    describe('getInstance', function () {
        it('should return same instance', function () {
            var instance1 = RequestWorker.getInstance();
            var instance2 = RequestWorker.getInstance();
            instance1.should.equal(instance2);
        });
    });

    describe('request', function () {
        it('should successfully make request', function (done) {
            RequestWorker.getInstance()
                .request({
                    method : 'GET',
                    url    : 'http://google.com/'
                })
                .then(function (results) {
                    results.response.statusCode.should.equal(200);
                })
                .fail(function (error) {
                    should.fail('should not have returned error');
                })
                .fin(function () {
                    done();
                })
                .done();
        });
    });
});