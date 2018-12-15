/**
 * 音频资源：source
 * 模式：mode -> partical | complete
 * 音量大小： 0 - 1
 * 是否循环： loop -> boolean
 * 傅里叶变换参数： fftSize -> number
 * 赫兹：hertz -> array
 * 均衡器： filter -> {string: number[]}
 **/
import {
  RATE,
  VOLUME,
  FFTSIZE,
  DEFAULTHZ,
  DEFAULTFILTER,
} from './default'

export const isType = (v, type) => {
  return Object.prototype.toString.call(v) === `[object ${type}]`
}

export const isUndef = v => v === undefined || v === null

export const isNumber = v => isType(v, 'Number') && !isNaN(v)

export const isArrayBuffer = v => isType(v, 'ArrayBuffer')

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

export function getLegalDuration (max, rate, duration) {
  if (!duration) return duration
  duration =  Math.max(Math.min(duration, max), 0)
  return rate
    ? duration / rate
    : duration
}

export function filterOptions (options) {
  const loop = !!options.loop
  const mute = !!options.mute
  const rate = options.rate  || RATE
  const volume = options.volume || VOLUME

  const mime = typeof options.mime === 'string'
    ? options.mime
    : null

  const hertz = Array.isArray(options.hertz)
    ? options.hertz
    : options.hertz === 'default'
      ? DEFAULTHZ
      : null
  
  const filter = Array.isArray(options.filter)
    ? options.filter
    : options.filter === 'default'
      ? DEFAULTFILTER
      : null

  let fftSize = options.fftSize || FFTSIZE
  fftSize > 16
    ? FFTSIZE
    : fftSize

  return { mute, rate, mime, loop, hertz, volume, filter, fftSize }
}