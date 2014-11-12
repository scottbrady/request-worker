path         = require 'path'
EventEmitter = require('events').EventEmitter
ChildProcess = require 'child_process'

module.exports = class Worker extends EventEmitter

  WORKER_PATH: 'runner'

  STATE_READY: 'ready'

  STATE_WORKING: 'working'

  ##########################################################################
  ## Public methods #######################################################
  ########################################################################

  constructor: (workerId) ->
    # console.log "################# starting worker ##{workerId}"
    @workerId = workerId
    @process  = ChildProcess.fork(@_getRunnerPath(), [ @workerId ])
    @state    = @STATE_READY
    @_listen()

  isReady: () ->
    result = @state is @STATE_READY
    # console.log "################ worker #{@workerId} #{if result then 'ready' else 'not ready'}"
    result

  request: (options, deferred) ->
    @state    = @STATE_WORKING
    @deferred = deferred
    @process.send(type: 'request', options: options)

  ##########################################################################
  ## Psuedo-private methods ###############################################
  ########################################################################

  _getRunnerPath: () ->
    script = path.join(
      path.dirname(module.filename),
      @WORKER_PATH
    )
    # console.log '################ worker: runner path', script
    script

  _listen: () ->
    @process.on 'message', (message) => @_handleMessage(message)
    @process.on 'error', (error) -> @deferred.reject error

  _handleMessage: (message) ->
    switch message.type
      when 'request-error'
        # console.log '################ worker: request-error', message.error
        @deferred.reject message.error

      when 'request-response'
        # console.log '################ worker: response', message.data
        @deferred.resolve message.data

      when 'request-ready'
        # console.log '################ worker: ready', @workerId
        @state    = @STATE_READY
        @deferred = undefined
        @emit 'ready'
