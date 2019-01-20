export function createProcessingNode (Pitch, AudioCtx, fn) {
  const { channels, frameSize } = Pitch
  const scriptNode = AudioCtx.createScriptProcessor
    ? AudioCtx.createScriptProcessor(frameSize, channels, channels)
    : AudioCtx.createJavaScriptNode(frameSize, channels, channels)

  scriptNode.onaudioprocess = function (e) {
    fn(Pitch, e.inputBuffer, e.outputBuffer)
  }
  return scriptNode
}

export function mallocFloat (FLOAT, n) {
  const key = Math.floor(Math.log2(n))
  const cache = FLOAT[key]
  return cache && cache.length > 0
    ? cache.pop()
    : new Float32Array(n)
}

export function freeFloat (FLOAT, array) {
  const key = Math.floor(Math.log2(array.length))
  FLOAT[key]
    ? FLOAT[key].push(array)
    : FLOAT[key] = [array]
}