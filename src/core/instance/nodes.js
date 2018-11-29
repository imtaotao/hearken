import { isArrayBuffer } from '../../util'

export default function setAudioTool (HearkenProto) {
  const tool = HearkenProto.tool = Object.create(null)

  // get buffer source
  tool.createBufferSource = function () {
    return this.Hearken.AudioContext.createBufferSource()
  }

  // get equalizer object
  tool.createConvolver = function () {
    return this.Hearken.AudioContext.createConvolver()
  }
  
  // get source analyse object
  tool.createAnalyser = function () {
    const Hearken = this.Hearken
    const analyser = Hearken.AudioContext.createAnalyser()
    // fourier transform parameter
    analyser.fftSize = Hearken.options.fftSize * 2
    return analyser
  }

  // get volume control object
  tool.createGainNode = function () {
    const ac = this.Hearken.AudioContext
    return ac[
      ac.createGain
        ? 'createGain'
        : 'createGainNode'
    ]()
  }

  // get filter object
  tool.createFilter = function (gainVal = 0, type = 'peaking') {
    hertz = this.Hearken.options.hertz
    if (!hertz) {
      throw new Error('hertz is' + typeof hertz)
    }

    const ra = HearkenProto.AudioContext.createBiquadFilter()
    ra.type = type
    ra.Q.value = 10
    ra.frequency.value = hertz
    ra.gain.value = gainVal

    return ra
  }

  tool.decode = function (arraybuffer) {
    if (!isArrayBuffer) {
      throw new Error('decode source must be a "arraybuffer, but now it\'s a' + typeof arraybuffer)
    }
  
    return new Promise(resolve => {
      this.Hearken.AudioContext.decodeAudioData(arraybuffer, buffer => {
        resolve(buffer)
      })
    })
  }
}