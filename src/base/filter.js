import { isObject, isNumber } from '../share'
import { DEFAULTHZ, DEFAULTFILTER } from '../default'

const INIT = () => {}

function filterAssignment (Instance, data) {
  const { zoom, hertz, AudioCtx, filterNodes } = Instance
  const getVal = i => data === INIT ? 0 : data[i]

  for (let i = 0, len = hertz.length; i < len; i++) {
    const hz = hertz[i]
    const filterNode = filterNodes[hz]

    if (filterNode) {
      const val = getVal(i) * (zoom || 1)

      filterNode.Q.value = 1
      filterNode.type = 'peaking'
      filterNode.frequency.value = hz
      filterNode.gain.setValueAtTime(val , AudioCtx.currentTime)
    }
  }
}

function setHighOrLowPassFilter (Instance, type, hz, peak) {
  let { passFilter, passFilterNode } = Instance
  
  if (passFilterNode) {
    if (passFilter) {
      hz = isNumber(hz) ? hz : passFilter.hz
      peak = isNumber(peak) ? peak : passFilter.peak
    } else {
      hz = isNumber(hz) ? hz : null
      peak = isNumber(peak) ? peak : null
    }

    passFilterNode.type = type
    peak && (passFilterNode.Q.value = peak)
    hz && (passFilterNode.frequency.value = hz)

    // reset pass filter
    passFilter = passFilter || {}
    passFilter.hz = hz
    passFilter.type = type
    passFilter.peak = peak
  }
}

// this class is responsible for filter
export default class Filter {
  constructor (SoundInstance, AudioCtx) {
    this.zoom = 1.5
    this.filterNodes = {}
    
    // passFilter is "lowpass" or "highpass", the value have "type"、"hz" 、"peak"、 and "node"
    this.passFilter = null
    this.filterStyle = null

    this.AudioCtx = AudioCtx
    this.Sound = SoundInstance

    // default style
    this.hertz = DEFAULTHZ
    this.styles = DEFAULTFILTER
  }

  get passFilterNode () {
    return this.Sound.nodes && this.Sound.nodes.passFilterNode
  }

  setHertz (hertz) {
    if (Array.isArray(hertz)) {
      this.hertz = hertz
    }
  }

  // we need check styles args
  setStyles (styles) {
    if (isObject(styles)) {
      this.styles = styles
    }
  }

  setFilter (hz, val) {
    const nowFilter = this.filterNodes[hz]
    if (nowFilter) {
      nowFilter.gain.setValueAtTime(val, this.AudioCtx.currentTime)
      this.passFilter = null
      this.filterStyle = null
    }
  }

  setStyle (styleName) {
    styleName = styleName || this.filterStyle
    
    if (styleName) {
      if (this.filterNodes && this.styles) {
        const data = styleName === INIT
          ? INIT
          : this.styles[styleName]

        if (data) {
          filterAssignment(this, data)
          this.passFilter = null
          this.filterStyle = styleName
        }
      }
    }
  }

  // type: "lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"
  // default is peaking
  setType (type) {
    if (type && typeof type === 'string') {
      const keys = Object.keys(this.filterNodes)
      for (let i = 0, len = keys.length; i < len; i++) {
        const node = this.filterNodes[keys[i]]
        node.type = type
      }
      this.passFilter = null
    }
  }

  setHighPassFilter (hz, peak) {
    return setHighOrLowPassFilter(this, 'highpass', hz, peak)
  }

  setLowPassFilter (hz, peak) {
    return setHighOrLowPassFilter(this, 'lowpass', hz, peak)
  }

  setDefaultPassFilter () {
    // pass filter node reset default param
    setHighOrLowPassFilter(this, 'peaking', 16000, 1)
  }

  setDefaultStyle () {
    this.setStyle(INIT)
  }

  setDefault () {
    // "defaultPassfilter" must be called first, because it will be emptied when calling "defaultStyle"
    this.setDefaultPassFilter()
    this.setDefaultStyle()
  }

  resumeState () {
    if (this.passFilter) {
      const { type, hz, peak } = this.passFilter
      type === 'highpass'
        ? this.setHighPassFilter(hz, peak)
        : this.setLowPassFilter(hz, peak)
    } else {
      this.setStyle()
    }
  }
}