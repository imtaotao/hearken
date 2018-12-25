import PitchShifter from '../src/voice-changer'
import { get } from '../test/xhr'

let pitchRatio = 1.0
let overlapRatio = 0.50

export default function Root (props) {
  // props.play = play
  // props.stop = stop
  props.start = start
  // props.pause = pause
  // props.getMusic = getMusic
  props.change = change

  return (
    `<div>
      变声器
      <input type="range" id="pitch" @change=change value='50' />
      <button @click="start">开始</button>
    </div>`
  )
}

const ctx = new AudioContext()

const progressNode = ctx.createScriptProcessor(grainSize, 1, 1)
const buffersouce = ctx.createBufferSource()

function start () {
  init()
}

function change (e) {
  pitchRatio = e.value / 100 * 2
}


// ------------------------------------------

// buffersouce node connect to pitchShifterProcessor
// pitchShifterProcessor connect to destination
const validGranSizes = [256, 512, 1024, 2048, 4096, 8192]
let grainSize = validGranSizes[1]


function hannWindow (length) {
  const window = new Float32Array(length)
  for (var i = 0; i < length; i++) {
    window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)))
  }
  return window
}

function linearInterpolation (a, b, t) {
  return a + (b - a) * t
}

function init () {
  get('http://localhost:3000/getMusic?name=毒苹果', result => {
    ctx.decodeAudioData(result, audiobuffer => {
      buffersouce.buffer = audiobuffer
      buffersouce.loop = true
      buffersouce.connect(progressNode)
      progressNode.connect(ctx.destination)
      buffersouce.start(0)
    })
  })
}

let a = 0
progressNode.buffer = new Float32Array(grainSize * 2)
progressNode.grainWindow = hannWindow(grainSize)
progressNode.onaudioprocess = function(event) {
  console.log(event);
  var inputData = event.inputBuffer.getChannelData(0);
  var outputData = event.outputBuffer.getChannelData(0);

  for (i = 0; i < inputData.length; i++) {

      // Apply the window to the input buffer
      inputData[i] *= this.grainWindow[i];

      // Shift half of the buffer
      this.buffer[i] = this.buffer[i + grainSize];

      // Empty the buffer tail
      this.buffer[i + grainSize] = 0.0;
  }

  // Calculate the pitch shifted grain re-sampling and looping the input
  var grainData = new Float32Array(grainSize * 2);
  for (var i = 0, j = 0.0;
        i < grainSize;
        i++, j += pitchRatio) {

      var index = Math.floor(j) % grainSize;
      var a = inputData[index];
      var b = inputData[(index + 1) % grainSize];
      grainData[i] += linearInterpolation(a, b, j % 1.0) * this.grainWindow[i];
  }

  // Copy the grain multiple times overlapping it
  for (i = 0; i < grainSize; i += Math.round(grainSize * (1 - overlapRatio))) {
      for (j = 0; j <= grainSize; j++) {
          this.buffer[i + j] += grainData[j];
      }
  }

  // Output the first half of the buffer
  for (i = 0; i < grainSize; i++) {
      outputData[i] = this.buffer[i];
  }
}