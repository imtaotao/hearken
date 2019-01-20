
import {
  freeFloat,
  mallocFloat,
  createProcessingNode
} from './util'
import Event from '../event'

export default class Pitch extends Event {
  constructor (pitchShift, options) {
    super()
    if (!pitchShift) {
      throw new Error('Missing "pitch-shift" library, see "https://www.npmjs.com/package/pitch-shift"')
    }

    options.frameSize = options.frameSize || 2048

    this.queue = []
    this.node = null
    this.pitchValue = 1.0
    this.cache = Object.create(null)
    this.frameSize = options.frameSize
    this.channels = options.channels || 2
    this.S = pitchShift(
      data => onData(this, data),
      () => this.pitchValue,
      options,
    )
  }

  get value () {
    return this.pitchValue
  }

  set value (v) {
    this.pitchValue = v
    this.dispatch('change', v)
  }

  connect (preNode) {
    this.clear()
    this.node = createProcessingNode(this, preNode.context, operationalBuffer)
    this.node.connect(preNode)
  }

  clear () {
    this.queue = []
    this.cache = Object.create(null)
  }

  _process (inputData, outputData) {
    this.S(inputData)
    const resData = this.queue.shift()
    if (resData) {
      outputData.set(resData)
      freeFloat(this.cache, resData)
    }
  }
}

function operationalBuffer (Pitch, input, output) {
  const process = typeof Pitch.process === 'function'
    ? Pitch.process
    : Pitch._process

  if (Pitch.channels === 1) {
    const inputData = input.getChannelData(0)
    const outputData = output.getChannelData(0)
    process.call(Pitch, inputData, outputData)
  } else {
    for (let i = 0; i < Pitch.channels; i++) {
      const inputData = input.getChannelData(i)
      const outputData = output.getChannelData(i)
      process.call(Pitch, inputData, outputData)
    }
  }
}

function onData (Pitch, data) {
  const buffer = mallocFloat(Pitch.cache, data.length)
  buffer.set(data)
  Pitch.queue.push(buffer)
}