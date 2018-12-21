export default class Queue {
 constructor () {
    this.fx = []
    // the init is the first call flag
    this.init = true
    this.lock = false
  }

  register (fn) {
    if (typeof fn === 'function') {
      this.fx.push(fn)

      if (this.init) {
        this.lock = false
        this.init = false
        this.dispatch()
      }
    }
  }

  dispatch (data) {
    if (!this.lock) {
      if (this.fx.length === 0) {
        if (typeof this.end === 'function') {
          this.end(data)
        }
        this.init = true
      }
  
      const fn = this.fx.shift()
  
      if (typeof fn === 'function') {
        const next = data => {
          this.lock = false
          // call next fn
          this.dispatch(data)
        }
        // call fn, we need lock
        this.lock = true
        fn.call(null, next, data)
      }
    }
  }

  remove (start, end = 1) {
    this.fx.splice(start, end)
  }

  clean () {
    this.fx = []
    this.init = true
    this.lock = false
  }
}