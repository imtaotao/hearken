
import {
  freeFloat,
  mallocFloat,
  createProcessingNode
} from './util'
import Event from '../event'
import { isUndef, isNumber } from '../share'

export default class Pitch extends Event {
  constructor (pitchShift, options) {
    super()
    if (isUndef(pitchShift)) {
      throw new Error('Missing "pitch-shift" library, see "https://www.npmjs.com/package/pitch-shift"')
    }

    this.queue = []
    this.node = null
    this.Sound = null
    this._skip = false
    this.pitchValue = 1.0
    this.cache = Object.create(null)

    // don't use pitchSift library
    if (pitchShift === false) {
      this.channels = 2
      this.frameSize = 2048
      this.useOutLib = false
      this.shiftBuffer = null
      return
    }

    options.frameSize = options.frameSize || 2048

    this.useOutLib = true
    this.frameSize = options.frameSize
    this.channels = options.channels || 2
    this.shiftBuffer = pitchShift(
      data => onData(this, data),
      () => this.pitchValue,
      options,
    )
  }

  get value () {
    return this.pitchValue
  }

  set value (v) {
    if (isNumber(v)) {
      this.pitchValue = v
      this.dispatch('change', v)
    } else {
      console.warn('pitch value is not Number');
    }
  }

  get skip () {
    return this._skip
  }

  set skip (v) {
    this._skip = !!v
    if (this.Sound) {
      this.Sound.disconnectNodes()
      this.Sound.connectNodes()
    }
  }

  receiveMainLib (Sound) {
    this.Sound = Sound
  }

  connect (preNode) {
    this.clear()
    this.disconnect()
    this.createNode(preNode.context)
    this.node.connect(preNode)
  }

  disconnect () {
    this.node && this.node.disconnect()
  }

  createNode (AudioCtx) {
    this.node = createProcessingNode(this, AudioCtx, operationalBuffer)
  }

  clear () {
    this.queue = []
    this.cache = Object.create(null)
  }

  _process (inputData, outputData, isInsertPitch) {
    this.shiftBuffer(inputData)
    const resData = this.queue.shift()
    if (resData) {
      outputData.set(resData)
      isInsertPitch && freeFloat(this.cache, resData)
    }
  }
}

function operationalBuffer (Pitch, input, output) {
  let process
  if (!Pitch.useOutLib) {
    if (Pitch.process) {
      process = Pitch.process
    } else {
      throw new Error('must defined "process" method')
    }
  } else {
    process = typeof Pitch.process === 'function'
      ? Pitch.process
      : Pitch._process
  }

  for (let i = 0; i < Pitch.channels; i++) {
    const inputData = input.getChannelData(i)
    const outputData = output.getChannelData(i)
    process.call(Pitch, inputData, outputData, true)
  }
}

function onData (Pitch, data) {
  const buffer = mallocFloat(Pitch.cache, data.length)
  buffer.set(data)
  Pitch.queue.push(buffer)
}