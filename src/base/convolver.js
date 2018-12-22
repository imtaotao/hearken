import { disconnectNodes } from './util'
import {
  each,
  isObject,
  isArrayBuffer,
  isAudioBuffer,
} from '../share'

export default class Convolver {
  constructor (SoundInstance) {
    this.style = null
    this.Sound = SoundInstance
    this.audioBufferList = {} 
  }

  get AudioCtx () {
    return this.Sound.AudioCtx
  }

  get convolverNode () {
    return this.Sound.nodes && this.Sound.nodes.convolver
  }

  setStyle (style) {
    if (style !== this.style) {
      style = style || this.style

      if (style) {
        const buffer = this.audioBufferList[style]

        if (buffer) {
          const existOfOriginBuffer = !!this.convolverNode.buffer
          // set style
          this.style = style

          if (this.convolverNode) {
            this.convolverNode.buffer = buffer
            // if origin buffer is null, we need reset connect nodes
            if (!existOfOriginBuffer) {
              disconnectNodes(this.Sound)
              this.Sound.connectNodes()
            }
          }
        }
      }
    }
  }

  appendBuffer (style, buffer) {
    return new Promise(resolve => {
      if (typeof style !== 'string') {
        resolve(false)
      } else if (isArrayBuffer(buffer)) {
        this.AudioCtx.decodeAudioData(buffer, audiobuffer => {
          this.audioBufferList[style] = audiobuffer
          resolve(true)
        })
      } else if (isAudioBuffer(buffer)) {
        this.audioBufferList[style] = audiobuffer
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  appendBufferList (bufferList) {
    if (isObject(bufferList)) {
      const promiseAll = []
      each(bufferList, (buffer, style) => {
        promiseAll.push(
          this.appendBuffer(style, buffer)
              .then(result => ({ [style]: result }))
        )
      })
      return Promise.all(promiseAll)
    }
    return Promise.resolve(false)
  }

  clean () {
    if (this.convolverNode) {
      this.convolverNode.buffer = null
      // if you don't reconnect, the convolverNode will cause the sound to not play
      this.Sound.connectNodes()
    }
    this.style = null
  }

  remove (style, noClean) {
    if (style) {
      const list = this.audioBufferList
      if (list[style]) {
        if (!noClean && style === this.style) {
          // if style is playing style, need clean it
          style === this.style && this.clean()
        }
        list[style] = null
      }
    }
  }

  resumeState () {
    this.setStyle()
  }
}