import { each } from '../share'

const mediaElementNodes = new WeakMap()

export function createNodes (audioCtx, options, needMedia, audioElment) {
  const nodes = Object.create(null)

  // delay allow must time is 180s
  nodes.delay = audioCtx.createDelay(179.9)
  
  nodes.panner = audioCtx.createPanner()
  nodes.gainNode = createGainNode(audioCtx)
  nodes.convolver = audioCtx.createConvolver()
  nodes.passFilterNode = createFilter(audioCtx)
  nodes.analyser = createAnalyser(audioCtx, options)

  if (needMedia) { 
    nodes.mediaSource = saveMediaSource(audioCtx, audioElment)
  } else {
    nodes.bufferSource = audioCtx.createBufferSource()
  }
  return nodes
}

// create filter node
export function createFilter (audioCtx) {
  const ra = audioCtx.createBiquadFilter()
  ra.type = 'peaking'
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
export function connect (Instance, cb) {
  let preNode
  const { nodes, filter, AudioCtx, connectOrder } = Instance

  for (let i = 0, len = connectOrder.length; i < len; i++) {
    let name = connectOrder[i]

    if (i === 0) {
      nodes[name].connect(AudioCtx.destination)
      preNode = nodes[name]
    } else {
      if (name === 'filterNode') {
        // if set hertz and filter, we need connect filter nodes
        if (filter.isExist()) {
          preNode = connectFilterNodes(AudioCtx, filter.hertz, preNode, cb)
        }
      } else {
        if (name === 'convolver') {
          // if convolver buffer is null, we can't connect this node
          if (nodes[name].buffer === null) {
            continue
          }
        }
        nodes[name].connect(preNode)
        preNode = nodes[name]
      }
    }
  }
}

export function disconnectNodes (Instance) {
  const nodes = Instance.nodes
  const filterNodes = Instance.filter.filterNodes

  each(nodes, node => node.disconnect())
  each(filterNodes, node => node.disconnect())
}

export function connectFilterNodes (audioCtx, hertz, preNode, cb) {
  if (!hertz) return preNode
  for (let i = 0, len = hertz.length; i < len; i++) {
    const hz = hertz[i]
    const filterNode = createFilter(audioCtx, hz)
    filterNode.connect(preNode)
    preNode = filterNode
    cb && cb(hz, filterNode)
  }
  return preNode
}