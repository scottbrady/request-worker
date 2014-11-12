extend  = require 'extend'
request = require 'request'

###
# Module to make HTTP requests.
###
class RequestRunner

  ##########################################################################
  ## Public methods #######################################################
  ########################################################################

  constructor: () ->
    @workerId = process.argv[2]
    # console.log '################ RequestRunner constructor', @workerId
    @_listen()

  ##########################################################################
  ## Psuedo-private methods ###############################################
  ########################################################################

  _listen: () ->
    process.on 'message', (data) =>
      # console.log '################ runner', data
      switch data.type
        when 'request'
          @_request(data.options)
        else
          throw new Error "Unknown message type #{data.type}"

  _request: (options) ->
    # console.log '################ runner: starting request', options
    start = Date.now()
    request options, (error, response, body) =>
      results =
        workerId : @workerId
        options  : options
        time     : Date.now() - start
      # console.log "################ runner: done in #{results.time}ms #{options.method} #{options.url}"
      if error
        process.send
          type  : 'request-error'
          error : error
      else
        process.send
          type : 'request-response'
          data : extend results, body: body, response: response
      process.send
        type: 'request-ready'

new RequestRunner
