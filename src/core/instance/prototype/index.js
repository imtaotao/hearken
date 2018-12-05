import { play, stop, start, pause } from './play'
import { setVolume, setFilterStyle, replaceSound } from './set'
import { callHooks, appendBuffer, destroyInstance } from './util'
import { getState, getCurrentTime, getVisualizerData } from './get'

export default function createExportApi (HearkenProto) {
  // play functions
  HearkenProto.play = play
  HearkenProto.stop = stop
  HearkenProto.start = start
  HearkenProto.pause = pause

  // get functions
  HearkenProto.getState = getState
  HearkenProto.getCurrentTime = getCurrentTime
  HearkenProto.getVisualizerData = getVisualizerData

  // set functions
  HearkenProto.setVolume = setVolume
  HearkenProto.setFilterStyle = setFilterStyle
  HearkenProto.replaceSound = replaceSound

  // util functions
  HearkenProto.destroy = destroyInstance
  HearkenProto.$callHooks = callHooks
  HearkenProto.appendBuffer = appendBuffer
}