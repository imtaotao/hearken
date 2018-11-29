import version from './version'

export default function createConstructorApi (Hearken) {
  Hearken.version = version
  // AudioContext is only
  Hearken.AudioContext = createAudioContext()
}

function createAudioContext () {
  return new (
    window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.msAudioContext
  )	
}