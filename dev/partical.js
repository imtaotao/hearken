import Hearken from '../src'
import { get } from '../test/xhr'

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
      <input type=range value='50' id="two" @change=change />
    </div>`
  )
}

function change (e) {
  const val = e.target.value - 50
  window.aa.panner.setChannel(val / 10)
}

function play () {
  window.h.play()
}

function stop () {
  window.aa.stop()
}

function start () {
  window.aa.start()
}

function pause () {
  window.h.pause()
}

let h
let time
let i = 0
let val = 1
let instance

window.h = h = new Hearken({
  loop: true,
  filter: 'default',
  hertz: 'default',
  mime: 'audio/mpeg',
  volume: 0.5,
})

function toogle (h) {
  val = -val
  h.panner.setChannel(val)
  setTimeout(() => toogle(h), 5000)
}

function progress (instance) {
  if (time) return
  time = setInterval(() => {
    const node = document.getElementById('one')
    node.value = instance.getPercent() * 100
    // console.log(instance.getPercent());
  }, 20)
}

function getEffect (name) {
  get('http://localhost:3000/getMusic?name=convoler/' + name, buffer => {
    const instance = window.aa
    if (instance) {
      const style = name.split('.')[0]
      instance.convolver.appendBuffer(style, buffer).then(() => {
        instance.convolver.setStyle(style)
        console.log(style)
      })
    }
  })
}
window.getEffect = getEffect

function getMusic () {
  let name = 'airplanes'
  if (i % 2 === 0) name = '毒苹果'

  get('http://localhost:3000/getMusic?name=' + name, buffer => {
    instance
      ? instance.replaceBuffer(buffer)
      : instance = h.create(buffer)

    window.aa = instance
    // instance.setRate(1.5)
    // instance.setDelay(3)
    // getEffect('irHall.ogg')
    instance.on('startBefore', () => {
      instance.resumeState()
      // toogle(instance)
    })
    
    h.ready().then(() => {
      instance.fadeStart(3, 10, 10)
      progress(instance)
    })
  })
  i++
}

window.setf = function () {
  window.aa.filter.setHertz([31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000])
  window.aa.filter.setStyles({
    jazz: [0, 0, 0, 5, 5, 5, 0, 3, 4, 5],
    electron: [6, 5, 0, -5, -4, 0, 6, 8, 8, 7],
  })
  return window.aa.filter
}