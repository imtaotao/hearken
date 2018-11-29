/**
 * 音频资源：source
 * 模式：mode -> partical | complete
 * 音量大小： 0 - 1
 * 是否循环： loop -> boolean
 * 傅里叶变换参数： fftSize -> number
 * 赫兹：hertz -> array
 * 均衡器： filter -> {string: number[]}
 **/
import { isUndef, isArrayBuffer, isAudioBuffer } from '../../util'


export const PARTICAL = 'partical'
export const COMPLETE = 'complete'
const VOLUME = 0.5
const FFTSIZE = 16

const FilterAndHertz = v => Array.isArray(v) || v === 'default'

export default function filterOptions (options) {
  const source = options.source
  const mode = options.mode || COMPLETE
  const volume = options.volume || VOLUME
  const loop = !!options.loop

  const hertz = FilterAndHertz(options.hertz)
    ? options.hertz
    : null
  
  const filter = FilterAndHertz(options.filter)
    ? options.filter
    : null

  let fftSize = options.fftSize || FFTSIZE
  fftSize > 16
    ? FFTSIZE
    : fftSize
  
  maybeWarn(source)
  return { source, mode, hertz, filter, fftSize, volume, loop }
}

function maybeWarn (source) {
  if (isUndef(source)) {
    throw new Error('Audio source is ' + typeof source)
  }
  if (!isArrayBuffer(source) && !isAudioBuffer(source)) {
    throw new Error('Audio source must be a "arraybuffer" or "audiobuffer"')
  }
}