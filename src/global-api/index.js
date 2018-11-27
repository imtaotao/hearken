import version from './version'
import setDecodeMethod from '../helper/decode'

export default function createGlobalApi (Hearken) {
  Hearken.version = version
  // AudioContext is only
  Hearken.AudioContext = createAudioContext()
  setDecodeMethod(Hearken)
}

function createAudioContext () {
  return new (
    window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.msAudioContext
  )	
}