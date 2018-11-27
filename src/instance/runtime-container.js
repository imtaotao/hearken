export default function createRuntimeContainer (HearkenProto) {
  HearkenProto.container = Object.create(null)

  HearkenProto.container.analyser = null
  HearkenProto.container.gainNode = null
  HearkenProto.container.convolver = null
  HearkenProto.container.bufferSource = null
  HearkenProto.container.filter = Object.create(null)

  HearkenProto.resetContainer = isCleanFilter => {
    const { container, tool } = HearkenProto

    container.analyser = tool.createAnalyser()
    container.gainNode = tool.createGainNode()
    container.convolver = tool.createConvolver()
    container.bufferSource = tool.createBufferSource()

    if (isCleanFilter) {
      HearkenProto.container.filter = Object.create(null)
    }
  }
}