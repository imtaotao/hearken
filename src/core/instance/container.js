import { COMPLETE } from '../helper/filter-options'

export default function createRuntimeContainer (HearkenProto) {
  const container = HearkenProto.container = Object.create(null)

  container.analyser = null
  container.gainNode = null
  container.convolver = null
  container.bufferSource = null

  container.audioBuffer = null
  container.filterStyleName = null
  container.bufferQueue = []
  container.filterNodes = Object.create(null)

  HearkenProto.container.resetContainer = function (cb) {
    const { container, tool } = HearkenProto

    container.analyser = tool.createAnalyser()
    container.gainNode = tool.createGainNode()
    container.convolver = tool.createConvolver()
    container.bufferSource = tool.createBufferSource()

    if (this.Hearken.options.mode === COMPLETE) {
      container.bufferQueue = [this.Hearken.options.source]
    }

    // now, we can't reset "filter" and "filterStyleName", so, we provide callback deal with this things
    typeof cb === 'function' && cb(container)
  }
}