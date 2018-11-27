import { isArrayBuffer } from '../util'

export default function setDecodeMethod (obj) {
  obj.decode = decode
  obj.nodeEnvDecode = nodeEnvDecode
}

function decode (arraybuffer) {
  if (!isArrayBuffer) {
    throw new Error('decode source must be a "arraybuffer, but now it\'s a' + typeof arraybuffer)
  }

  return new Promise(resolve => {
    this.audioContext.decodeAudioData(arraybuffer, buffer => {
      resolve(buffer)
    })
  })
}

function nodeEnvDecode () {

}