import Queue from './queue'
import Event from '../event'
import { random, once, isArrayBuffer } from '../share'

export default class Stream extends Event {
  constructor (mime) {
    super()
    this.mime = mime
    this.lock = false
    this.id = random()
    this.canPlay = false
    this.sourceBuffer = null
    this.init()
  }

  get state () {
    return this.mediaSource
      ? this.mediaSource.readyState
      : null
  }

  get removed () {
    const buffers = this.mediaSource.sourceBuffers
    if (~[].indexOf.call(buffers, this.sourceBuffer)) {
      return false
    }
    return true
  }

  init () {
    this.queue = new Queue()
    this.mediaSource = new MediaSource()

    // Listen append buffer event
    this.mediaSource.onsourceopen = () => {
      const sourceBuffer = this.mediaSource.addSourceBuffer(this.mime)
      // dispatch canPlay event once
      sourceBuffer.onupdateend = once(() => {
        this.canPlay = true
        this.dispatch('canPlay')
      })
      this.sourceBuffer = sourceBuffer
      this.dispatch('open')
    }

    this.mediaSource.onsourceclose = () => {
      this.dispatch('close')
    }
  }


  destroy ()  {
    if (this.state === 'open' && !this.removed) {
      this.sourceBuffer.abort()
    }

    // clean all
    this.mediaSource.onsourceopen = null
    this.mediaSource.onsourceclose = null

    this.canPlay = false
    this.mediaSource = null
    this.sourceBuffer = null
    this.off('open')
    this.off('close')
    this.off('canPlay')
    this.queue = null
  }

  end () {
    this.ready(() => {
      this.queue.register(() => {
        if (this.state === 'open') {
          if (this.sourceBuffer.updating) {
            const fn = () => {
              this.mediaSource.endOfStream()
              this.sourceBuffer.removeEventListener('updateend', fn)
            }
            this.sourceBuffer.addEventListener('updateend', fn)
          } else {
            this.mediaSource.endOfStream()
          }
          this.queue.clean()
        }
      })
    })
  }

  append (buffer) {
    if (isArrayBuffer(buffer)) {
      this.ready(() => {
        // the append buffer will dispatch updateend event
        this.queue.register(next => {
          this.ready(() => {
            if (this.sourceBuffer.updating) {
              const addfn = () => {
                // the soucebuffer maybe have deleted
                !this.removed && this.sourceBuffer.appendBuffer(buffer)
                this.sourceBuffer.removeEventListener('updateend', addfn)
                next()
              }
              this.sourceBuffer.addEventListener('updateend', addfn)
            } else {
              !this.removed && this.sourceBuffer.appendBuffer(buffer)
              // call next fn, append next buffer
              next()
            }
          })
        })
      })
    }
  }

  ready (cb) {
    if (typeof cb === 'function') {
      this.sourceBuffer
        ? cb()
        : this.once('open', cb)
    }
  }
}