import { isArrayBuffer, isAudioBuffer } from '../share'

export default class Convolver {
  constructor (SoundInstance, AudioCtx) {
    this.style = null
    this.AudioCtx = AudioCtx
    this.Sound = SoundInstance
    this.audioBufferList = {} 
  }

  get convolverNode () {
    return this.Sound.nodes && this.Sound.nodes.convolver
  }

  setStyle (style) {
    style = style || this.style
    if (style) {
      this.style = style
      const buffer = this.audioBufferList[style]
      if (this.convolverNode && buffer) {
        this.convolverNode.buffer = buffer
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

  removeEffect () {
    if (this.convolverNode) {
      this.convolverNode.buffer = null
    }
    this.style = null
  }
}