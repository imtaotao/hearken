import { COMPLETE } from '../../helper/filter-options'
import { random, isNumber, isArrayBuffer } from '../../../util'
import { filterAssignment, getDefualtFilterArgs } from './util'

// set sound volume
export function setVolume (precent) {
  const volume = precent && isNumber(precent)
    ? precent
    : this.options.volume
  
  if (this.container.gainNode) {
    this.container.gainNode.gain.value = volume * volume
    this.options.volume = volume
  } else {
    throw new Error('audioContext gainNode is null, you can\'t set volume.')
  }
}

// if have the filter, we can set the filter style
export function setFilterStyle (styleName) {
  const { hertz, filter } = this.options
  if (!filter || !hertz) return
  
  const args = filter === 'default'
    ? getDefualtFilterArgs(styleName)
    : filter[styleName]

  if (args) {
    filterAssignment(this.container.filterNodes, filter, hertz)
    this.container.filterStyleName = styleName
  }
}

// this method is able to toggle audio source, return promoise
export function replaceSound (buffer) {
  if (!isArrayBuffer(buffer)) {
    throw new Error('buffer is must be an "arrayBuffer".')
  }
  // buffer should be an arraybuffer
  return this.tool.decode(buffer).then(audioBuffer => {
    this.id = random()
    this.options.source = buffer
    this.container.audioBuffer = audioBuffer
    if (this.options.mode === COMPLETE) {
      this.container.bufferQueue = [buffer]
    }
  })
}