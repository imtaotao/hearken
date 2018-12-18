import Event from '../event'
import Panner from './panner'
import Filter from './filter'
import Convolver from './convolver'
import { isNumber } from '../share'
import SingleHearken from '../core/single'
import { connect, createNodes } from './util'

export default class BaseUtil extends Event {
  constructor (AudioCtx) {
    super()
    this.nodes = null
    this.audioBuffer = null
    this.panner = new Panner(this, AudioCtx)
    this.filter = new Filter(this, AudioCtx)
    this.convolver = new Convolver(this, AudioCtx)
    this.isBufferSouceMode = this instanceof SingleHearken
  }

  connectNodes () {
    if (this.nodes) {
      const { nodes, filter, AudioCtx, connectOrder } = this
      connect(AudioCtx, nodes, connectOrder, filter.hertz, 
        (hz, nowFilter) => {
          filter.filterNodes[hz] = nowFilter
        })
    }
  }

  getNomalTimeAndDuration (time, duration) {
    time = isNumber(time)
      ? time > 0
        ? time
        : 0
      : 0
    
    // duration is must be a "undefined"
    duration = isNumber(duration)
      ? duration > 0 
        ? duration
        : 0
      : undefined

    return { time, duration }
  }

  resetContainer (audio) {
    this.nodes = createNodes(this.AudioCtx, this.options, !!audio, audio)
  }

  getVisualizerData () {
    const analyser = this.nodes && this.nodes.analyser
    if (!analyser) return []
  
    const array = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(array)
    return array
  }

  // we need to be compatible with two different sets of delay time,
  // so we use delayNode
  setDelay (time) {
    time = time || this.options.delay
    if (isNumber(time)) {
      this.options.delay = time
      const delayNode = this.nodes && this.nodes.delay
      if (delayNode) {
        // the delayTime default is 0
        delayNode.delayTime.setValueAtTime(time, this.AudioCtx.currentTime)
      }
    }
  }

  resumeState () {
    // setVolume、setMute、setRate should have a sub-class implementation
    this.setVolume && this.setVolume()
    this.setMute && this.setMute()
    this.setRate &&this.setRate()

    this.setDelay()
    this.filter.resumeState()
    this.panner.resumeState()
    this.convolver.setStyle()
  }
}