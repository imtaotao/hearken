import { once, isUndef } from '../../util'

export function startCore (elementSource, time, duration) {
  const { Hearken, audioElement } = elementSource

  const playEnd = once(e => {
    // if the end time is reached, we need to re-looping
    if (Hearken.$options.loop) {
      audioElement.currentTime = 0
      return
    }

    audioElement.pause()
    elementSource.state = 'pause'
    Hearken.$callHooks('playEnd', e)
  })
  
  audioElement.loop = Hearken.$options.loop
  audioElement.onended = playEnd

  // connect source url
  const mediaSource = elementSource.mediaSource = createMediaSource(audioElement)

  mediaSource.onsourceopen = () => {
    getSourceBuffer(elementSource, sourceBuffer => {
      elementSource.sourceBuffer = sourceBuffer
      elementSource.state = 'playing'

      // set audio
      time && (audioElement.currentTime = time)
      Hearken.setVolume()
      Hearken.setFilterStyle()
      window.aa = audioElement
      audioElement.play().then(() => {
        !isUndef(duration) && setTimeout(playEnd, duration)
        Hearken.$callHooks('start')
      })
    })
  }
}

// we can use mediaSource transfer media source
function createMediaSource (audioElement) {
  const mediaSource = new MediaSource()
  audioElement.src = URL.createObjectURL(mediaSource)
  return mediaSource
}

function getSourceBuffer (elementSource, cb) {
  const { Hearken, mediaSource } = elementSource
  const { mime, source } = Hearken.$options
  const sourceBuffer = mediaSource.addSourceBuffer(mime)

  sourceBuffer.onupdateend = e => {
    // Hearken.$callHooks('updateend')
    // cb(sourceBuffer)
    mediaSource.endOfStream();
    window.aa = elementSource.audioElement
    // elementSource.audioElement.play()
  }

  console.log(source);

  sourceBuffer.appendBuffer(source)
}