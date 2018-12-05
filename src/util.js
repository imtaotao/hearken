export const isType = (v, type) => {
  return Object.prototype.toString.call(v) === `[object ${type}]`
}

export const isUndef = v => v === undefined || v === null

export const isNumber = v => isType(v, 'Number') && !isNaN(v)

export const isArrayBuffer = v => isType(v, 'ArrayBuffer')

export const isAudioBuffer = v => isType(v, 'AudioBuffer')

export function random (max = 1000000, min = 0, fractionDigits = 0) {
  return +(Math.random() * (max - min) + min).toFixed(fractionDigits)
}

export function bind (fun, ctx) {
  function boundFun (a) {
    const l = arguments.length
    return l
      ? l > 1
        ? fun.apply(ctx, arguments)
        : fun.call(ctx, a)
      : fun.call(ctx)
  }

  boundFun._length = fun.length
  return boundFun
}

export function once (fun) {
  let called = false
  return function () {
    if (!called) {
      called = true
      return fun.apply(this, arguments)
    }
  }
}

export function inlineWorker (fun) {
  const functionBody = fun.toString().trim().match(/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/)[1]
  const url = window.URL.createObjectURL(new window.Blob([functionBody], {
    type: 'text/javascript',
  }))
  return new window.Worker(url)
}