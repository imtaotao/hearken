import BaseUtil from '../base'
import { startCoreFn, registerEvent } from './util'
import { random, getRange, isUndef, isNumber, isArrayBuffer, isAudioBuffer } from '../share'

export default class SingleHearken extends BaseUtil {
  constructor (Hearken, buffer, options) {
    super(Hearken.AudioCtx)

    this.buffer = isArrayBuffer(buffer) ? buffer : null
    this.audioBuffer = isAudioBuffer(buffer) ? buffer : null

    this.options = options
    this.Hearken = Hearken
    this.AudioCtx = Hearken.AudioCtx

    this.duration = null
    // start time is a playing time, the forward time is not counted
    this.startTime = null
    this.playingTime = 0
    this.starting = false
    this.playing = false

    // is dispatch ended event
    this.callStop = false

    // register play and pause event
    registerEvent(Hearken, this)

    this.connectOrder = [
      'panner',
      'delay',
      'gainNode',
      'convolver',
      'analyser',
      'passFilterNode',
      'filterNode', 
      'bufferSource',
    ]
  }

  start (t, d, noStop) {
    return new Promise(resolve => {
      const { buffer, AudioCtx } = this
      if (AudioCtx.state === 'suspended') {
        this.starting = false
        resolve(false)
        return
      }

      let { time, duration } = this.getNomalTimeAndDuration(t, d)

      // we can't allow mutilple sound play, so, we need stop previous sound
      if (this.nodes && !noStop) {
        this.stop()
      }

      this.resetContainer()
      this.callStop = false

      if (this.audioBuffer) {
        this.id = random()
        startCoreFn(this, time, duration)
        resolve(true)
        return
      }
  
      AudioCtx.decodeAudioData(buffer, audioBuffer => {
        this.buffer = null
        this.audioBuffer = audioBuffer
        this.id = random()
        startCoreFn(this, time, duration)
        resolve(true)
      })
    })
  }

  stop () {
    if (this.nodes) {
      this.dispatch('stopBefore')
      const bufferSource = this.nodes.bufferSource
      const stopMusic = bufferSource.stop
        ? bufferSource.stop
        : bufferSource.noteOff

      stopMusic.call(bufferSource)
      
      this.nodes = null
      this.startTime = null
      this.playingTime = 0
      this.starting = false
      this.callStop = true
      this.dispatch('stop')
    }
  }

  // if need fixDelay
  getDuration () {
    const { duration, audioBuffer } = this
    return duration
      ? duration
      : audioBuffer
        ? audioBuffer.duration
        : null
  }

  getCurrentTime (fixDelay) {
    const { startTime, options, playingTime } = this
    const timeChunk = startTime
      ? Date.now() - startTime
      : 0
    let currentTime = (playingTime + timeChunk) / 1000

    currentTime = fixDelay
      ? (currentTime - options.delay) * this.options.rate
      : currentTime

    return currentTime
  }

  getPercent () {
    const duration = this.getDuration(true)
    if (!duration) return null

    const currentTime = this.getCurrentTime(true)
    const percent = currentTime / duration
    return getRange(0, 1, percent)
  }

  playing () {
    return this.AudioCtx.state === 'suspended'
      ? false
      : this.starting
  }

  setVolume (volume) {
    const { nodes, AudioCtx, options } = this
    const gainNode = nodes && nodes.gainNode
    volume = isUndef(volume)
      ? options.volume
      : volume

    options.volume = volume

    if (gainNode && isNumber(volume)) {
      gainNode.gain.setValueAtTime(volume, AudioCtx.currentTime)
    }
  }

  setRate (rate) {
    const { nodes, AudioCtx, options } = this
    rate = isUndef(rate) ? options.rate : rate

    if (isNumber(rate)) {
      const bufferSource = nodes && nodes.bufferSource
      options.rate = rate

      if (bufferSource) {
        bufferSource.playbackRate.setValueAtTime(rate, AudioCtx.currentTime)
      }
    }
  }

  setMute (isMute) {
    const { nodes, AudioCtx, options } = this
    const gainNode = nodes && nodes.gainNode
    const mute = isUndef(isMute) ? options.mute : !!isMute

    options.mute = mute

    if (gainNode) {
      const volume = mute
        ? 0
        : isUndef(options.volume)
          ? 1
          : options.volume

      gainNode.gain.setValueAtTime(volume, AudioCtx.currentTime)
      this.dispatch('mute', mute)
    }
  }

  fadeStop (time) {
    if (isNumber(time)) {
      const { nodes, AudioCtx } = this
      const gainNode = nodes && nodes.gainNode
      if (gainNode) {
        // a little ahead of the end
        setTimeout(() => this.stop(),  time * 990)
        gainNode.gain.linearRampToValueAtTime(0, AudioCtx.currentTime + time)
      }
    }
  }

  fadeStart (time, t, d) {
    if (isNumber(time)) {
      return new Promise(resolve => {
        const { AudioCtx, options } = this
        const originVolume = options.volume
        // the first volume is 0, then slowly grow bigger
        options.volume = 0
        this.start(t, d).then(result => {
          const gainNode = this.nodes && this.nodes.gainNode
          if (gainNode && result !== false) {
            // a little ahead of the end
            gainNode.gain.linearRampToValueAtTime(originVolume, AudioCtx.currentTime + time)
            resolve(true)
          } else {
            resolve(false)
          }
          options.volume = originVolume
        })
      })
    }
    return this.start(t, d)
  }

  echo (time) {
    return new Promise(resolve => {
      if (isNumber(time)) {
        this.start().then(result => {
          const gainNode = this.nodes && this.nodes.gainNode
          if (gainNode && result !== false) {
            setTimeout(() => this.stop(), time * 990)
            // volume gradient
            gainNode.gain.exponentialRampToValueAtTime(0.001,
              this.AudioCtx.currentTime + time)
            resolve(true)
          } else {
            resolve(false)
          }
        })
        return
      }
      resolve(false)
    })
  }

  replaceBuffer (buffer) {
    if (isArrayBuffer(buffer)) {
      this.audioBuffer = null
      this.buffer = buffer
      this.dispatch('replaceBuffer')
    } else if (isAudioBuffer(buffer)) {
      this.buffer = null
      this.audioBuffer = buffer
      this.dispatch('replaceBuffer')
    }
  }
}