import setHooks from './life'
import setAudioTool from './nodes'
import createExportApi from './prototype'
import audioControlHelper from './control'
import createRuntimeContainer from './container'

export default function createInstanceApi (Hearken) {
  const parentObject = {}

  setHooks(Hearken.prototype)
  createExportApi(Hearken.prototype)
  
  // tool class
  setAudioTool(parentObject)
  audioControlHelper(parentObject)
  createRuntimeContainer(parentObject)
  
  parentObject.$callHooks = function callHooks (name, ...target) {
    if (typeof this.life[name] === 'function') {
      this.life[name].apply(this, target)
    }
  }

  Object.setPrototypeOf(Hearken.prototype, parentObject)
}