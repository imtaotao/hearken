import { once, isNumber } from '../share'

export function startCoreFn (Instance, time, duration, cb) {
  const { id, audio, options } = Instance
  const playEnd = once(e => {
    // if the end time is reached, we need to re-looping
    if (options.loop && Instance.state !== 'pause'
      && Instance.id === id) {
      startCoreFn(Instance, time, duration)
      return
    }
    Instance.state = null
    // replay function return result is promise of startCoreFn 
    Instance.dispatch('ended', () => startCoreFn(Instance, time, duration))
  })

  Instance.dispatch('startBefore')
  Instance.connectNodes()

  audio.loop = options.loop
  audio.onended = playEnd

  if (isNumber(time)) {
    audio.currentTime = time
  }
  
  const success = () => {
    if (isNumber(duration)) {
      setTimeout(playEnd, duration * 1000)
    }
    Instance.state = 'playing'
    Instance.dispatch('start')
    cb(true)
  }

  const error = err => {
    // can't auto play
    Instance.dispatch('playError', err)
    cb(false)
    return err
  }
  return audio.play().then(success, error)
}