import Stream from './stream'
import BasicSupport from '../basic-support'
import {
  startCoreFn,
  fadeStartOrPlay,
  fadeStopOrPause,
} from './util'
import {
  range,
  ready,
  isUndef,
  isNumber,
  filterOptions,
  createAudioContext,
} from '../share'

export default class MediaElement extends BasicSupport {
  constructor (options = {}) {
    super()
    this.state = null
    this.endTimer = null
    this.duration = null
    this.delayTimer = null
    this.startInfor = null
    this.options = filterOptions(options)
    this.audio = options.audio || new Audio()
    this.AudioCtx = createAudioContext(MediaElement)

    this.preload = true
    if (this.options.crossOrigin) {
      this.audio.crossOrigin = 'anonymous'
    }

    this.connectOrder = [
      'panner',
      'gainNode',
      'convolver',
      'analyser',
      'passFilterNode',
      'filterNode',
      'mediaSource',
    ]
  }

  ready (cb) {
    ready(this, cb)
  }

  playing () {
    return this.state === 'playing'
  }

  fadeStart (time, url, t, d) {
    return fadeStartOrPlay(this, 'start', time, url, t, d)
  }

  fadePlay (time) {
    return fadeStartOrPlay(this, 'play', time)
  }

  fadeStop (time) {
    fadeStopOrPause(this, 'stop', time)
  }

  fadePause (time) {
    fadeStopOrPause(this, 'pause', time)
  }

  clone () {
    return new MediaElement(this.options)
  }

  restart (fadeTime) {
    if (this.startInfor) {
      const { url, time, duration } = this.startInfor
      return isNumber(fadeTime)
        ? this.fadeStart(fadeTime, url, time,  duration)
        : this.start(url, time, duration)
    }
    return Promise.resolve(false)
  }

  setRate (rate) {
    if (rate !== this.options.rate) {
      const { audio, options } = this
      rate = isNumber(rate) ? rate : options.rate
      options.rate = rate

      if (this.nodes) {
        audio.playbackRate = rate
      }
    }
  }

  setMute (isMute) {
    if (isMute !== this.options.mute) {
      const { audio, options } = this
      const mute = isUndef(isMute) ? options.mute : !!isMute

      options.mute = mute
      audio.muted = mute
      this.dispatch('mute', mute)
    }
  }

  setCurrentTime (time) {
    if (time === range(0, this.getDuration(), time)) {
      this.audio.currentTime = time
    }
  }

  setDelay (time) {
    if (isNumber(time) && time !== this.options.delay) {
      this.options.delay = time
    }
  }

  getCurrentTime () {
    return this.audio.currentTime
  }

  getPercent () {
    const duration = this.getDuration()
    if (isUndef(duration) || !isFinite(duration)) {
      return 0
    }
    const percent = this.audio.currentTime / duration
    return range(0, 1, percent)
  }

  getLoading (duration) {
    const buffered = this.audio.buffered
    if (buffered.length === 0) return 0

    duration = duration || this.getDuration()
    const loadingTime = buffered.end(buffered.length - 1)
    return range(0, 1, loadingTime / duration)
  }

  // Delay time is not counted in the total time
  // if duration is 10s, delay is 3s, rate is 1.5, return 13s
  getDuration () {
    const { audio, duration, startInfor } = this

    if (!audio._src) {
      return null
    }

    let result = null

    if (audio._src instanceof Stream) {
      const stream = audio._src
      const { mediaSource, sourceBuffer } = stream

      // get complete
      if (isFinite(mediaSource.duration)) {
        result = isNumber(duration) && mediaSource.duration > duration
          ? duration 
          : mediaSource.duration
      } else if (sourceBuffer) {
        // if is a infinite, return loaded source duration
        const timestampOffset = sourceBuffer.timestampOffset
        result = isNumber(duration) && timestampOffset > duration
          ? duration
          : timestampOffset
      }
    } else {
      result = isNumber(duration) && audio.duration > duration
        ? duration
        : audio.duration
    }

    // add forward time
    if (startInfor && startInfor.time) {
      result = result
        ? result + startInfor.time
        : startInfor.time
    }

    return result
  }

  // return promise, if can't auto play, throw reject error
  start (url, t, d) {
    return new Promise(resolve => {
      if (isUndef(url)) return resolve(false)

      const { audio, getNomalTimeAndDuration } = this
      let { time, duration } = getNomalTimeAndDuration(t, d)

      this.stop()
      this.resetContainer(audio)
      this.startInfor = { url, time, duration }

      // if audio exists src, we need repeat use
      const sameExists = url => {
        if (audio._src && audio._src === url) {
          startCoreFn(this, time, duration, resolve)
          return true
        }
        return false
      }

      if (url instanceof Stream) {
        if (!sameExists(url)) {
          const stream = url
          stream.off('canPlay')

          audio._src = stream
          audio.src = URL.createObjectURL(stream.mediaSource)
          // if can't play, we need await buffer loaded, then play
          stream.canPlay
            ? startCoreFn(this, time, duration, resolve)
            : stream.once('canPlay', () => startCoreFn(this, time, duration, resolve))
        }
      } else {
        if (!sameExists(url)) {
          audio.src = url
          audio._src = url
          startCoreFn(this, time, duration, resolve)
        }
      }
    })
  }

  stop () {
    const { state, audio, nodes, endTimer, delayTimer } = this
    this.dispatch('stopBefore')

    // if the audio is playing, need pause
    if (state === 'playing') audio.pause()
    // disconnect nodes
    if (nodes) this.disconnectNodes()
    // clear pre delay timer
    if (delayTimer) clearTimeout(delayTimer)
    // stop loop timer
    if (endTimer && endTimer.t) clearTimeout(endTimer.t)

    this.id = null
    this.state = null
    this.endTimer = null
    this.delayTimer = null
    this.audio.currentTime = 0
    this.dispatch('stop')
  }

  // return promise
  play () {
    const { state, audio, endTimer } = this
    if (state === 'pause') {
      return audio.play().then(() => {
        if (endTimer) {
          const playEnd = this.audio.onended
          // add new end function
          if (typeof playEnd === 'function') {
            endTimer.t = setTimeout(playEnd, endTimer.delayTime)
          }
          // update start play time
          endTimer.now = Date.now()
        }

        this.state = 'playing'
        this.dispatch('play')
        return true
      })
    }
    return Promise.resolve(false)
  }

  pause () {
    const { state, audio, endTimer } = this
    if (state === 'playing') {
      audio.pause()
      if (endTimer && endTimer.t) {
        const { t, now } = endTimer
        clearTimeout(t)
        // update delay time
        endTimer.t = null
        endTimer.delayTime -= (Date.now() - now)
      }
      this.state = 'pause'
      this.dispatch('pause')
    }
  }

  forward (time) {
    if (isNumber(time)) {
      const duration = this.getDuration()
      if (duration) {
        time = range(0, duration, time)
        this.audio.currentTime = time
        return true
      }
    }
    return false
  }
}