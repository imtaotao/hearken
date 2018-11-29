import { filterAssignment, getDefualtFilterArgs } from './util'

// set sound volume
export function setVolume (precent) {
  const volume = precent && isNumber(precent)
    ? precent
    : this.options.volume
  
  if (this.container.gainNode) {
    this.container.gainNode.gain.value = volume * volume
  } else {
    throw new Error('audioContext gainNode is null')
  }
}

// if have the filter, we can set the filter style
export function setFilterStyle (styleName) {
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