export const isType = (v, type) => {
  return Object.prototype.toString.call(v) === `[object ${type}]`
}

export const isUndef = v => v === undefined || v === null

export const isNumber = v => isType(v, 'Number') && !isNaN(v)

export const isArrayBuffer = v => isType(v, 'ArrayBuffer')

export const isAudioBuffer = v => isType(v, 'AudioBuffer')