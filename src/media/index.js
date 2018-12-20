import BaseUtil from '../base'
import Stream_ from './stream'
import { startCoreFn } from './util'
import { random, isUndef, filterOptions, createAudioContext } from '../share'

export default class MediaElement extends BaseUtil {
  constructor (options, audio) {
    super()
    this.id = null
    this.url = null
    this.state = null
    this.audio = audio || new Audio()
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

      if (url instanceof Stream_) {
        const stream = url
        
        this.url = stream
        // connect audio to stream
        audio.src = URL.createObjectURL(stream.mediaSource)
        
        // if stream have cache, representative not first start
        if (stream.cache && stream.cacheBuffers.length) {
          stream.cacheBuffers.forEach(buffer => {
            stream.append(buffer)
          })
        }

        // if can't play, we need await buffer loaded, then play
        if (stream.canPlay) {
          startCoreFn(this, time, duration, resolve)
        } else {
          stream.once('canPlay', () => {
            startCoreFn(this, time, duration, resolve)
          })
        }
      } else {
        this.url = url
        audio.src = url
        startCoreFn(this, time, duration, resolve)
      }
    })
  }

  stop () {
    if (this.state === 'playing') {
      this.audio.pause()
    }
    this.id = null
    this.state = null
   
    if (this.url instanceof Stream_) {
      this.url.clean()
    }

    this.audio.src = ''
    this.url = null
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
      return true
    }
    return false
  }

  // we need check doucment event, allow play and check audioContext state
  ready () {
    // return this.AudioCtx.state === 'running'
    //   ? Promise.resolve()
    //   : this.AudioCtx.resume()
  }
}