import { once, isNumber } from '../share'

export function startCoreFn (Instance, time, duration, cb) {
  const { audio, options } = Instance
  // when stream end, audio duration will update to normal value
  // so, if have loop play, the duration arg will update
  if (duration > audio.duration) {
    duration = audio.duration
  }

  // save resouce duration, can't set in delayPlay function
  // because duration need real time
  if (duration !== Instance.duration) {
    Instance.duration = duration
  }

  delayPlay(Instance, () => {
    const playEnd = once(() => {
      if (Instance.endTimer && Instance.endTimer.t) {
        clearTimeout(Instance.endTimer.t)
        Instance.endTimer = null
      }
      // if the end time is reached, we need to re-looping
      if (options.loop && Instance.state !== 'pause') {
        // evertimes loop play, need pause previous play
        audio.pause()
        Instance.state === 'pause'
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
      Instance.resumeState()
      typeof cb === 'function' && cb(true)
    }

    const error = err => {
      // can't auto play
      typeof cb === 'function' && cb(false)
      Instance.dispatch('playerror', err)
      // we don't need throw error
      return err
    }
    audio.play().then(success, error)
  })
}

// the delay node can't use audio element, so, we use timeout
export function delayPlay (Instance, cb) {
  const delay = Instance.options.delay
  if (isNumber(delay) && delay !== 0) {
    // the delayTimer maybe clear in stop method
    Instance.delayTimer = setTimeout(() => {
      // clean
      clearTimeout(Instance.delayPlay)
      Instance.delayTimer = null
      cb()
    }, delay * 1000)
  } else {
    cb()
  }
}

// type should be a "start" or "stop"
export function fadeStartOrPlay (Instance, type, time, url, t, d) {
  if (isNumber(time)) {
    return new Promise(resolve => {
      const originVolume = Instance.options.volume
      Instance.setVolume(0)
      // if type is play, the params is invalid
      Instance[type](url, t, d).then(result => {
        const { nodes, AudioCtx } = Instance
        const gainNode = nodes && nodes.gainNode
        if (gainNode && result !== false) {
          gainNode.gain.linearRampToValueAtTime(originVolume, AudioCtx.currentTime + time)
          resolve(true)
        } else {
          resolve(false)
        }
        // restore volume value
        Instance.options.volume = originVolume
      })
    })
  } else {
    return Instance[type]()
  }
}

// type should be a "stop" or "pause"
export function fadeStopOrPause (Instance, type, time) {
  if (isNumber(time)) {
    const { nodes, AudioCtx } = Instance
    const gainNode = nodes && nodes.gainNode
    if (gainNode) {
      // a little ahead of the end
      setTimeout(() => Instance[type](),  time * 990)
      gainNode.gain.linearRampToValueAtTime(0, AudioCtx.currentTime + time)
    }
  } else {
    Instance[type]()
  }
}