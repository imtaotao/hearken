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
  n = nextPow2(n)
  const cache = FLOAT[log2(n)]
  return cache.length > 0
    ? cache.pop()
    : new Float32Array(n)
}

export function freeFloat (FLOAT, array) {
  const key = log2(array.length)
  FLOAT[key]
    ? FLOAT[key].push(array)
    : FLOAT[key] = [array]
}

function nextPow2 (v) {
  v += v === 0
  --v
  v |= v >>> 1
  v |= v >>> 2
  v |= v >>> 4
  v |= v >>> 8
  v |= v >>> 16
  return v + 1
}

function log2 (v) {
  let r, shift
  r = (v > 0xFFFF) << 4; v >>>= r
  shift = (v > 0xFF) << 3; v >>>= shift; r |= shift
  shift = (v > 0xF) << 2;  v >>>= shift; r |= shift
  shift = (v > 0x3) << 1;  v >>>= shift; r |= shift
  return r | (v >> 1)
}