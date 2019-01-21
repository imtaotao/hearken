import Event from '../event'
import workerBody from './worker'
import { inlineWorker, createAudioContext } from '../share'
import { connectRecordDevice, createProcessingNode } from './util'

export default class Record extends Event {
  constructor (frameSize, channels, collectPureData) {
    super()
    if (!window.Worker) {
      throw new Error('Worker is undefined, can\'t record')
    }

    this.node = null
    this.stream = null
    this.worker = null
    this.process = null
    this.initiCompleted = false
    this.channels = channels || 2
    this.frameSize = frameSize || 2048
    this.collectPureData = collectPureData
    this.AudioCtx = createAudioContext(Record)
  }

  init () {
    if (this.initiCompleted) {
      throw new Error('Cannot be initialized repeatedly')
    }
    connectRecordDevice(this).then(stream => {
      this.initiCompleted = true
      this.worker = inlineWorker(workerBody)
      // if start record, processNode need connect streamNode
      this.stream = context.createMediaStreamSource(stream)
      this.node = createProcessingNode(this, AudioCtx, operationalBuffer)
    })
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
    command: 'record',
    value: buffers,
  })
}