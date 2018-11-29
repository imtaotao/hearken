import { isArrayBuffer } from '../../../util'
import { acceptBuffer } from '../../helper/append-buffer'

export function soundPlayEnded (Hearken, event) {
  Hearken.$callHooks('playEnd', event)
}

export function callHooks (name, ...target) {
  this.hooks[name].apply(this, target)
}

export function getDefualtFilterArgs (styleName) {
  switch (styleName) {
    case 'init' :
      return [0, 0, 0, 0,  0, 0, 0, 0, 0, 0]
    case 'jazz' :
      return [0, 0, 0, 5, 5, 5, 0, 3, 4, 5]
    case 'blues' :
      return [3, 6, 8, 3, -2, 0, 4, 7, 9, 10]
    case 'rural' :
      return [5, 6, 2, -5, 1, 1, -5, 3, 8, 5]
    case 'dance' :
      return [7, 6, 3, 0, 0, -4, -6, -6, 0, 0]
    case 'popular' :
      return [4, 2, 0, -3, -6, -6, -3, 0, 1, 3]
    case 'rocking' :
      return [7, 4, -4, 7, -2, 1, 5, 7, 9, 9]
    case 'slowSong' :
      return [5, 4, 2, 0, -2, 0, 3, 6, 7, 8]
    case 'classical' :
      return [0, 0, 0, 0, 0, 0, -6, -6, -6, -8]
    case 'electronicMusic' :
      return [6, 5, 0, -5, -4, 0, 6, 8, 8, 7]
  }
}

export function filterAssignment (filter, data, hertz) {
  for (let i = 0, len = hertz.length; i < len; i++) {
    const hz = hertz[i]
    const val = data[i]
    const nowFilter = filter[hz]

    if (nowFilter) {
      nowFilter.gain.value = val * 1.5
    }
  }
}

/**
 * the following apis are exposed to the outside
 * */

// return promise
export function destroyInstance () {
  return this.AudioContext.close()
}

export function appendBuffer (arrayBuffer) {
  if (isArrayBuffer(arrayBuffer)) {
    acceptBuffer(this, arrayBuffer)
  }
}