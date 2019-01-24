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
    this.initCompleted = false
    this.channels = channels || 2
    this.frameSize = frameSize || 2048
    this.collectPureData = collectPureData
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

      // collect record data
      this.worker.onmessage = e => {
        switch(e.data.command) {
          case 'exportBuffer' :
            this.buffer = e.data.value
            break
        }
      }
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
    if (this.recording) {
      this.node.disconnect()
      this.worker.postMessage({
        command: 'exportBuffer',
      })
    }
  }

  download () {
    if (!this.worker) {
      console.warn('can\'t download, you must initialization environment')
      return null
    }
    if (!this.buffer) {
      return null
    }
    console.log(this.buffer);
  }

  clear () {
    this.worker = null
    this.node.disconnect()
    this.stream.disconnect()
    this.node = null
    this.stream = null
    this.initCompleted = false
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

  Record.worker.postMessage({
    command: 'appendBuffer',
    value: buffers,
  })
}