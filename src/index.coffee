EventEmitter = require('events').EventEmitter
Q            = require 'q'
Worker       = require './worker'

###
# Module to make HTTP requests using worker processes.
###
module.exports = class RequestWorker extends EventEmitter

  WORKERS_DEFAULT: 2

  pending: []

  workers: []

  ##########################################################################
  ## Class methods ########################################################
  ########################################################################

  @getInstance: (options={}) ->
    if !RequestWorker.instance
      # console.log '################ request-worker creating new instance', options
      RequestWorker.instance = new RequestWorker options
    else
      # console.log '################ request-worker using existing instance'
    RequestWorker.instance

  ##########################################################################
  ## Public methods #######################################################
  ########################################################################

  constructor: (options={}) ->
    @workerCount = options.count || @WORKERS_DEFAULT
    @_startWorkers()

  getWorkerCount: () ->
    @workerCount

  hasPending: () ->
    @pending.length > 0

  getPending: () ->
    @pending.pop()

  request: (options) ->
    # console.log '################ request-worker request()', options
    deferred = Q.defer()
    worker   = @_getReadyWorker()
    if worker
      # console.log '################ request-worker request(): sending to worker'
      worker.request(options, deferred)
    else
      # console.log '################ request-worker request(): adding to pending'
      @pending.push
        options  : options
        deferred : deferred
    deferred.promise

  ##########################################################################
  ## Psuedo-private methods ###############################################
  ########################################################################

  _getReadyWorker: () ->
    for worker in @workers
      return worker if worker.isReady()

  _startWorkers: () ->
    for workerId in [0...@workerCount]
      @_startWorker(workerId + 1)

  _startWorker: (workerId) ->
    worker = new Worker workerId
    @workers.push worker
    worker.on 'ready', =>
      # console.log '################ request-worker ready', workerId
      if @hasPending()
        # console.log '################ request-worker ready: giving worker pending request', workerId
        pending = @getPending()
        worker.request(pending.options, pending.deferred)
