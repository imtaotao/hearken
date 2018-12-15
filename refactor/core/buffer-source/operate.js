import { isUndef, isNumber } from '../../util'

export function startCore (Ctrl, time, duration) {
  const Hearken = Ctrl.Hearken
  const { nodes, audioBuffer } = Hearken.$Container
  const bufferSource = nodes.bufferSource

  time = isNumber(time) ? time : 0
  duration = isNumber(duration) ? duration : undefined
  
  Hearken.$connectNodes(['gainNode', 'analyser', 'source'])
  bufferSource.buffer = audioBuffer
  bufferSource.loop = Hearken.$options.loop
  bufferSource.onended = e => {
    if (Hearken.$options.loop && !isUndef(duration)) {
      Ctrl.start(time, duration)
      return
    }
    Hearken.$callHooks('playEnd', e)
  }
  
  const playMusic = bufferSource.start
    ? bufferSource.start
    : bufferSource.noteOn

  

  playMusic.call(bufferSource, 0, time, duration)

  Hearken.setVolume()
  Hearken.setFilterStyle()
  Hearken.$callHooks('start')
}

// play or pause
export function playOrPause (Hearken, type) {
  let methodName, stateName

  if (type === 'play') {
    methodName = 'resume'
    stateName = 'suspended'
  } else {
    methodName = 'suspend'
    stateName = 'running'
  }

  if (Hearken.$getState() === stateName) {
    return Hearken.$audioCtx[methodName]().then(() => {
      Hearken.$callHooks(type)
    })
  }
  return Promise.resolve(false)
}