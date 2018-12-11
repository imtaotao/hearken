import connect from './connect-nodes'
import createNodes from './create-nodes'
import { PARTICAL, COMPLETE } from '../default'

export default class Base {
  constructor () {
    this.$Container = Object.create(null)
    this.$Container.nodes = null
    this.$Container.audioBuffer = null
    this.$Container.filterStyle = null
    this.$Container.filterNodes = Object.create(null)
  }

  $getState () {
    return this.$audioCtx.state
  }

  $isPartical () {
    return this.$options.mode = PARTICAL
  }
  
  $isComplete () {
    return this.$options.mode === COMPLETE
  }

  $callHooks (name, ...args) {
    if (typeof this.life[name] === 'function') {
      this.life[name].apply(this, args)
    }
  }

  $connectNodes (nodeNames) {
    connect(this, nodeNames)
  }

  $resetContainer (audioElement) {
    this.$Container.nodes = createNodes(this, !!audioElement, audioElement)
  }

  $filterAssignment (data) {
    const hertz = this.$options.hertz
    const filterNodes = this.$Container.filterNodes

    for (let i = 0, len = hertz.length; i < len; i++) {
      const hz = hertz[i]
      const nowFilter = filterNodes[hz]
  
      if (nowFilter) {
        nowFilter.gain.value = data[i] * 1.5
      }
    }
  }
}