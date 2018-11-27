/**
 * 音频资源：source
 * 模式：mode -> partical | complete
 * 音量大小： 0 - 1
 * 是否循环： loop -> boolean
 * 傅里叶变换参数： fftSize -> number
 **/
import { isUndef, isArrayBuffer, isAudioBuffer } from '../util'


export const PARTICAL = 'partical'
export const COMPLETE = 'complete'
const VOLUME = 0.5
const FFTSIZE = 16
const HERTZ = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

export default function filterOptions (options) {
  const source = options.source
  const mode = options.mode || COMPLETE
  const volume = options.volume || VOLUME
  const loop = isUndef(options.loop)
    ? false 
    : true

  let fftSize = options.fftSize || FFTSIZE
  fftSize > 16
    ? FFTSIZE
    : fftSize

  let hertz = options.hertz === 'default'
    ? HERTZ
    : options.hertz

  // maybeWarn(source)
  return { source, mode, hertz, fftSize, volume, loop }
}

function maybeWarn (source) {
  if (isUndef(source)) {
    throw new Error('Audio source is ' + typeof source)
  }
  if (!isArrayBuffer(source) && !isAudioBuffer(source)) {
    throw new Error('Audio source must be a "arraybuffer" or "audiobuffer"')
  }
}