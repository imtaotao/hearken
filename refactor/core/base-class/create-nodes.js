const mediaElementNodes = new WeakMap()

export default function createNodes (Hearken, needMedia, audioElment) {
  const nodes = Object.create(null)

  nodes.analyser = createAnalyser(Hearken)
  nodes.gainNode = createGainNode(Hearken)
  nodes.convolver = Hearken.$audioCtx.createConvolver()

  if (needMedia) { 
    nodes.mediaSource = saveMediaSource(Hearken.$audioCtx, audioElment)
  } else {
    nodes.bufferSource = Hearken.$audioCtx.createBufferSource()
  }

  return nodes
}

// create filter node
export function createFilter (audioCtx, hz, gainVal = 0, type = 'peaking') {
  const ra = audioCtx.createBiquadFilter()

  ra.type = type
  ra.Q.value = 10
  ra.frequency.value = hz
  ra.gain.value = gainVal

  return ra
}

function createAnalyser (Hearken) {
  const analyser = Hearken.$audioCtx.createAnalyser()
  // fourier transform parameter
  analyser.fftSize = Hearken.$options.fftSize * 2
  return analyser
}

// create volume control node
function createGainNode (Hearken) {
  const ac = Hearken.$audioCtx
  return ac[
    ac.createGain
      ? 'createGain'
      : 'createGainNode'
  ]()
}

function saveMediaSource (audioCtx, audio) {
  if (mediaElementNodes.has(audio)) {
    return mediaElementNodes.get(audio)
  } else {
    const source = audioCtx.createMediaElementSource(audio)
    mediaElementNodes.set(audio, source)
    return source
  }
}