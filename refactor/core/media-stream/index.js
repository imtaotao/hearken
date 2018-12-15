export default class _MediaStream {
  constructor (Hearken) {
    this.Hearken = Hearken
    this.mediaSource = new MediaSource()
    this.sourceBuffer = null
  }

  connect (audioElement) {
    return new Promise(resolve => {
      const { Hearken, mediaSource } = this
      audioElement.src = URL.createObjectURL(mediaSource)
      mediaSource.onsourceopen = () => {
        const sourceBuffer = mediaSource.addSourceBuffer(Hearken.$options.mime)
        sourceBuffer.onupdateend = e => {
          Hearken.$callHooks('updateend')
          resolve()
        }
        this.sourceBuffer = sourceBuffer
      }
    })
  }

  endOfStream () {
    if (this.mediaSource.readyState === 'open') {
      this.mediaSource.endOfStream()
    }
  }

  appendBuffer (buffer) {
    if (this.sourceBuffer) {
      this.sourceBuffer.appendBuffer(buffer)
    }
  }

  isInitComplete () {
    return this.mediaSource && this.sourceBuffer
  }
}