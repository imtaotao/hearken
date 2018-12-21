import Queue from './queue'
import Event from '../event'
import { once } from '../share'

export default class Stream extends Event {
  constructor (mime, cache) {
    super()
    this.mime = mime
    // the lock is cahce lock
    this.lock = false
    this.cache = !!cache
    this.canPlay = false
    this.sourceBuffer = null
    // 缓存 set
    this.cacheBuffers = []
    this.queue = new Queue()
    this.mediaSource = new MediaSource()
    this.init()
  }

  get state () {
    return this.mediaSource.readyState
  }

  init () {
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
  }

  end () {
    const { state, mediaSource, sourceBuffer } = this
    if (state === 'open') {
      if (sourceBuffer.updating) {
        const fn = () => {
          mediaSource.endOfStream()
          sourceBuffer.removeEventListener('updateend', fn)
        }
        sourceBuffer.addEventListener('updateend', fn)
      } else {
        mediaSource.endOfStream()
      }
      // already got the full resource, stop the cache
      this.lock = true
    }
  }

  clean () {
    const { state, mediaSource, sourceBuffer } = this
    if (state === 'open') {
      const buffers = mediaSource.sourceBuffers
      if (~[].indexOf.call(buffers, mediaSource)) {
        sourceBuffer.abort()
      }
    }
    // reset
    this.canPlay = false
    this.sourceBuffer = null
    this.init()
  }

  cleanCache () {
    this.lock = false
    this.cacheBuffers = []
  }

  append (buffer) {
    if (buffer) {
      // the append buffer will dispatch updateend event
      // 要判断 updating
      this.ready(() => {
        this.sourceBuffer.appendBuffer(buffer)
        if (this.cache && !this.lock) {
          this.cacheBuffers.push(buffer)
        }
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