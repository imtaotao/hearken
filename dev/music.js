import Hearken from '../src'
import ajax from './xhr'

export default function dealWithMusic (arrayBuffer) {
  const hearken = new Hearken({
    source: arrayBuffer,
    volume: 0.5,
    hertz: 'default',
    filter: 'default',
    loop: true,
  })

  window.h = hearken
  hearken.hooks.playEnd = function (e) {
    console.log(e);
  }
  return hearken
}

export function testAjax () {
  ajax('http://localhost:3000/getParticalMusic?name=永夜', callback, false)
}
let i = 0
function callback (error, result, continueFun) {
  if (error) {
    console.error(error)
    return
  }
  
  continueFun()
  console.log(result.response);
  if (i === 0) {
    console.log(12);
    // dealWithMusic(result.response).play()
  }
  i++
}