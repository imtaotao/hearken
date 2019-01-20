import {
  RATE,
  DELAY,
  VOLUME,
  FFTSIZE,
} from './default'

export const isType = (v, type) => Object.prototype.toString.call(v) === `[object ${type}]`

export const isUndef = v => v === undefined || v === null

export const isNumber = v => typeof v === 'number' && !isNaN(v)

export const isObject = v => v && typeof v === 'object'

export const isArrayBuffer = v => isType(v, 'ArrayBuffer')

export const isAudioBuffer = v => isType(v, 'AudioBuffer')

export const range = (min, max, val) => Math.max(Math.min(val, max), min)

export function random (max = 1000000, min = 0, fractionDigits = 0) {
  return +(Math.random() * (max - min) + min).toFixed(fractionDigits)
}

export function once (fn) {
  let called = false
  return function () {
    if (!called) {
      called = true
      return fn.apply(this, arguments)
    }
  }
}

export function each (obj, cb) {
  const keys = Object.keys(obj)
  if (keys.length === 0) return

  for (let i = 0, len = keys.length; i < len; i++) {
    cb(obj[keys[i]], keys[i])
  }
}

export function createAudioContext (Constructor) {
  if (!Constructor.AudioCtx) {
    Constructor.AudioCtx = new (
      window.AudioContext ||
      window.webkitAudioContext ||
      window.mozAudioContext ||
      window.msAudioContext
    )
  }
  return Constructor.AudioCtx
}

export function ready (Instance, cb) {
  if (typeof cb === 'function') {
    Instance.AudioCtx.state === 'running'
      ? Promise.resolve().then(() => cb(Instance))
      : Instance.AudioCtx.resume().then(() => cb(Instance))
  }
}

export function filterOptions (options) {
  // boolean
  const loop = !!options.loop
  const mute = !!options.mute

  // number
  const delay = isNumber(options.delay)
    ? options.delay
    : DELAY
  const rate = isNumber(options.rate)
    ? options.rate 
    : RATE
  const volume = isNumber(options.volume)
    ? options.volume
    : VOLUME
  let fftSize = isNumber(options.fftSize)
    ? options.fftSize
    : FFTSIZE

  fftSize < 16
    ? FFTSIZE
    : fftSize

  // string
  const mime = typeof options.mime === 'string'
    ? options.mime
    : null

  return { mute, rate, mime, delay, loop, volume, fftSize }
}