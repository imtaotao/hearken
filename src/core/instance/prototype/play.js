import { soundPlayEnded } from './util'
import { isNumber } from '../../../util'

// if the first play, we need to call start method play sound, until call stop method
let canCallStart = true
let soundPlayEnd = true


/**
 * this method allow forward or back toogle the sound, but if the sound is pause state
 * we can't call this method.
 * every times start, we need connect audio nodes, then repeat use audioBuffer, set
 * sound end event.
 * */
export function start (time, duration) {
  if (this.getState() === 'suspended') {
    throw new Error('Current audioContext state is "suspended", you can call "play" method.')
  }

  const { options, container, controlHelp } = this
  if (!container.audioBuffer) return

  // we can't allow mutilple sound play, so, we need stop previous sound
  this.stop()
  soundPlayEnd = false
  container.resetContainer()

  const { audioBuffer, bufferSource, filterStyleName } = container

  controlHelp.connectNodes(['gainNode', 'analyser', 'bufferSource'])
  bufferSource.buffer = audioBuffer
  bufferSource.loop = options.loop
  bufferSource.onended = e => {
    // if call stop in start, then dispatch "end" event, we need prevent
    soundPlayEnd && soundPlayEnded(this, e)
    soundPlayEnd = true
  }
  
  const playMusic = bufferSource.start
    ? bufferSource.start
    : bufferSource.noteOn

  time = isNumber(time) ? time : 0
  duration = isNumber(duration) ? duration : undefined

  playMusic.call(bufferSource, 0, time, duration)
  
  this.setVolume()
  this.setFilterStyle(filterStyleName)
  this.$callHooks('start')

  canCallStart = false
}

// if the sound state is pause, nothing to do
export function stop () {
  const bufferSource = this.container.bufferSource
  if (!bufferSource || this.getState() === 'suspended') {
    return
  }

  const stopMusic = bufferSource.stop
    ? bufferSource.stop
    : bufferSource.noteOff

  stopMusic.call(bufferSource)
  canCallStart = true
  soundPlayEnd = true

  this.$callHooks('stop')
}

// if the sound state is pause, we need to resume playback, otherwise we can call start method
export function play () {
  if (canCallStart && this.getState() !== 'suspended') {
    const { options, container, tool } = this
    // play sound, call hooks function and changed promise state
    const callPlay = resolve => {
      this.start()
      this.$callHooks('play')
      resolve()
    }

    return new Promise(resolve => {
      if (!container.audioBuffer) {
        tool.decode(options.source).then(audioBuffer => {
          container.audioBuffer = audioBuffer
          callPlay(resolve)
        })
      } else {
        callPlay(resolve)
      }
    })
  } else {
    return this.AudioContext.resume().then(() => {
      this.hooks.play()
    })
  }
}

// return promise
export function pause () {
  if (this.getState() === 'running' && !canCallStart) {
    return this.AudioContext.suspend().then(() => {
      this.$callHooks('playPause')
    })
  }
}