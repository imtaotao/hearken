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



export function operationalBuffer (Record, input, output) {
  const buffers = []
  const canCall = typeof Record.process === 'function'

  for (let i = 0; i < Record.channels; i++) {
    const inputData = input.getChannelData(i)
    const outputData = output.getChannelData(i)

    // allow pitch shift
    canCall && Record.process(inputData, outputData, Record.frameSize)

    buffers.push(
      !canCall || Record.collectPureData
        ? inputData
        : outputData
    )
  }

  Record.send('appendBuffer', {
    buffers,
    channels: Record.channels,
  })
}

export function workerEvent (Record) {
  return e => { 
    switch(e.data.command) {
      case 'getFile' :
        Record.dispatch('_getFile', e.data.value)
        break
      case 'exportBuffer' :
        const typeArrData = e.data.value
        const buffer = typeArrData && typeArrData.buffer

        Record.buffer = buffer
        Record.float32Array = typeArrData
        Record.dispatch('_exportBuffer', buffer)
        break
    }
  }
}