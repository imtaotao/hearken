import Event from '../event'
import SingleHearken from './single'
import { callChildMethod } from './util'
import { filterOptions } from '../share'

export default class Hearken extends Event {
  constructor (options) {
    super()
    this.children = []
    this.options = filterOptions(options || {})
    this.AudioCtx = Hearken.AudioContext
  }

  create (buffer, options) {
    const child = new SingleHearken(this, buffer,
      options
        ? filterOptions(options)
        : Object.create(this.options)
    )

    if (!child.buffer && !child.audioBuffer) {
      throw new Error('The resource must be of type arraybuffer or audiobuffer')
    }

    this.children.push(child)
    return child
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