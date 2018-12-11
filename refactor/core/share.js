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
  VOLUME,
  FFTSIZE,
  COMPLETE,
  PARTICAL,
  DEFAULTHZ,
  DEFAULTFILTER,
} from './default'
import { isUndef, isArrayBuffer } from '../util'

export function filterOptions (options) {
  const source = options.source
  const mode = options.mode || COMPLETE
  const volume = options.volume || VOLUME
  const loop = !!options.loop

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
  
  maybeWarn(mode, mime, source)

  return { mode, mime, loop, hertz, volume, source, filter, fftSize }
}

function maybeWarn (mode, mime, source) {
  if (mode === PARTICAL) {
    if (!mime) {
      throw new Error('Partical mode must be have a MIME type')
    }

    if (!MediaSource.isTypeSupported(mime)) {
      throw new Error('Unsupported MIME type: ', mime)
    }
  }

  if (isUndef(source)) {
    throw new Error('Audio source is ', typeof source)
  }
  if (!isArrayBuffer(source)) {
    throw new Error('Audio source must be a "arraybuffer".')
  }
}