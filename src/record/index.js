import Event from '../event'
import workerBody from './worker'
import PitchShift from '../pitch-shift'
import SingleHearken from '../core/single'
import { inlineWorker, createAudioContext } from '../share'
import {
  workerEvent,
  operationalBuffer,
  connectRecordDevice,
  createProcessingNode,
} from './util'

export default class Record extends Event {
  constructor (frameSize, channels, AudioCtx, collectPureData) {
    super()
    if (!window.Worker) {
      throw new Error('Worker is undefined, can\'t record')
    }

    this.node = null
    this.stream = null
    this.worker = null
    this.buffer = null
    this.player = null
    this.process = null
    this._process = null
    this.recording = false
    this.playerEvtFn = null
    this.float32Array = null
    this.initCompleted = false
    this.channels = channels || 2
    this.frameSize = frameSize || 2048
    this.collectPureData = !!collectPureData
    this.AudioCtx = AudioCtx || createAudioContext(Record)
  }

  init () {
    if (this.initCompleted) {
      throw new Error('Cannot be initialized repeatedly')
    }
    return connectRecordDevice(this).then(stream => {
      if (!stream) {
        throw new Error('Unable to use recording device')
      }

      this.initCompleted = true
      this.worker = inlineWorker(workerBody)
      this.node = createProcessingNode(this, operationalBuffer)
      // if start record, processNode need connect streamNode
      this.stream = this.AudioCtx.createMediaStreamSource(stream)
      // worker event
      this.worker.onmessage = workerEvent(this)
      this.worker.onerror = err => { throw new Error(err) }
    })
  }

  start () {
    return new Promise(resolve => {
      if (!this.recording) {
        const core = () => {
          this.stream.connect(this.node)
          if (this.player) {
            // connect hearken player
            this.playerEvtFn = ([node, connect]) => {
              this.node.connect(node)
              connect(this.node)
            }
            this.player.on('connect', this.playerEvtFn)
            this.player.Hearken.ready(this.player.start())
          } else {
            this.node.connect(this.AudioCtx.destination)
          }
          resolve(true)
        }
        this.recording = true
        this.initCompleted
          ? core()
          : this.init().then(core)
      } else {
        resolve(false)
      }
    })
  }

  stop () {
    return new Promise(resolve => {
      if (this.recording) {
        this.once('_exportBuffer', buffer => {
          this.recording = false
          resolve(buffer)
        })
        this.node.disconnect()
        this.stream.disconnect()
        this.send('exportBuffer', {
          channels: this.channels,
          frameSize: this.frameSize,
        })
        if (this.player) {
          this.player.off('connect', this.playerEvtFn)
          this.playerEvtFn = null
          this.player.stop()
        }
      } else {
        resolve(false)
      }
    })
  }

  getFile (sampleRate = 44100) {
    if (!this.worker) {
      throw new Error('you must initialization environment and record data')
    }
    if (!this.float32Array) {
      throw new Error('the record data is null')
    }
    return new Promise(resolve => {
      this.once('_getFile', data => {
        resolve(new Blob([data], {type: 'audio/wav'}))
      })
      this.send('getFile', {
        sampleRate,
        channels: this.channels,
        samples: this.float32Array,
      })
    }) 
  }

  download (filename, sampleRate) {
    this.getFile(sampleRate).then(data => {
      const url = window.URL.createObjectURL(data)
      const link = window.document.createElement('a')
      const event = document.createEvent('MouseEvents')

      link.href = url
      link.download = filename + '.wav'
      event.initMouseEvent('click', true, true)
      link.dispatchEvent(event)
    })
  }

  send (command, value) {
    this.worker.postMessage({command, value})
  }

  connect (plugin) {
    const match = attr => {
      if (plugin[attr] !== this[attr]) {
        throw new Error(`The "${attr}" of ${plugin.constructor.name} must match the record`)
      }
    }

    if (plugin instanceof SingleHearken) {
      match('AudioCtx')
      this.player = plugin
      plugin.playRecordingSound = true 
      if (!this.process) {
        this.process = (inputData, outputData) => {
          outputData.set(inputData)
        }
      }
    }

    if (plugin instanceof PitchShift) {
      // check the properties are correct
      match('channels')
      match('frameSize')

      const fn = skip => {
        if (skip) {
          this._process = null
        } else {
          this._process = (inputData, outputData) => {
            (plugin.process || plugin._process).call(plugin, inputData, outputData, true)
          }
        }
      }

      plugin.off('skipChanged', plugin._fn)
      plugin.on('skipChanged', fn)
      plugin._fn = fn
      fn(plugin.skip)
    }
  }

  clear () {
    this.node.disconnect()
    this.stream.disconnect()

    this.node = null
    this.worker = null
    this.stream = null
    this.buffer = null
    this.player = null
    this.float32Array = null

    this.recording = false
    this.initCompleted = false

    this.off('_getFile')
    this.off('_exportBuffer')
  }
}