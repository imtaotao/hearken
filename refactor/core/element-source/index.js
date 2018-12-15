import { startCore } from './operate'
import { isNumber, isArrayBuffer } from '../../util'

export default class ElementSource {
  constructor (Hearken) {
    this.Hearken = Hearken
    this.state = 'pause'
    this.mediaStream = null
    this.audioElement = document.querySelector('audio')
  }

  start (time, duration) {
    const { Hearken, audioElement } = this
    const $MediaStream = Hearken.$MediaStream

    // playing
    const startFunBody = () => {
      time = isNumber(time) ? time : null
      duration = isNumber(duration) ? duration : null
      Hearken.$resetContainer(audioElement)
    
      if (Hearken.$getState() === 'suspended') {
        Hearken.$audioCtx.resume().then(() => startCore(this, time, duration))
      } else {
        startCore(this, time, duration)
      }
    }

    // connect mediasource
    if (!this.mediaStream) {
      $MediaStream.connect(audioElement).then(() => {
        this.mediaStream = $MediaStream.mediaSource
        startFunBody()
      })
      return
    }
    // we need avoid conflict
    this.stop()
    startFunBody()
  }

  stop () {
    if (this.state === 'playing') {
      this.audioElement.pause()
      this.state = 'pause'
    }
    this.audioElement.src = ''
    this.mediaStream = null
    this.Hearken.$callHooks('stop')
  }

  play () {
    if (this.state === 'pause') {
      return this.audioElement.play().then(() => {
        this.state = 'playing'
        this.Hearken.$callHooks('play')
      })
    } else {
      return Promise.resolve(false)
    }
  }

  pause () {
    return new Promise(resolve => {
      if (this.state === 'playing') {
        this.audioElement.pause()
        this.state = 'pause'
        this.Hearken.$callHooks('pause')
        resolve()
      } else {
        resolve(false)
      }
    })
  }

  getDuration () {
    return this.audioElement.duration
  }

  setVolume (volume) {
    const gainNode = this.Hearken.$Container.nodes.gainNode

    this.Hearken.$options.volume = volume
    this.audioElement.volume = volume

    if (gainNode) {
      gainNode.gain.value = volume * volume
    }
  }

  appendStream (buffer) {
    if (isArrayBuffer(buffer) && this.sourceBuffer) {
      this.sourceBuffer.appendBuffer(buffer)
    }
  }
}