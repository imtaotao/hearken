// this is worker thread
export default function workerBody () {
  const _self = this

  // deal with record data
  const bufferUtil = {
    data: [],

    collect ({ buffers, channels }) {
      for (let i = 0; i < channels; i++) {
        !this.data[i]
          ? this.data[i] = [buffers[i]]
          : this.data[i].push(buffers[i])
      }
    },

    getData ({ channels, frameSize }) {
      if (this.data.length > 0) {
        const buffers = []
        for (let i = 0; i < channels; i++) {
          buffers.push(this.merge(this.data[i], frameSize))
        }

        const length = buffers[0].length + buffers[1].length
        const result = new Float32Array(length)
        let index = 0
        let inputIndex = 0

        // merge left channel and right channel.
        while (index < length) {
          result[index++] = buffers[0][inputIndex]
          result[index++] = buffers[1][inputIndex]
          inputIndex++
        }
        return result
      }
      return null
    },

    merge (buffers, frameSize) {
      const result = new Float32Array(frameSize * buffers.length)

      for (let i = 0, offset = 0; i < buffers.length; i++) {
        result.set(buffers[i], offset)
        offset += buffers[i].length
      }

      return result
    }
  }

  // create wav file and download
  const fileUtil = {
    encodeWAV ({ sampleRate, channels, samples }) {
      const dataLength = samples.length * channels
      const buffer = new ArrayBuffer(dataLength + 44)
      const view = new DataView(buffer)

      this.writeString(view, 0, 'RIFF')
      view.setUint32(4, 36 + dataLength, true)
      this.writeString(view, 8, 'WAVE')
      this.writeString(view, 12, 'fmt ')
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, channels, true)
      view.setUint32(24, sampleRate, true)
      view.setUint32(28, sampleRate * channels * 2, true)
      view.setUint16(32, channels * 2, true)
      view.setUint16(34, 16, true)
      this.writeString(view, 36, 'data')
      view.setUint32(40, dataLength, true)
      this.floatTo16BitPCM(view, 44, samples)

      return view
    },

    floatTo16BitPCM (output, offset, input) {
      for (let i = 0; i < input.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]))
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
      }
    },
  
    writeString (view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
  }

  // send command
  function send (command, value) {
    _self.postMessage({ command, value })
  }

  // worker event
  _self.onmessage = e => {
    // commands
    const gfl = 'getFile'
    const app = 'appendBuffer'
    const exp = 'exportBuffer'
 
    switch(e.data.command) {
      case gfl :
        // send wav file data
        send(gfl, fileUtil.encodeWAV(e.data.value))
        break
      case app :
        // append record buffer
        bufferUtil.collect(e.data.value)
        break
      case exp :
        // send collect buffer
        send(exp, bufferUtil.getData(e.data.value))
        bufferUtil.data = []
        break
    }
  }
}