import Event from '../event'
import Panner from './panner'
import Filter from './filter'
import Convolver from './convolver'
import { isNumber } from '../share'
import SingleHearken from '../core/single'
import { connect, createNodes } from './util'

export default class BasicSupport extends Event {
  constructor () {
    super()
    this.nodes = null
    this.libs = new Map()
    this.audioBuffer = null
    this.panner = new Panner(this)
    this.filter = new Filter(this)
    this.convolver = new Convolver(this)
    this.mode = this instanceof SingleHearken ? 'Buffer' : 'Media'
  }

  // use outlibs
  connect (lib) {
    if (lib && !this.libs.has(lib)) {
      this.libs.set(lib)
      this.on('connect', ([node, connect]) => {
        lib.connect(node)
        connect(lib)
      })
    }
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
    if (!isNumber(time) || time < 0) {
      time = 0
    }
    
    // if duration is not number, duration must be a "undefined"
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

  setfftSize (size) {
    if (isNumber(size)) {
      this.options.fftSize = size
    }
  }

  setVolume (volume) {
    if (volume !== this.options.volume) {
      const { nodes, AudioCtx, options } = this
      const gainNode = nodes && nodes.gainNode
      volume = isNumber(volume)
        ? volume
        : options.volume

      options.volume = volume

      if (gainNode) {
        gainNode.gain.setValueAtTime(volume, AudioCtx.currentTime)
      }
    }
  }
  
  resumeState () {
    // setMute、setRate、setDelay、setVolume should have a sub-class implementation
    this.setMute && this.setMute()
    this.setRate && this.setRate()
    this.setDelay && this.setDelay()
    this.setVolume && this.setVolume()

    this.panner.resumeState()
    this.convolver.resumeState()

    // since filterNodes will be re-created in connectNodes method,
    // so we have to wait until after a new filterNodes is created in order to restore state
    this.once('start', () => {
      this.filter.resumeState()
    })
  }
}