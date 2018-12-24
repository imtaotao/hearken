import PitchShifter from '../src/voice-changer'
import { get } from '../test/xhr'

export default function Root (props) {
  props.play = play
  props.stop = stop
  props.start = start
  props.pause = pause
  props.getMusic = getMusic
  props.change = change

  return (
    `<div>
      变声器
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


function start () {

}

function stop () {

}

function play () {

}

function pause () {

}

function getMusic () {
  window.h = new PitchShifter()
  window.h.init()
}

function change () {

}

