import Event from '../event'
import SingleHearken from './single'
import { callChildMethod } from './util'
import { isArrayBuffer, filterOptions, isNumber } from '../share'

export default class Hearken extends Event {
  constructor (options) {
    super()
    this.children = []
    this.options = filterOptions(options || {})
    this.AudioCtx = Hearken.AudioContext
  }

  create (buffer, options) {
    if (isArrayBuffer(buffer)) {
      const config = options
        ? filterOptions(options)
        : Object.create(this.options)

      const child = new SingleHearken(this, buffer, config)
      this.children.push(child)
      return child
    } else {
      throw new Error('buffer is must be a Arraybuffer')
    }
  }

  play () {
    if (this.AudioCtx.state === 'suspended') {
      return this.AudioCtx.resume().then(() => {
        this.dispatch('play')
      })
    }
    return Promise.resolve(false)
  }

  pause () {
    if (this.AudioCtx.state === 'running') {
      return this.AudioCtx.suspend().then(() => {
        this.dispatch('pause')
      })
    }
    return Promise.resolve(false)
  }

  setVolume (volume, cb) {
    callChildMethod(this.children, cb, child => {
      child.setVolume(volume)
    })
    this.options.volume = volume
  }

  setFilter (hz, val, cb) {
    callChildMethod(this.children, cb, child => {
      child.setFilter(hz, val)
    })
  }

  setFilterStyle (style, cb) {
    callChildMethod(this.children, cb, child => {
      child.setFilterStyle(style)
    })
  }

  // this method will resume all sound, return promise
  ready () {
    return this.AudioCtx.state === 'running'
      ? Promise.resolve()
      : this.AudioCtx.resume()
  }
}