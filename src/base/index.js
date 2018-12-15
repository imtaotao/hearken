import Event from '../event'
import Panner from './panner'
import { isNumber } from '../share'
import SingleHearken from '../core/single'
import { connect, createNodes } from './util'

export default class BaseUtil extends Event {
  constructor (audioCtx) {
    super()
    this.panner = new Panner(this, audioCtx)
    this.audioBuffer = null
    this.filterStyle = null
    this.filterNodes = {}
    this.nodes = null
  }

  getHearken() {
    return this instanceof SingleHearken
      ? this.Hearken
      : this
  }

  connectNodes (nodeNames) {
    if (this.nodes) {
      const cb = (hz, nowFilter) => this.filterNodes[hz] = nowFilter
      connect(this.AudioCtx, this.nodes, nodeNames, this.options, cb)
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

  filterAssignment (data) {
    const hertz = this.options.hertz
    const filterNodes = this.filterNodes

    for (let i = 0, len = hertz.length; i < len; i++) {
      const hz = hertz[i]
      const nowFilter = filterNodes[hz]
  
      if (nowFilter) {
        nowFilter.gain.value = data[i] * 1.5
      }
    }
  }

  getVisualizerData () {
    const analyser = this.nodes && this.nodes.analyser
    if (!analyser) return []
  
    const array = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(array)
    return array
  }

  setFilter (hz, val) {
    if (this.filterNodes) {
      const nowFilter = this.filterNodes[hz]
      if (nowFilter) {
        nowFilter.gain.value = val * 1.5
        this.filterStyle = null
      }
    }
  }

  setFilterStyle (style) {
    style = style || this.filterStyle

    if (style) {
      const { hertz, filter } = this.options
      if (hertz && filter) {
        const data = filter[style]
        if (data) {
          this.filterAssignment(data)
          this.filterStyle = style
        }
      }
    }
  }
}