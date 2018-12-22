import Event from '../event'
import Panner from './panner'
import Filter from './filter'
import Convolver from './convolver'
import { isNumber } from '../share'
import SingleHearken from '../core/single'
import { connect, createNodes } from './util'

export default class BaseUtil extends Event {
  constructor () {
    super()
    this.nodes = null
    this.audioBuffer = null
    this.panner = new Panner(this)
    this.filter = new Filter(this)
    this.convolver = new Convolver(this)
    this.mode = this instanceof SingleHearken ? 'Buffer' : 'Media'
  }

  connectNodes () {
    // If there are no nodes, representatives did not start playing,
    // because every player will reset nodes, stop nodes will be cleared
    if (this.nodes) {
      connect(this, (hz, nowFilter) => {
        this.filter.filterNodes[hz] = nowFilter
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
    this.panner.resumeState()
    this.convolver.resumeState()

    // since filterNodes will be re-created in connectNodes method,
    // so we have to wait until after a new filterNodes is created in order to restore state
    this.once('start', () => {
      this.filter.resumeState()
    })
  }
}