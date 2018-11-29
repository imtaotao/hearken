import { isNumber } from '../../util'
import {
  filterAssignment,
  getDefualtFilterArgs,
} from './util'

export default function createExportApi (HearkenProto) {
  // progress control
  HearkenProto.play = play
  HearkenProto.stop = stop
  HearkenProto.start = start
  HearkenProto.pause = pause

  HearkenProto.setVolume = setVolume
  HearkenProto.setFilterStyle = setFilterStyle

  HearkenProto.getVisualizerData = getVisualizerData
  HearkenProto.destroy = destroyInstance

  HearkenProto.callHooks = callHooks
  HearkenProto.getState = function () {
    return this.AudioContext.state
  }
}

// if the first play or already stop the sound, we need to call start method play sound
let canCallStart = true
let soundPlayEnd = true

/**
 * this method allow forward or back toogle the sound, but if the sound is pause
 * we can't call this method.
 * every times start, we need connect audio nodes, then repeat use audioBuffer, set
 * sound end event.
 * */
function start (time, duration) {
  if (this.getState() === 'suspended') {
    throw new Error('Current audioContext state is "suspended", you can call "play" method')
  }

  const { options, container, controlHelp } = this
  if (!container.audioBuffer) return

  // we can't allow mutilple sound play, so, we need stop previous sound
  this.stop()
  soundPlayEnd = false
  this.container.resetContainer()

  const { audioBuffer, bufferSource, filterStyleName } = container

  controlHelp.connectNodes(['gainNode', 'analyser', 'bufferSource'])
  bufferSource.buffer = audioBuffer
  bufferSource.loop = options.loop
  bufferSource.onended = e => {
    // if call stop in start, then dispatch "end" event, we need prevent
    soundPlayEnd && this.callHooks('playEnd', e)
    soundPlayEnd = true
  }
  
  const playMusic = bufferSource.start
    ? bufferSource.start
    : bufferSource.noteOn

  time = isNumber(time) ? time : 0
  playMusic.call(bufferSource, 0, time, duration)
  
  this.setVolume()
  this.setFilterStyle(filterStyleName)
  this.hooks.start()
  canCallStart = false
}

// if the sound state is pause, nothing to do
function stop () {
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
}

// return promise
function play () {
  if (canCallStart) {
    const { options, container, hooks, tool } = this
    // play sound, call hooks function and changed promise state
    const callPlay = resolve => {
      this.start()
      hooks.play()
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
function pause () {
  if (this.getState() === 'running' && !canCallStart) {
    return this.AudioContext.suspend().then(() => {
      this.hooks.pause()
    })
  }
}

// set sound volume
function setVolume (precent, cb) {
  const volume = precent && isNumber(precent)
    ? precent
    : this.options.volume
  
  if (this.container.gainNode) {
    this.container.gainNode.gain.value = volume * volume
    typeof cb === 'function' && cb()
  } else {
    throw new Error('audioContext gainNode is null')
  }
}

// if have the filter, we can set the filter style
function setFilterStyle (styleName) {
  const { hertz, filter } = this.options
  if (!filter || !hertz) return
  
  const args = filter === 'defualt'
    ? getDefualtFilterArgs(styleName)
    : filter[styleName]

  if (args) {
    filterAssignment(this.container.filterNodes, filter, hertz)
    this.container.filterStyleName = styleName
  }
}

// get sound visualization data
function getVisualizerData () {
  const analyser = this.container.analyser
  if (!analyser) return []

  const array = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(array)

  return array
}

// return promise
function destroyInstance () {
  return this.AudioContext.close()
}

function callHooks (name, ...target) {
  this.hooks[name].apply(this, target)
}