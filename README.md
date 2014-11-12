[![Build Status](https://travis-ci.org/scottbrady/request-worker.svg?branch=master)](https://travis-ci.org/scottbrady/request-worker)
[![NPM version](https://badge.fury.io/js/request-worker.svg)](http://badge.fury.io/js/request-worker)

# request-worker

Module that utilizes worker processes to perform HTTP requests. Useful if
you need to make a large number of HTTP requests or the requests you're making
will take a long time to get a response.

## Installation

This package is available on npm as:

```
npm install request-worker
```

## Usage

A singleton is available if you want to share workers:

```
RequestWorker.getInstance({count: 16})
  .request({
    method : 'GET',
    url    : 'http://google.com/'
  })
  .then(function (results) {
    if (results.response.statusCode === 200) {
      var data = JSON.parse(results.body);
      // implementation...
    } else {
      // stuff...
    }
  })
  .fail(function (error) {
    // error handling...
  })
  .done();
```

You can also create your own instance:

```
var requestWorker = new RequestWorker({count: 16});
requestWorker
  .request(...)
  .then(...)
  .fail(...)
  .done();
```

## License

MIT