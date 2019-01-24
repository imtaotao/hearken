import Event from '../event'
import workerBody from './worker'
import { inlineWorker, createAudioContext } from '../share'
import { connectRecordDevice, createProcessingNode } from './util'

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
    this.process = null
    this.recording = false
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
        this.dispatch('error', 'Unable to use recording device')
        return
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
    if (!this.recording) {
      const core = () => {
        this.stream.connect(this.node)
        this.node.connect(this.AudioCtx.destination)
      }
      this.recording = true
      this.initCompleted
        ? core()
        : this.init().then(core)
    }
  }

  stop () {
    return new Promise(resolve => {
      if (this.recording) {
        this.once('_exportBuffer', buffer => {
          this.recording = false
          console.log(buffer);
          resolve(buffer)
        })
        this.node.disconnect()
        this.stream.disconnect()
        this.send('exportBuffer', {
          channels: this.channels,
          frameSize: this.frameSize,
        })
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
    if (typeof filename === 'string') {
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
  }

  send (command, value) {
    this.worker.postMessage({command, value})
  }

  clear () {
    this.node.disconnect()
    this.stream.disconnect()

    this.node = null
    this.worker = null
    this.stream = null
    this.buffer = null
    this.float32Array = null

    this.recording = false
    this.initCompleted = false

    this.off('_getFile')
    this.off('_exportBuffer')
  }
}

function operationalBuffer (Record, input, output) {
  const buffers = []
  const canCall = typeof Record.process === 'function'

  for (let i = 0; i < Record.channels; i++) {
    const inputData = input.getChannelData(i)
    const outputData = output.getChannelData(i)

    // allow pitch shift
    canCall && Record.process(inputData, outputData)

    buffers.push(
      !canCall || Record.collectPureData
        ? inputData
        : outputData
    )
  }
console.log(buffers);
  Record.send('appendBuffer', {
    buffers,
    channels: Record.channels,
  })
}

function workerEvent (Record) {
  return e => { 
    switch(e.data.command) {
      case 'getFile' :
        Record.dispatch('_getFile', e.data.value)
        break
      case 'exportBuffer' :
        const typeArrData = e.data.value
        const buffer = typeArrData && typeArrData.buffer

        Record.buffer = buffer
        Record.float32Array = typeArrData
        Record.dispatch('_exportBuffer', buffer)
        break
    }
  }
}