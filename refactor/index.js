import Base from './core/base-class'
import _MediaStream from './core/media-stream'
import BufferSource from './core/buffer-source'
import ElementSource from './core/element-source'
import createConstructorApi from './helper/setAttribute'
import { filterOptions } from './core/share'
import { random, isNumber, isArrayBuffer } from './util'

export default class Hearken extends Base {
  constructor (options) {
    super()
    if (!options) {
      throw new Error('error')
    }
    this.id = random()
    this.life = Object.create(null)
    this.$audioCtx = Hearken.AudioContext
    this.$options = filterOptions(options)
    this.$MediaStream = new _MediaStream(this)
    this.$BufferSource = new BufferSource(this)
    this.$ElementSource = new ElementSource(this)
  }

  getCurrentTime () {
    return this.$audioCtx.currentTime
  }

  getDration () {
    return this.$isComplete()
      ? this.$BufferSource.getDration()
      : this.$ElementSource.getDuration()
  }

  getVisualizerData () {
    const analyser = this.$Container.nodes.analyser
    if (!analyser) return []
  
    const array = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(array)
    return array
  }

  setVolume (precent) {
    const volume = precent && isNumber(precent)
      ? precent
      : this.$options.volume
    
    this.$isComplete()
      ? this.$BufferSource.setVolume(volume)
      : this.$ElementSource.setVolume(volume)
  }

  setFilter (hz, val) {
    if (this.$Container.filterNodes) {
      const nowFilter = this.$Container.filterNodes[hz]
      if (nowFilter) {
        nowFilter.gain.value = val * 1.5
        this.$Container.filterStyle = null
      }
    }
  }

  setFilterStyle (style) {
    style = style || this.$Container.filterStyle

    if (style) {
      const { hertz, filter } = this.$options
      if (hertz && filter) {
        const data = filter[style]
        if (data) {
          this.$filterAssignment(data)
          this.$Container.filterStyle = style
        }
      }
    }
  }

  start (time, duration) {
    this.$isComplete()
      ? this.$BufferSource.start(time, duration)
      : this.$ElementSource.start(time, duration)
  }

  stop () {
    this.$isComplete()
      ? this.$BufferSource.stop()
      : this.$ElementSource.stop()
  }

  play () {
    return this.$isComplete()
      ? this.$BufferSource.play()
      : this.$ElementSource.play()
  }

  pause () {
    return this.$isComplete()
      ? this.$BufferSource.pause()
      : this.$ElementSource.pause()
  }

  appendBuffer (buffer) {
    if (isArrayBuffer(buffer)) {
      this.$MediaStream.appendBuffer(buffer)
    }
  }

  toggleSound () {

  }
}

// save AudioContext and version information
createConstructorApi(Hearken)