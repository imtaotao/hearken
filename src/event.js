export default class Event {
  constructor() {
    this._listener = Object.create(null)
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
    if (this._listener[event]) {
      if (typeof fn === 'function') {
        const remove = name => {
          const array = this._listener[event][name]
          const index = array.indexOf(fn)
          ~index && array.splice(index, 1)
        }
        remove('once')
        remove('normal')
        return true
      }

      if (fn === undefined) {
        this._listener[event].once = []
        this._listener[event].normal = []
        return true
      }
    }
    return false
  }

  offAll () {
    this._listener = Object.create(null)
  }

  dispatch (event, data) {
    if (this._listener[event]) {
      this._listener[event].once.forEach(fn => fn(data))
      this._listener[event].once = []
      this._listener[event].normal.forEach(fn => fn(data))
      return true
    }
    return false
  }
}

function getEventFnQueue (Event_, event) {
  if (!Event_._listener[event]) {
    Event_._listener[event] = {
      normal: [],
      once: [],
    }
  }
  return Event_._listener[event]
}