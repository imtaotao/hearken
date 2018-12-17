import { isNumber } from '../share'

function getPannerNode (Instance, cb) {
  const nodes = Instance.Sound.nodes
  if (nodes && nodes.panner) {
    cb(nodes.panner, Instance.AudioCtx)
  }
}

function dealWithArg (arg, defaultArgs, name) {
  return isNumber(arg)
      ? defaultArgs[name] = arg
      : arg = defaultArgs[name]
}

export default class Panner {
  constructor (SoundInstance, AudioCtx) {
    this.Sound = SoundInstance
    this.AudioCtx = AudioCtx
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

  get pannerNode () {
    return this.Sound.nodes
      ? this.Sound.nodes.panner
      : null
  }

  setPosition (x, y, z) {
    const defaultArgs = this.pannerPosition

    x = dealWithArg(x, defaultArgs, 'x')
    y = dealWithArg(y, defaultArgs, 'y')
    z = dealWithArg(z, defaultArgs, 'z')

    getPannerNode(this, (panner, AudioCtx) => {
      if (panner.positionX) {
        panner.positionX.setValueAtTime(x, AudioCtx.currentTime)
        panner.positionY.setValueAtTime(y, AudioCtx.currentTime)
        panner.positionZ.setValueAtTime(z, AudioCtx.currentTime)
      } else {
        panner.setPosition(x, y, z)
      }
    })
  }

  setOrientation (x, y, z) {
    const defaultArgs = this.pannerOrientation

    x = dealWithArg(x, defaultArgs, 'x')
    y = dealWithArg(y, defaultArgs, 'y')
    z = dealWithArg(z, defaultArgs, 'z')

    getPannerNode(this, (panner, AudioCtx) => {
      if (panner.orientationX) {
        panner.orientationX.setValueAtTime(x, AudioCtx.currentTime)
        panner.orientationY.setValueAtTime(y, AudioCtx.currentTime)
        panner.orientationZ.setValueAtTime(z, AudioCtx.currentTime)
      } else {
        panner.setOrientation(x, y, z)
      }
    })
  }

  setConeAngle (inner, outer) {
    const defaultArgs = this.coneAngle

    inner = dealWithArg(inner, defaultArgs, 'inner')
    outer = dealWithArg(inner, defaultArgs, 'outer')

    getPannerNode(this, pannerNode => {
      pannerNode.coneInnerAngle = inner
      pannerNode.coneOuterAngle = outer
    })
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
    isNumber(val) && this.setPosition(val)
  }
}