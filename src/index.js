import filterOptions from './helper/filter-options'
import createGlobalApi from './global-api'
import createInstanceApi from './instance'

export default function Hearken (options = {}) {
  this.options = filterOptions(options)
  this.AudioContext = Hearken.AudioContext
  // inject Hearken to every widget
  this.tool.Hearken = this
  this.hooks.Hearken = this
  this.controlHelp.Hearken = this
}

createGlobalApi(Hearken)
createInstanceApi(Hearken)