import Hearken from '../src'

export default function dealWithMusic (arrayBuffer) {
  const hearken = new Hearken({
    source: arrayBuffer,
    volume: 0.5,
    hertz: 'default',
    filter: 'default',
    loop: false,
  })

  window.h = hearken
  hearken.hooks.playEnd = function (e) {
    console.log(e);
  }
  return hearken
}