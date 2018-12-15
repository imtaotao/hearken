import { once, isUndef } from '../../util'

export function startCore (elementSource, time, duration) {
  const { Hearken, audioElement } = elementSource

  const playEnd = once(e => {
    // if the end time is reached, we need to re-looping
    if (Hearken.$options.loop) {
      startCore(elementSource, time, duration)
      return
    }

    audioElement.pause()
    elementSource.state = 'pause'
    Hearken.$callHooks('playEnd', e)
  })

  Hearken.$connectNodes(['gainNode', 'analyser', 'source'])
  
  audioElement.loop = Hearken.$options.loop
  audioElement.onended = playEnd

  elementSource.state = 'playing'

  // set audio
  time && (audioElement.currentTime = time)
  Hearken.setVolume()
  Hearken.setFilterStyle()

  audioElement.play().then(() => {
    !isUndef(duration) && setTimeout(playEnd, duration * 1000)
    Hearken.$callHooks('start')
  })
}