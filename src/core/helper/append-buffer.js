
import { inlineWorker } from '../../util'

export function acceptBuffer (Hearken, arrayBuffer) {
  const { id, container, options } = Hearken
  const bufferQueue = container.bufferQueue

  if (!bufferQueue.length) {
    setTimeout(() => {
      Hearken.id === id
        ? updateBufferQueue(Hearken, bufferQueue)
        : container.bufferQueue = [options.source]
    })
  }

  bufferQueue.push(arrayBuffer)
}

function updateBufferQueue (Hearken, bufferQueue) {
  const worker = inlineWorker(workerThread)

  // send data
  worker.postMessage({
    id: Hearken.id,
    buffers: bufferQueue,
  })

  worker.onerror = error => {
    throw new Error(error)
  }

  worker.onmessage = e => {
    const { id, buffer } = e.data
    if (Hearken.id === id) {
      dealWithBuffer(Hearken, buffer)
    }
  }
}

function dealWithBuffer (Hearken, buffer) {
  Hearken.container.bufferQueue = [buffer]
}

function workerThread () {
  function mergeArraybuffer (buffers) {
    if (buffers.length === 1) return buffers[0]
    const isValidArray = v => {
      const reg = /Int(8|16|32)Array|Uint(8|8Clamped|16|32)Array|Float(32|64)Array|ArrayBuffer/gi
      return reg.test({}.toString.call(v))
    }
  
    if (!isValidArray(buffers[0])) {
      return new Uint8Array(0).buffer
    }
  
    return buffers.reduce((collectBuffer, buffer, i) => {
      if (i === 0) return collectBuffer
      if (!isValidArray(buffer)) return collectBuffer
  
      let tmp = new Uint8Array(collectBuffer.byteLength + buffer.byteLength)
      tmp.set(new Uint8Array(collectBuffer), 0)
      tmp.set(new Uint8Array(buffer), collectBuffer.byteLength)
  
      return tmp.buffer
    }, buffers[0])
  }

  this.onmessage = e => {
    const { id, buffers } = e.data
    const completeBuffer = mergeArraybuffer(buffers)
    
    this.postMessage({
      id,
      buffer: completeBuffer,
    })
  }
} 