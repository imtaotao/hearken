const mediaElementNodes = new WeakMap()

export function createNodes (audioCtx, options, needMedia, audioElment) {
  const nodes = Object.create(null)

  nodes.panner = audioCtx.createPanner()
  nodes.gainNode = createGainNode(audioCtx)
  nodes.analyser = createAnalyser(audioCtx, options)
  nodes.convolver = audioCtx.createConvolver()

  if (needMedia) { 
    nodes.mediaSource = saveMediaSource(audioCtx, audioElment)
  } else {
    nodes.bufferSource = audioCtx.createBufferSource()
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

function createAnalyser (audioCtx, options) {
  const analyser = audioCtx.createAnalyser()
  // fourier transform parameter
  analyser.fftSize = options.fftSize * 2
  return analyser
}

// create volume control node
function createGainNode (audioCtx) {
  const ac = audioCtx
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

// connect nodes
export function connect (audioCtx, nodes, nodeNames, options, cb) {
  const { hertz, filter } = options
  for (let i = 0, len = nodeNames.length; i < len; i++) {
    let name = nodeNames[i]
 
    if (i === 0) {
      nodes[name].connect(audioCtx.destination)
    } else {
      let preNode = nodes[nodeNames[i - 1]]
      if (name === 'bufferSource' || name === 'mediaSource') {
        // if set hertz and filter, we need connect filter nodes
        if (hertz && filter) {
          hertz.forEach(hz => {
            const nowFilter = createFilter(audioCtx, hz)
            nowFilter.connect(preNode)
            preNode = nowFilter
            cb(hz, nowFilter)
          })
        }
      }
      nodes[name].connect(preNode)
    }
  }
}