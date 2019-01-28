import BasicSupport from '../basic-support'
import { startCoreFn, registerEvent } from './util'
import {
  range,
  isUndef,
  isNumber,
  isArrayBuffer,
  isAudioBuffer,
} from '../share'

export default class SingleHearken extends BasicSupport {
  constructor (Hearken, buffer, options) {
    super()
    this.buffer = isArrayBuffer(buffer) ? buffer : null
    this.audioBuffer = isAudioBuffer(buffer) ? buffer : null

    this.options = options
    this.Hearken = Hearken
    this.AudioCtx = Hearken.AudioCtx

    this.duration = null
    this.whenPlayTime = 0
    // if is true, allow connect record node
    this.playRecordingSound = false
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

  // the delay time is counted in the total time, affected by rate 
  // if the delay is 3, duration is 10, can play 7s
  // so, should return 7s
  getDuration (needFix) {
    const { options, duration, audioBuffer } = this
    const result = duration
      ? duration
      : audioBuffer
        ? audioBuffer.duration
        : null
    
    /*
      if need fix
      delay is 3s
      complete duration is 10s
      set play duration is 5s
      will play 2s
      and affected by rate
    */
    return needFix
      ? result - options.delay * options.rate
      : result
  }

  getCurrentTime (needFix) {
    const duration = this.getDuration()
    const { startTime, options, playingTime, whenPlayTime } = this
    const timeChunk = startTime ? Date.now() - startTime : 0

    let currentTime

    if (needFix) {
      // (a - b) * rate + whenplaytime
      currentTime = ((playingTime + timeChunk) / 1000 - options.delay) * options.rate + whenPlayTime
    } else {
      // a * rate + whenplaytime
      currentTime = (playingTime + timeChunk) / 1000 * options.rate + whenPlayTime
    }

    if (currentTime < 0) {
      currentTime = 0
    }

    if(duration && currentTime > duration) {
      currentTime = 0
      // reset
      this.startTime = Date.now()
      this.playingTime = 0
    }

    return currentTime
  }

  getPercent (needFix) {
    let duration = this.getDuration(needFix)
    if (!duration) return null

    const currentTime = this.getCurrentTime(needFix)
    const percent = currentTime / duration

    return range(0, 1, percent)
  }

  playing () {
    return this.AudioCtx.state === 'suspended'
      ? false
      : this.starting
  }

  setRate (rate) {
    if (rate !== this.options.rate) {
      const { nodes, AudioCtx, options } = this
      rate = isNumber(rate) ? rate : options.rate

      options.rate = rate
      const bufferSource = nodes && nodes.bufferSource

      if (bufferSource) {
        // https://github.com/WebAudio/web-audio-api/issues/723
        bufferSource.playbackRate.setValueAtTime(rate, AudioCtx.currentTime)
      }
    }
  }

  setMute (isMute) {
    if (isMute !== this.options.mute) {
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
  }

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

  fadeStop (time) {
    if (isNumber(time)) {
      const { nodes, AudioCtx } = this
      const gainNode = nodes && nodes.gainNode
      if (gainNode) {
        // a little ahead of the end
        setTimeout(() => this.stop(),  time * 990)
        gainNode.gain.linearRampToValueAtTime(0, AudioCtx.currentTime + time)
      }
    } else {
      this.stop()
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

  clone (buffer) {
    buffer = buffer || this.audioBuffer || this.buffer
    const child = new SingleHearken(this.Hearken, buffer, this.options)
    this.Hearken.children.push(child)
    return child
  }

  start (t, d, noStop) {
    return new Promise(resolve => {
      if (!this.buffer && !this.audioBuffer && !this.playRecordingSound) {
        throw new Error('The resource must be of type arraybuffer or audiobuffer, can\'t play')
      }
      if (this.AudioCtx.state === 'suspended') {
        this.starting = false
        resolve(false)
        return
      }

      // we can't allow mutilple sound play, so, we need stop previous sound
      if (this.nodes && !noStop) {
        this.stop()
      }

      this.resetContainer()
      this.callStop = false

      if (this.playRecordingSound) {
        startCoreFn(this, 0, undefined)
        resolve(true)
      } else {
        const { time, duration } = this.getNomalTimeAndDuration(t, d)
        if (this.audioBuffer) {
          startCoreFn(this, time, duration)
          resolve(true)
        } else if (this.buffer) {
          this.AudioCtx.decodeAudioData(this.buffer, audioBuffer => {
            this.buffer = null
            this.audioBuffer = audioBuffer
            startCoreFn(this, time, duration)
            resolve(true)
          })
        }
      }
    })
  }

  stop () {
    if (this.nodes && this.starting) {
      this.dispatch('stopBefore')
      const bufferSource = this.nodes.bufferSource
      const stopMusic = bufferSource.stop
        ? bufferSource.stop
        : bufferSource.noteOff

      bufferSource.onended = null
      stopMusic.call(bufferSource)
      
      this.nodes = null
      this.startTime = null
      this.playingTime = 0
      this.starting = false
      this.callStop = true
      this.filter.filterNodes = Object.create(null)
      this.dispatch('stop')
    }
  }
}