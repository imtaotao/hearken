const EMPTY = () => {}

ajax._time = 500
ajax._repeatConnect = 10
ajax._partical = 1024 * 1024


export default function ajax (url, cb, auto, data) {
  // record success times and repeat connect times
  data = data || {
    total: null,
    errorIndex: 0,
    transmitted: 0,
    successIndex: 0,
    transferCompleted: false,
  }
  
  data.successIndex === 0
    ? getSourceInfor(url, cb, auto, data)
    : getSource(url, cb, auto, data)
}

// get source size
function getSourceInfor (url, cb, auto, data) {
  const xhr = new XMLHttpRequest()
  xhr.open('HEAD', url)
  xhr.withCredentials = true

  // set callback
  xhr.onload = e => {
    if (xhr.status !== 200 && xhr.status !== 204) {
      callFunc(cb, 'error', 'xhr status is not "204" or "200".')
      return
    }
    // get source size
    const total = getSourceSize(xhr)
    if (!total) {
      callFunc(cb, 'error', 'Can\'t get resource size.')
      return
    }
    data.total = total

    // continue get real source
    setTimeout(() => {
      data.successIndex++
      ajax(url, cb, auto, data)
    }, ajax._time)
  }
  xhr.onerror = e => errorCallback(url, e.target, data, auto, cb)
  xhr.send()
}

function getSource (url, cb, auto, data) {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.withCredentials = true
  xhr.responseType = 'arraybuffer'

  // set header
  const positions = getSourcePosition(data, cb)
  if (!positions || isNaN(positions.start) || isNaN(positions.end)) {
    callFunc(cb, 'error', 'Can\'t get resource range.')
    return
  }

  setHeader(xhr, positions.start, positions.end)
  
  // set callback
  xhr.onload = e => {
    if (xhr.status !== 200 && xhr.status !== 206) {
      callFunc(cb, 'error', 'xhr status is not "206" or "200".')
      return
    }

    data.transmitted = positions.end + 1
    sucessCallback(url, e.target, data, auto, cb)
  }
  xhr.onerror = e => errorCallback(url, e.target, data, auto, cb)
  xhr.send()
}

function sucessCallback (url, result, data, auto, cb) {
  data.errorIndex = 0

  const continueGetSource = () => {
    if (data.transferCompleted) return
    ajax(url, cb, auto, data)
  }

  if (data.transmitted >= data.total) {
    data.transferCompleted = true
  }

  // start callback
  if (data.successIndex === 0 && typeof ajax.start === 'function') {
    ajax.start(result)
  }
  // add index
  data.successIndex++
  
  if (typeof cb === 'function') {
    if (data.total) {
      callFunc(
        cb, 'success', result, 
        auto
          ? EMPTY
          : continueGetSource
      )
    } else {
      callFunc(cb, 'error', 'Can\'t get resource size.')
    }
  }

  // transfer resouce end callback
  if (data.transferCompleted && typeof ajax.end === 'function') {
    ajax.end(result)
  }
  auto && setTimeout(continueGetSource, ajax._time)
}

function errorCallback (url, error, data, auto, cb) {
  data.errorIndex++
  if (data.errorIndex > ajax._repeatConnect) {
    cb(error, null, EMPTY)
    return 
  }

  // if can't get resource, repeat send request
  setTimeout(() => {
    ajax(url, cb, auto, data)
  }, ajax._time)
}

function getSourcePosition ({ successIndex, transmitted, total }) {
  let end, start = transmitted

  if (successIndex === 0) {
    end = 1
  } else {
    // there should be a resource size
    if (!total) return null
    const result = start + ajax._partical

    end = result > total
      ? total
      : result
  }

  return { start, end }
}

function getSourceSize (xhr) {
  const size = xhr.getResponseHeader('Content-Length')
  if (!size) return null

  const total = Number(size.trim())
  return isNaN(total)
    ? null
    : total
}

function setHeader (xhr, start, end) {
  const value = `bytes=${start}-${end}`
  xhr.setRequestHeader('Range', value)
}

function callFunc (cb, type, result, continueCb) {
  if (type === 'error') {
    if (typeof cb === 'function') {
      cb(result, null, EMPTY)
    } else {
      throw new Error(result)
    }
  } else if (type === 'success') {
    typeof cb === 'function' && cb(null, result, continueCb)
  }
}