export const isUndef = v => v === undefined || v === null

export const isType = (v, type) => {
  Object.prototype.toString.call(v) === `[object ${type}]`
}

export const isArrayBuffer = v => isType(v, 'ArrayBuffer')

export const isAudioBuffer = v => isType(v, 'AudioBuffer')