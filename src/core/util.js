import { isUndef, getLegalDuration } from '../share'

export function startCoreFn (Instance, time, duration) {
  const { nodes, options, audioBuffer } = Instance
  const id = Instance.id
  const loop = options.loop
  const bufferSource = nodes.bufferSource
  const connectOrder = ['panner', 'delay', 'gainNode', 'analyser', 'passFilterNode', 'filterNode', 'bufferSource']
  
  if (bufferSource.buffer) {
    console.warn('bufferSource is non-null')
    return
  }

  // save resouce duration
  if (duration !== Instance.duration) {
    duration = getLegalDuration(audioBuffer.duration, Instance.options.rate, duration)
    Instance.duration = duration
      ? duration
      : audioBuffer.duration
  }

  Instance.connectNodes(connectOrder)
  bufferSource.buffer = audioBuffer
  bufferSource.loop = loop
  bufferSource.onended = e => {
    // if pass call stop method dispatch ended event, we need prevent
    if (loop && !isUndef(duration) &&
        !Instance.callStop && Instance.id === id) {
      Instance.startTime = null
      Instance.start(time, duration, true)
      return
    }
    Instance.dispatch('ended', e)
  }
  
  const playMusic = bufferSource.start
    ? bufferSource.start
    : bufferSource.noteOn

  // the delay time is 0, because we used delayNode
  playMusic.call(bufferSource, 0, time, duration)

  Instance.starting = true
  Instance.startTime = Date.now()
  Instance.dispatch('start')
}

export function callChildMethod (children, allowCb, cb) {
  const length = children.length
  if (length === 0) return

  const call = child => {
    if (typeof allowCb === 'function') {
      allowCb(child) !== false && cb(child)
    } else {
      cb(child)
    }
  }

  if (length === 1) {
    call(children[0])
  } else {
    for (let i = 0; i < length; i++) {
      call(children[i])
    }
  }
}

// register Hearken play and pause event, let's get the correct current time
export function registerEvent (Hearken, Instance) {
  Hearken.on('play', () => {
    const { playing, starting } = Instance
    const canContinue = !playing && starting
    if (canContinue) {
      Instance.playingTime = Instance.getCurrentTime() * 1000
      Instance.startTime = Date.now()
      Instance.playing = true
    }
    Instance.dispatch('play')
  })
  Hearken.on('pause', () => {
    Instance.playingTime = Instance.getCurrentTime() * 1000
    Instance.startTime = 0
    Instance.playing = false
    Instance.dispatch('pause')
  })
}