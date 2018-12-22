import { once, isNumber } from '../share'

export function startCoreFn (Instance, time, duration, cb) {
  const { audio, options } = Instance
  const playEnd = once(() => {
    // if the end time is reached, we need to re-looping
    if (options.loop && Instance.state !== 'pause') {
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
      const delayTime = duration * 1000
      // record play end data
      Instance.endTimer = {
        delayTime,
        now: Date.now(),
        t: setTimeout(playEnd, delayTime),
      }
    }
    Instance.state = 'playing'
    Instance.dispatch('start')
    typeof cb === 'function' && cb(true)
  }

  const error = err => {
    // can't auto play
    Instance.dispatch('playerror', err)
    typeof cb === 'function' && cb(false)
    return err
  }
  return audio.play().then(success, error)
}