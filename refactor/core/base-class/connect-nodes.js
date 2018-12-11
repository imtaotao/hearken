import { createFilter } from './create-nodes'

export default function connect (Hearken, nodeNames) {
  const { $options, $audioCtx, $Container } = Hearken
  const { hertz, filter } = $options
  const nodes = $Container.nodes

  for (let i = 0, len = nodeNames.length; i < len; i++) {
    let name = nodeNames[i]

    if (i === 0) {
      nodes[name].connect($audioCtx.destination)
    } else {
      let preNode = nodes[nodeNames[i - 1]]

      if (name === 'source') {
        name = Hearken.$isComplete
          ? 'bufferSource'
          : 'mediaSource'
        
        // if set hertz and filter, we need connect filter nodes
        if (hertz && filter) {
          hertz.forEach(hz => {
            const nowFilter = createFilter($audioCtx, hz)
            nowFilter.connect(preNode)
            preNode = nowFilter
            $Container.filterNodes[hz] = nowFilter
          })
        }
      }

      nodes[name].connect(preNode)
    }
  }
}