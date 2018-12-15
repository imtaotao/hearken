import Hearken from '../src'
import ajax from './xhr'

let h

export default function Partical (props) {
  props.play = play
  props.stop = stop
  props.start = start
  props.pause = pause
  props.getMusic = getMusic
  props.change = change

  return (
    `<div>
      <input value="永夜" id="musicName"/>
      <button @click="play">播放</button>
      <button @click="pause">暂停</button>
      <button @click="start">开始</button>
      <button @click="stop">停止</button>
      <button @click="getMusic">getMusic</button>
      <audio controls="true"></audio>
      <input type=range value='0' id="one" />
      <input type=range value='50' id="two" @input=change />
    </div>`
  )
}

function change (e) {
  const val = e.target.value - 50
  // window.aa.nodes.panner.positionX.value = val / 100
  window.aa.panner.setChannel(val / 10)
}

function play () {
  window.h.play()
}

function stop () {
  window.h.children[0].stop()
}

function start () {
  window.h.children[0].start(2)
}

function pause () {
  window.h.pause()
}

// let i = 0
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

window.h = h = new Hearken({
  loop: true,
  filter: 'default',
  hertz: 'default',
  mime: 'audio/mpeg',
  volume: 2,
})

var i = 0
var instance
function getMusic () {
  let name = '毒苹果'
  let id = 'one'
  let start = 20
  if (i % 2 === 0) {
  //   id = 'two'
  //   start = 20
    name = 'airplanes'
  }
  const xhr = new XMLHttpRequest()
  xhr.open('GET', 'http://localhost:3000/getMusic?name=' + name)
  xhr.onload = e => {
    const buffer = e.target.response
    if (instance) {
      instance.replaceBuffer(buffer)
    } else {
      instance = h.create(buffer)
    }
    const node = document.getElementById(id)
    h.ready().then(() => {
      instance.fadeStart(3, start)
      window.aa = instance
      instance.setRate(1.5)
      toogle(instance)
      setInterval(() => {
        const time = instance.getCurrentTime()
        const p = time / instance.getDuration() * instance.options.rate
        node.value = p * 100 
        // console.log(p); 
      }, 500)
    })
  }
  xhr.withCredentials = true
  xhr.responseType = 'arraybuffer'
  xhr.send()
  i++
}

let val = 1
function toogle (h) {
  h.panner.setChannel(val)
  val = -val
  setTimeout(() => toogle(h), 5000)
}