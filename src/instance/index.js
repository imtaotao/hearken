import setHooks from './hooks'
import setAudioTool from './audio-tool'
import setDecodeMethod from '../helper/decode'
import audioControlHelper from './audio-control'
import createRuntimeContainer from './runtime-container'

export default function createInstanceApi (Hearken) {
  const proto = Hearken.prototype

  setHooks(proto)
  setAudioTool(proto)
  setDecodeMethod(proto)
  audioControlHelper(proto)
  createRuntimeContainer(proto)

  // progress control
  proto.stop = stop
  proto.play = play
  proto.start = start
  proto.pause = pause

  proto.destroyInstance = destroyInstance
}

function start () {

}

function stop () {

}

function play () {

}

function pause () {

}

function destroyInstance (cb) {
  this.AudioContext.close()
  typeof cb === 'function' && cb()
}