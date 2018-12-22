import BaseUtil from '../base'
import Stream from './stream'
import { startCoreFn } from './util'
import { disconnectNodes } from '../base/util'
import {
  isUndef,
  isNumber,
  filterOptions,
  createAudioContext,
} from '../share'

export default class MediaElement extends BaseUtil {
  constructor (options) {
    super()
    this.state = null
    this.endTimer = null
    this.duration = null
    this.startInfor = null
    this.audio = new Audio()
    this.options = filterOptions(options || {})
    this.AudioCtx = createAudioContext(MediaElement)

    this.connectOrder = [
      'panner',
      'delay',
      'gainNode',
      'convolver',
      'analyser',
      'passFilterNode',
      'filterNode',
      'mediaSource',
    ]
  }

  // return promise, if can't auto play, throw reject error
  start (url, t, d) {
    return new Promise(resolve => {
      if (isUndef(url)) return resolve(false)

      const { audio, getNomalTimeAndDuration } = this
      const { time, duration } = getNomalTimeAndDuration(t, d)

      this.stop()
      this.resetContainer(audio)
      this.startInfor = { url, time, duration }

      // if audio exists src, we need repeat use
      const sameExists = url => {
        if (audio._url && audio._url === url) {
          startCoreFn(this, time, duration, resolve)
          return true
        }
        return false
      }

      if (url instanceof Stream) {
        if (!sameExists(url)) {
          const stream = url
          stream.off('canPlay')

          audio._url = stream
          audio.src = URL.createObjectURL(stream.mediaSource)
          // if can't play, we need await buffer loaded, then play
          stream.canPlay
            ? startCoreFn(this, time, duration, resolve)
            : stream.once('canPlay', () => startCoreFn(this, time, duration, resolve))
        }
      } else {
        if (!sameExists(url)) {
          audio.src = url
          audio._url = url
          startCoreFn(this, time, duration, resolve)
        }
      }
    })
  }

  stop () {
    const { state, audio, nodes, endTimer } = this
    this.dispatch('stopBefore')

    if (state === 'playing') audio.pause()
    if (nodes) disconnectNodes(this)
    if (endTimer && endTimer.t) clearTimeout(endTimer.t)

    this.id = null
    this.state = null
    this.endTimer = null
    this.audio.currentTime = 0
    this.dispatch('stop')
  }

  // return promise
  play () {
    const { state, audio, endTimer } = this
    if (state === 'pause') {
      return audio.play().then(() => {
        const playEnd = this.audio.onended
        // add new end function
        if (typeof playEnd === 'function') {
          endTimer.t = setTimeout(playEnd, endTimer.delayTime)
        }
        // update start play time
        endTimer.now = Date.now()
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
      return true
    }
    return false
  }

  restart () {
    if (this.startInfor) {
      const { url, time, duration } = this.startInfor
      return this.start(url, time, duration)
    }
    return Promise.resolve(false)
  }

  playing () {
    return this.state === 'playing'
  }

  getCurrentTime () {
    return this.audio.currentTime
  }

  getDuration () {}

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

  fadePlay (time) {
    if (isNumber(time)) {
      return new Promise(resolve => {
        const originVolume = this.options.volume
        this.setVolume(0)
        this.play().then(result => {
          const { nodes, AudioCtx } = this
          const gainNode = nodes && nodes.gainNode
          if (gainNode && result !== false) {
            gainNode.gain.linearRampToValueAtTime(originVolume, AudioCtx.currentTime + time)
            resolve(true)
          } else {
            resolve(false)
          }
          // restore volume value
          this.options.volume = originVolume
        })
      })
    } else {
      return this.play()
    }
  }

  fadePause (time) {
    if (this.state === 'playing') {
      if (isNumber(time)) {
        const { nodes, AudioCtx } = this
        const gainNode = nodes && nodes.gainNode
        if (gainNode) {
          // a little ahead of the end
          setTimeout(() => this.pause(),  time * 990)
          gainNode.gain.linearRampToValueAtTime(0, AudioCtx.currentTime + time)
        }
      } else {
        this.stop()
      }
    }
  }

  // we need check doucment event, allow play and check audioContext state
  ready (cb) {
    return this.AudioCtx.state === 'running'
      ? Promise.resolve()
      : this.AudioCtx.resume()
  }
}