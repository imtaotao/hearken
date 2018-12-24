import { createAudioContext } from '../share'

export default class PitchShifter {
  constructor () {
    this.validGranSizes = [256, 512, 1024, 2048, 4096, 8192]
    this.grainSize = this.validGranSizes[1]
    this.audioContext = createAudioContext(PitchShifter)
    this.audioSources = []
  }

  init () {
    this.initProcessor()
    this.initAudio()
    this.pitchShifterProcessor.connect(this.audioContext.destination)
  }

  initAudio () {
    const { audioSources, audioContext, pitchShifterProcessor } = this
    navigator.getUserMedia({audio: true, video: false}, stream => {
      audioSources[1] = audioContext.createMediaStreamSource(stream)
    }, err => console.error(err))

    const buffersource = audioContext.createBufferSource()
    buffersource.loop = true;
    buffersource.connect(pitchShifterProcessor)
    buffersource.start(0)

    audioSources[0] = buffersource
  }

  initProcessor  () {
    const { grainSize, audioContext } = this
    const pitchShifterProcessor = audioContext.createScriptProcessor(grainSize, 1, 1)

    pitchShifterProcessor.buffer = new Float32Array(grainSize * 2)
    pitchShifterProcessor.grainWindow = this.hannWindow(grainSize)
    pitchShifterProcessor.onaudioprocess = function (event) {
      const inputData = event.inputBuffer.getChannelData(0)
      const outputData = event.outputBuffer.getChannelData(0)
      console.log(inputData, outputData);
    }

    this.pitchShifterProcessor = pitchShifterProcessor
  }

  hannWindow (length) {
    const window = new Float32Array(length)
    for (var i = 0; i < length; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)))
    }
    return window
  }

  linearInterpolation (a, b, t) {
    return a + (b - a) * t
  }
}