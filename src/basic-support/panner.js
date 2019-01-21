import { isNumber } from '../share'

export default class Panner {
  constructor (SoundInstance) {
    this.Sound = SoundInstance
    // default args
    this.pannerPosition = {
      x: 0,
      y: 0,
      z: 0,
    }
    this.pannerOrientation = {
      x: 0,
      y: 0,
      z: 0,
    }
    this.listenerPosition = {
      x: 0,
      y: 0,
      z: 0,
    }
    this.listenerOrientation = {
      fx: 0,
      fy: 0,
      fz: -1,
      ux: 0,
      uy: 1,
      uz: 0,
    }
    this.coneAngle = {
      inner: 360,
      outer: 0,
    }
  }

  get AudioCtx () {
    return this.Sound.AudioCtx
  }

  get pannerNode () {
    return this.Sound.nodes && this.Sound.nodes.panner
  }

  setPosition (x, y, z) {
    const { pannerNode, AudioCtx, pannerPosition } = this

    x = dealWithArg(x, pannerPosition, 'x')
    y = dealWithArg(y, pannerPosition, 'y')
    z = dealWithArg(z, pannerPosition, 'z')

    if (pannerNode) {
      if (pannerNode.positionX) {
        pannerNode.positionX.setValueAtTime(x, AudioCtx.currentTime)
        pannerNode.positionY.setValueAtTime(y, AudioCtx.currentTime)
        pannerNode.positionZ.setValueAtTime(z, AudioCtx.currentTime)
      } else {
        pannerNode.setPosition(x, y, z)
      }
    }
  }

  setOrientation (x, y, z) {
    const { pannerNode, AudioCtx, pannerOrientation } = this

    x = dealWithArg(x, pannerOrientation, 'x')
    y = dealWithArg(y, pannerOrientation, 'y')
    z = dealWithArg(z, pannerOrientation, 'z')

    if (pannerNode) {
      if (pannerNode.orientationX) {
        pannerNode.orientationX.setValueAtTime(x, AudioCtx.currentTime)
        pannerNode.orientationY.setValueAtTime(y, AudioCtx.currentTime)
        pannerNode.orientationZ.setValueAtTime(z, AudioCtx.currentTime)
      } else {
        pannerNode.setOrientation(x, y, z)
      }
    }
  }

  setConeAngle (inner, outer) {
    const { pannerNode, coneAngle } = this

    inner = dealWithArg(inner, coneAngle, 'inner')
    outer = dealWithArg(inner, coneAngle, 'outer')

    if (pannerNode) {
      pannerNode.coneInnerAngle = inner
      pannerNode.coneOuterAngle = outer
    }
  }

  setListenerOrientation (fx, fy, fz, ux, uy, uz) {
    const AudioCtx = this.AudioCtx
    const listener = AudioCtx.listener
    const defaultArgs = this.listenerOrientation

    fx = dealWithArg(fx, defaultArgs, 'fx')
    fy = dealWithArg(fy, defaultArgs, 'fy')
    fz = dealWithArg(fz, defaultArgs, 'fz')
    ux = dealWithArg(ux, defaultArgs, 'ux')
    uy = dealWithArg(uy, defaultArgs, 'uy')
    uz = dealWithArg(uz, defaultArgs, 'uz')

    if(listener.forwardX) {
      listener.forwardX.setValueAtTime(fx, AudioCtx.currentTime)
      listener.forwardY.setValueAtTime(fy, AudioCtx.currentTime)
      listener.forwardZ.setValueAtTime(fz, AudioCtx.currentTime)
      listener.upX.setValueAtTime(ux, AudioCtx.currentTime)
      listener.upY.setValueAtTime(uy, AudioCtx.currentTime)
      listener.upZ.setValueAtTime(uz, AudioCtx.currentTime)
    } else {
      listener.setOrientation(fx, fy, fz, ux, uy, uz)
    }
  }

  setListenerPosition (x, y, z) {
    const AudioCtx = this.AudioCtx
    const listener = AudioCtx.listener
    const defaultArgs = this.listenerPosition

    x = dealWithArg(x, defaultArgs, 'x')
    y = dealWithArg(y, defaultArgs, 'y')
    z = dealWithArg(z, defaultArgs, 'z')

    if(listener.positionX) {
      listener.positionX.setValueAtTime(x, AudioCtx.currentTime)
      listener.positionY.setValueAtTime(y, AudioCtx.currentTime)
      listener.positionZ.setValueAtTime(z, AudioCtx.currentTime)
    } else {
      listener.setPosition(x, y, z)
    }
  }

  resumeState () {
    this.setPosition()
    this.setConeAngle()
    this.setOrientation()
    this.setListenerPosition()
    this.setListenerOrientation()
  }

  setDefault () {
    this.setPosition(0, 0, 0)
    this.setConeAngle(360, 0)
    this.setOrientation(0, 0, 0)
    this.setListenerPosition(0, 0, 0)
    this.setListenerOrientation(0, 0, -1, 0, 1, 0)
  }

  setChannel (val) {
    isNumber(val) && this.setPosition(val, 0, 0)
  }
}

function dealWithArg (arg, defaultArgs, name) {
  return isNumber(arg)
    ? defaultArgs[name] = arg
    : defaultArgs[name]
}