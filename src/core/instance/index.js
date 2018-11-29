import setHooks from './hooks'
import setAudioTool from './tool'
import createExportApi from './proto-api'
import audioControlHelper from './control'
import createRuntimeContainer from './container'

export default function createInstanceApi (Hearken) {
  const proto = Hearken.prototype

  setHooks(proto)
  setAudioTool(proto)
  createExportApi(proto)
  audioControlHelper(proto)
  createRuntimeContainer(proto)
}