
import {
  freeFloat,
  mallocFloat,
  createProcessingNode
} from './util'

export default class Pitch {
  constructor (pitchShift, frameSize, channels) {
    if (!pitchShift) {
      throw new Error('Missing "pitch-shift" library, see "https://www.npmjs.com/package/pitch-shift"')
    }
    this.P = pitchShift
    this.node = null
    this.name = '_pitch'
    this.pitchValue = 1.0
    this.channels = channels || 2
    this.cache = Object.create(null)
    this.frameSize = frameSize || 2048
  }

  get value () {
    return this.pitchValue
  }

  set value (v) {
    this.pitchValue = v
  }

  connect (preNode) {
    this.cache = Object.create(null)
    this.node = createProcessingNode(this, preNode.context, operationalBuffer)
    this.node.connect(preNode)
  }

  clearCache () {
    this.cache = Object.create(null)
  }
}

function operationalBuffer (Pitch, input, output) {
  const { channels, frameSize } = Pitch

  if (channels === 1) {
    transfer(input, output, 0, frameSize)
  } else {
    for (let i = 0; i < channels; i++) {
      transfer(input, output, i, frameSize)
    }
  }
}

function transfer (input, output, channel, frameSize) {
  const inputData = input.getChannelData(channel)
  const outputData = output.getChannelData(channel)

  for (let i = 0; i < frameSize; i++) {
    outputData[i] = inputData[i]
  }
}