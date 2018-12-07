export default function audioControlHelper (HearkenProto) {
  const controlHelp = HearkenProto.controlHelp = Object.create(null)

  // connnect order
  // audioContext.destination -> gainNode -> analyser -> convolver
  controlHelp.connectNodes = connectNodes
}

const defalutHertz = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

function connectNodes (audioNodes) {
  const { tool, options, container, AudioContext } = this.Hearken
  let { hertz, filter } = options

  if (hertz === 'default') {
    hertz = defalutHertz
  }

  for (let i = 0, len = audioNodes.length; i < len; i++) {
    const node = audioNodes[i]

    // the first node connect to audioContext
    if (i === 0) {
      container[node].connect(AudioContext.destination)
    } else {
      let preNode = container[audioNodes[i - 1]]

      // connect the filter node in advance of buffersouce
      if (node === 'bufferSource' && hertz && filter) {
        hertz.forEach(hz => {
          const nowFilter = tool.createFilter(hz)
          nowFilter.connect(preNode)
          preNode = nowFilter
          container.filterNodes[hz] = nowFilter
        })
      }
      container[node].connect(preNode)
    }
  }
}