import createConstructorApi from './core/ctor'
import createInstanceApi from './core/instance'
import filterOptions from './core/helper/filter-options'

export default function Hearken (options = {}) {
  this.options = filterOptions(options)
  this.AudioContext = Hearken.AudioContext
  // inject Hearken to every widget
  this.tool.Hearken = this
  this.hooks.Hearken = this
  this.controlHelp.Hearken = this
}

createInstanceApi(Hearken)
createConstructorApi(Hearken)