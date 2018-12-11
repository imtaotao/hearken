import Hearken from '../refactor'
import ajax from './xhr'

let h

export default function Partical (props) {
  props.play = play
  props.stop = stop
  props.start = start
  props.pause = pause
  props.getMusic = getMusic

  return (
    `<div>
      <input value="永夜" id="musicName"/>
      <button @click="play">播放</button>
      <button @click="pause">暂停</button>
      <button @click="start">开始</button>
      <button @click="stop">停止</button>
      <button @click="getMusic">getMusic</button>
      <audio controls="true"></audio>
    </div>`
  )
}

function play () {

}

function stop () {

}

function start () {

}

function pause () {

}

let i = 0
// function getMusic () {
//   ajax('http://localhost:3000/getParticalMusic?name=永夜', (error, result, continueFun) => {
//     if (error) {
//       console.log(error)
//       return
//     }

//     const value = result.response

//     if (i === 0) {
//       window.h = h = new Hearken({
//         mode: 'partical',
//         loop: true,
//         source: value,
//         filter: 'default',
//         hertz: 'default',
//         mime: 'audio/mpeg',
//       })

//       h.start()
//     }

//     i++
//   }, false)
// }

function getMusic () {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', 'http://localhost:3000/getMusic?name=毒苹果')
  xhr.onload = e => {
    const buffer = e.target.response

    window.h = h = new Hearken({
      mode: 'partical',
      loop: true,
      source: buffer,
      filter: 'default',
      hertz: 'default',
      mime: 'audio/mpeg',
    })
    h.start()
  }
  xhr.withCredentials = true
  xhr.responseType = 'arraybuffer'
  xhr.send()
}