export function connectRecordDevice (Record) {
  return navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
    Record.dispatch('error', 'Unable to use recording device')
  })
}

export function createProcessingNode (Record, fn) {
  const { AudioCtx, frameSize, channels } = Record
  const scriptNode = AudioCtx.createScriptProcessor
    ? AudioCtx.createScriptProcessor(frameSize, channels, channels)
    : AudioCtx.createJavaScriptNode(frameSize, channels, channels)

  scriptNode.onaudioprocess = function (e) {
    fn(Record, e.inputBuffer, e.outputBuffer)
  }
  return scriptNode
}