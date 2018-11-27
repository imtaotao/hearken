// we need audioContext and buffers is a array
// we can get a audiobuffer, it's no a array
export function mergeAduiobuffer(ac, buffers, channels = 2) {
  const getLength = () => {
    let length = 0
    for (let i = 0, len = buffers.length; i < len; i++) {
      length += buffers[i].length
    }
    return length
  }

  const getConcatBuffer = newAudioBuffer => {
    const newBuffers = []
    for (let i = 0; i < channels; i++) {
      newBuffers[i] = newAudioBuffer.getChannelData(i)
    }
    return newBuffers
  }

  const frameCount = getLength()
  const audioBuffer = ac.createBuffer(channels, frameCount, ac.sampleRate)
  const newBuffers = getConcatBuffer(audioBuffer)

  for (let i = 0, len = newBuffers.length; i < len; i++) {
    const newBuffer = newBuffers[i]
    let size = 0

    for (let j = 0, len = buffers.length; j < len; j++) {
      const buffer = buffers[j]
      const data = buffer.getChannelData(i)
      for (let k = 0, len = data.length; k < len; k++) {
        newBuffer[size++] = data[k]
      }
    }
  }

  return audioBuffer
}

// buffers is a array, Finally we return a arraybuffer
export function mergeArraybuffer (buffers) {
  if (buffers.length === 1) return buffers[0]
  const isValidArray = v => {
    const reg = /Int(8|16|32)Array|Uint(8|8Clamped|16|32)Array|Float(32|64)Array|ArrayBuffer/gi
    return reg.test({}.toString.call(v))
  }

  if (!isValidArray(buffers[0])) {
    return new Uint8Array(0).buffer
  }

  return buffers.reduce((collectBuffer, buffer, i) => {
    if (i === 0) return collectBuffer
    if (!isValidArray(buffer)) return collectBuffer

    let tmp = new Uint8Array(collectBuffer.byteLength + buffer.byteLength)
    tmp.set(new Uint8Array(collectBuffer), 0)
    tmp.set(new Uint8Array(buffer), collectBuffer.byteLength)

    return tmp.buffer
  }, buffers[0])
}

export function bufferToArrayBuffer (buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length)

  if (arrayBuffer.byteLength !== buffer.length) {
    throw new Error('arraybuffer is too large, not enough memory')
  }

  const view = new Uint8Array(arrayBuffer)

  for (let i = 0, len = view.length; i < len; i++) {
    view[i] = buffer[i]
  }
  return arrayBuffer
}

export function arraybufferToBlob (arraybuffer, mimeType) {
  return new Blob([arraybuffer], {type: mimeType})
}

// this method is only used in the node environment, if you used in browser, will get a error
export function arrayBufferToBuffer (arrayBuffer) {
  const buffer = new Buffer(arrayBuffer.byteLength)
  const view = new Uint8Array(arrayBuffer)

  for (let i = 0, len = buffer.length; i < len; i++) {
    buffer[i] = view[i]
  }
  return buffer
}

// this method is only used in the node environment
export function cloneBuffer (buffer, isDeep) {
  if (isDeep) return buffer.slice()

  const length = buffer.length
  const result = Buffer && Buffer.allocUnsafe
    ? Buffer.allocUnsafe(length)
    : new buffer.constructor(length)

  buffer.copy(result)
  return result
}