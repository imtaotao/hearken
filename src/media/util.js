import { once, isNumber } from '../share'

export function startCoreFn (Instance, time, duration, cb) {
  const { id, audio, options } = Instance
  const playEnd = once(() => {
    const { state, id:nid } = Instance
    // if the end time is reached, we need to re-looping
    if (options.loop && state !== 'pause' && nid === id) {
      startCoreFn(Instance, time, duration)
      return
    }
    Instance.state = null
    // replay function return result is promise of startCoreFn 
    Instance.dispatch('ended', () => startCoreFn(Instance, time, duration))
  })

  // save resouce duration
  if (duration !== Instance.duration) {
    Instance.duration = duration
  }

  Instance.dispatch('startBefore')
  Instance.connectNodes()

  audio.loop = options.loop
  audio.onended = playEnd

  if (isNumber(time)) {
    audio.currentTime = time
  }
  
  const success = () => {
    if (isNumber(duration)) {
      Instance.endTimer = setTimeout(playEnd, duration * 1000)
    }
    Instance.state = 'playing'
    Instance.dispatch('start')
    typeof cb === 'function' && cb(true)
  }

  const error = err => {
    // can't auto play
    Instance.dispatch('playError', err)
    typeof cb === 'function' && cb(false)
    return err
  }
  return audio.play().then(success, error)
}