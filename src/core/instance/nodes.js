export default function setAudioTool (HearkenProto) {
  const tool = HearkenProto.tool = Object.create(null)

  // create AudioBufferSourceNode node
  tool.createBufferSource = function () {
    return this.Hearken.AudioContext.createBufferSource()
  }

  // create equalizer node
  tool.createConvolver = function () {
    return this.Hearken.AudioContext.createConvolver()
  }
  
  // create source analyse node
  tool.createAnalyser = function () {
    const Hearken = this.Hearken
    const analyser = Hearken.AudioContext.createAnalyser()
    // fourier transform parameter
    analyser.fftSize = Hearken.options.fftSize * 2
    return analyser
  }

  // create volume control node
  tool.createGainNode = function () {
    const ac = this.Hearken.AudioContext
    return ac[
      ac.createGain
        ? 'createGain'
        : 'createGainNode'
    ]()
  }

  // create filter node
  tool.createFilter = function (hz, gainVal = 0, type = 'peaking') {
    const ra = this.Hearken.AudioContext.createBiquadFilter()

    ra.type = type
    ra.Q.value = 10
    ra.frequency.value = hz
    ra.gain.value = gainVal

    return ra
  }

  // decode arraybuffer to audiobuffer
  tool.decode = function (arraybuffer) {
    return new Promise(resolve => {
      this.Hearken.AudioContext.decodeAudioData(arraybuffer, buffer => {
        resolve(buffer)
      })
    })
  }
}