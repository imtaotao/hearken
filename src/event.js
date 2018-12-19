export default class Event {
  constructor() {
    this.listener = {}
  }

  on (event, fn) {
    if (typeof fn === 'function') {
      const fnQueue = getEventFnQueue(this, event)
      fnQueue.normal.push(fn)
      return true
    }
    return false
  }

  once (event, fn) {
    if (typeof fn === 'function') {
      const fnQueue = getEventFnQueue(this, event)
      fnQueue.once.push(fn)
      return true
    }
    return false
  }

  off (event, fn) {
    if (this.listener[event]) {
      if (typeof fn === 'function') {
        const remove = name => {
          const array = this.listener[event][name]
          const index = array.indexOf(fn)
          ~index && array.splice(index, 1)
        }
        remove('once')
        remove('normal')
      } else {
        this.listener[event].once = []
        this.listener[event].normal = []
      }
      return true
    }
    return false
  }

  offAll () {
    this.listener = {}
  }

  dispatch (event, data) {
    if (this.listener[event]) {
      this.listener[event].once.forEach(each => each.call(null, data))
      this.listener[event].once = []
      this.listener[event].normal.forEach(each => each.call(null, data))
      return true
    }
    return false
  }
}

function getEventFnQueue (Event_, event) {
  if (!Event_.listener[event]) {
    Event_.listener[event] = {
      normal: [],
      once: [],
    }
  }
  return Event_.listener[event]
}