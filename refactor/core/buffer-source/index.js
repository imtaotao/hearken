import { random } from '../../util'
import { startCore, playOrPause } from './operate'

export default class BufferSource {
  constructor (Hearken) {
    this.Hearken = Hearken
  }

  start (time, duration) {
    const Hearken = this.Hearken

    // we can't allow mutilple sound play, so, we need stop previous sound
    if (Hearken.$Container.bufferSource) {
      this.stop()
    }

    Hearken.$resetContainer()
    
    if (!Hearken.$Container.audioBuffer) {
      const source= Hearken.$options.source
      Hearken.$audioCtx.decodeAudioData(source, audioBuffer => {
        Hearken.$Container.audioBuffer = audioBuffer
        startCore(Hearken, time, duration)
      })
    } else {
      startCore(Hearken, time, duration)
    }
  }

  stop () {
    const Hearken = this.Hearken
    const bufferSource = Hearken.$Container.nodes.bufferSource
    const stopMusic = bufferSource.stop
      ? bufferSource.stop
      : bufferSource.noteOff

    stopMusic.call(bufferSource)
    Hearken.$callHooks('stop')
  }

  // return promise, if state aleady running, will get false
  play () {
    return playOrPause(this.Hearken, 'play')
  }

  pause () {
    return playOrPause(this.Hearken, 'pause')
  }

  getDuration () {
    const audioBuffer = this.Hearken.$Container.audioBuffer
    return audioBuffer
      ? audioBuffer.duration
      : null
  }

  setVolume (volume) {
    const gainNode = this.Hearken.$Container.nodes.gainNode

    if (gainNode) {
      this.Hearken.$options.volume = volume
      gainNode.gain.value = volume * volume
    } else {
      throw new Error('audioContext gainNode is null, you can\'t set volume.')
    }
  }

  // this method is able to toggle audio source, return promoise
  replaceSound (buffer) {
    // buffer should be an arraybuffer
    return this.tool.decode(buffer).then(audioBuffer => {
      this.id = random()
      this.$options.source = buffer
      this.container.audioBuffer = audioBuffer
    })
  }
}