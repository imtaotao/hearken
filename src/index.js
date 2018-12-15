import Hearken from './core'

Hearken.AudioContext = createAudioContext()

function createAudioContext () {
  return new (
    window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.msAudioContext
  )	
}

export default Hearken