// this is worker thread
export default function workerBody () {
  const _self = this
  const config = {
    bufferLen: 4096,
    numChannels: 2,
    mimeType: 'audio/wav',
  }
  let recordBuffer = []

  _self.onmessage = (e) => {
    switch(e.data.command) {
      case 'appendBuffer':
        collectBuffer(e.data.val)
        break
      case 'exportBuffer':
        exportWAV()
        break
    }
  }

  function collectBuffer ({ buffers, channels }) {
    for (let i = 0; i < channels; i++) {
      !recordBuffer[i]
        ? recordBuffer[i] = [buffers[i]]
        : recordBuffer[i].push(buffers[i])
    }
  }

  function exportWAV () {
    const collectRecord = collect()
    const audioBlob = createAudioBlob(collectRecord)

    recordBuffer = []

    _self.postMessage({
      command: 'exportBuffer',
      val: audioBlob,
    })
  }

  function createAudioBlob (collectRecord) {
    const { numChannels, mimeType } = config
    const interleaveData = encodeWAV(44100, numChannels, collectRecord)

    return [
      new Blob([interleaveData], {type: mimeType}),
      interleaveData,
    ]
  }

  function collect () {
    let buffers = []

    for (let i = 0; i < config.numChannels; i++) {
      buffers.push(mergeBuffers(recordBuffer[i]))
    }

    let length = buffers[0].length + buffers[1].length
    let result = new Float32Array(length)
    let index = 0
    let inputIndex = 0

    // merge left channel and right channel.
    while (index < length) {
      result[index++] = buffers[0][inputIndex]
      result[index++] = buffers[1][inputIndex]
      inputIndex++
    }

    return result
  }

  function mergeBuffers (buffers) {
    let result = new Float32Array(config.bufferLen * buffers.length)
    let offset = 0

    for (let i = 0; i < buffers.length; i++) {
      result.set(buffers[i], offset)
      offset += buffers[i].length
    }
    return result
  }

  function encodeWAV(sampleRate, numChannels, samples:Float32Array) {
    const dataLength = samples.length * numChannels
    const buffer = new ArrayBuffer(dataLength + 44)
    const view = new DataView(buffer)

    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataLength, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numChannels * 2, true)
    view.setUint16(32, numChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(view, 36, 'data')
    view.setUint32(40, dataLength, true)
    floatTo16BitPCM(view, 44, samples)

    return view
  }

  function floatTo16BitPCM(output:DataView, offset:number, input:Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]))
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
  }

  function writeString(view:DataView, offset:number, string:string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
}