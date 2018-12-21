import BaseUtil from '../base'
import Stream from './stream'
import { startCoreFn } from './util'
import { disconnectNodes } from '../base/util'
import { random, isUndef, filterOptions, createAudioContext } from '../share'

export default class MediaElement extends BaseUtil {
  constructor (options) {
    super()
    this.id = null
    this.url = null
    this.state = null
    this.endTimer = null
    this.duration = null
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
      this.id = random()
      this.resetContainer(audio)

      if (this.endTimer) {
        clearTimeout(this.endTimer)
        this.endTimer = null
      }

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

          this.url = stream
          audio._url = stream
          audio.src = URL.createObjectURL(stream.mediaSource)

          // if can't play, we need await buffer loaded, then play
          stream.canPlay
            ? startCoreFn(this, time, duration, resolve)
            : stream.once('canPlay', () => {
                startCoreFn(this, time, duration, resolve)
              })
        }
      } else {
        if (!sameExists(url)) {
          this.url = url
          audio.src = url
          audio._url = url

          startCoreFn(this, time, duration, resolve)
        }
      }
    })
  }

  stop () {
    this.state === 'playing' && this.audio.pause()
    !isUndef(this.nodes) && disconnectNodes(this)
    
    this.id = null
    this.state = null
    this.audio.currentTime = 0
    this.dispatch('stop')
  }

  // return promise
  play () {
    if (this.state === 'pause') {
      return this.audio.play().then(() => {
        this.state = 'playing'
        this.dispatch('play')
      })
    }
    return Promise.resolve(false)
  }

  pause () {
    if (this.state = 'playing') {
      this.audio.pause()
      this.state = 'pause'
      this.dispatch('pause')
      return true
    }
    return false
  }

  setVolume (volume) {
    const { audio, nodes, AudioCtx, options } = this
    const gainNode = nodes && nodes.gainNode
    volume = isNumber(volume)
      ? volume
      : options.volume

    options.volume = volume

    if (gainNode) {
      gainNode.gain.setValueAtTime(volume, AudioCtx.currentTime)
      audio.volume = volume
    }
  }

  playing () {
    return this.state === 'playing'
  }

  getCurrentTime () {
    return this.audio.currentTime
  }

  getDuration () {
  }

  // we need check doucment event, allow play and check audioContext state
  ready () {
    // return this.AudioCtx.state === 'running'
    //   ? Promise.resolve()
    //   : this.AudioCtx.resume()
  }
}