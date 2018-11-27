export default function audioControlHelper (HearkenProto) {
  const controlHelp = HearkenProto.controlHelp = Object.create(null)

  // connnect order
  // audioContext.destination -> gainNode -> analyser -> convolver
  controlHelp.connectNodes = connectNodes
  controlHelp.getContextState = getContextState
  controlHelp.getVisualizerData = getVisualizerData
}

function getContextState () {
  return this.Hearken.AudioContext.state
}

function getVisualizerData () {
  const analyser = this.Hearken.container.analyser
  if (!analyser) return []

  const array = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(array)

  return array
}

function connectNodes (audioNodes) {
  const { tool, options, container, AudioContext } = this.Hearken

  for (let i = 0, len = audioNodes.length; i < len; i++) {
    const node = audioNodes[i]

    // the first node connect to audioContext
    if (i === 0) {
      container[node].connect(AudioContext.destination)
    } else {
      let preNode = container[audioNodes[i - 1]]
      const hertz = options.hertz

      // connect the filter node in advance of buffersouce
      if (node === 'buffersouce' && hertz) {
        hertz.forEach(hz => {
          const nowFilter = tool.createFilter()
          nowFilter.connect(preNode)
          preNode = nowFilter
          container.filter[hz] = nowFilter
        })
      }
      container[node].connect(preNode)
    }
  }
}
