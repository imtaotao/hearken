import { disconnectNodes } from './util'
import { isObject, isNumber } from '../share'

const INIT = () => {}

// this class is responsible for filter
export default class Filter {
  constructor (SoundInstance) {
    this.zoom = 1.5
    
    // passFilter is "lowpass" or "highpass", the value have "type"、"hz" 、"peak"、 and "node"
    this.passFilter = null
    this.filterStyle = null

    this.Sound = SoundInstance

    this.hertz = null
    this.styles = null
    this.filterNodes = Object.create(null)
  }

  get AudioCtx () {
    return this.Sound.AudioCtx
  }

  get passFilterNode () {
    return this.Sound.nodes && this.Sound.nodes.passFilterNode
  }

  isExist () {
    return !!(this.hertz && this.styles)
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
    const { Sound, filterNodes } = this
    if (!Object.keys(filterNodes).length) {
      disconnectNodes(Sound)
      Sound.connectNodes()
    }
    
    this.passFilter = null
    this.filterStyle = null

    const nowFilter = this.filterNodes[hz]
    // if no filter node, now representatives of the voice does not play
    if (nowFilter) {
      nowFilter.gain.setValueAtTime(val, this.AudioCtx.currentTime)
    }
  }

  setStyle (styleName) {
    if (styleName !== this.filterStyle) {
      styleName = styleName || this.filterStyle

      if (styleName) {
        this.filterStyle = styleName
        const { styles, Sound, filterNodes } = this
  
        if (this.isExist()) {
          // if set init style, Judging the INIT function is fine
          const data = styleName === INIT
            ? INIT
            : styles[styleName]

          if (data) {
            // if filterNodes length is 0, the sound maybe playing, maybe stoped,
            // we need create new filter nodes
            if (!Object.keys(filterNodes).length) {
              disconnectNodes(Sound)
              Sound.connectNodes()
            }
  
            // If length is still 0 after creating a new node, it is stoped
            if (Object.keys(filterNodes).length) {
              filterAssignment(this, data)
            }
  
            this.passFilter = null
            this.filterStyle = styleName
          }
        }
      }
    }
  }

  // type: "lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"
  // default is "peaking"
  setType (type) {
    if (type && typeof type === 'string') {
      let keys = Object.keys(this.filterNodes)

      if (!keys.length) {
        disconnectNodes(this.Sound)
        this.Sound.connectNodes()
        keys = Object.keys(this.filterNodes)
      }

      // If length is still 0 after creating a new node, it is stoped
      if (!keys.length) return

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