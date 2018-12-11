import createConstructorApi from './core/ctor'
import createInstanceApi from './core/instance'
import filterOptions, { COMPLETE } from './core/helper/filter-options'
import { random } from './util'

export default function Hearken (options = {}) {
  this.id = random()
  this.options = filterOptions(options)
  this.AudioContext = Hearken.AudioContext

  if (this.options.mode === COMPLETE) {
    this.container.bufferQueue = [options.source]
  }

  // inject Hearken to every widget
  this.tool.Hearken = this
  this.life.Hearken = this
  this.container.Hearken = this
  this.controlHelp.Hearken = this

  // if the first play, we need to call start method play sound, until call stop method
  this.canCallStart = true
  this.soundPlayEnd = true
}

createInstanceApi(Hearken)
createConstructorApi(Hearken)