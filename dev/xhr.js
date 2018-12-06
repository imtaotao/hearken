const PARTICAL = 1024 * 1024
const EMPTY = () => {}

ajax._time = 500
ajax._repeatConnect = 10

export default function ajax (url, cb, auto, data) {
  // record success times and repeat connect times
  if (!data) {
    data = {
      total: null,
      errorIndex: 0,
      transmitted: 0,
      successIndex: 0,
      transferCompleted: false,
    }
  }
  
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
    const header = xhr.getAllResponseHeaders()
    sucessCallback(url, e.target, header, data, auto, cb)
  }
  xhr.onerror = e => errorCallback(url, e.target, data, auto, cb)

  xhr.send()
}

function sucessCallback (url, result, header, data, auto, cb) {
  data.errorIndex = 0

  const continueGetSource = () => {
    if (data.transferCompleted) return
    ajax(url, cb, auto, data)
  }

  

  if (data.successIndex === 0) {
    let total = Number(getSourceSize(header))
    total = isNaN(total) ? null : total

    if (!total) {
      callFunc(cb, 'error', 'Can\'t get resource size.')
      return
    }
    data.total = total
  } else if (data.transmitted >= data.total) {
    data.transferCompleted = true
  }
  
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

  data.successIndex++
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
    const result = start + PARTICAL

    end = result > total
      ? total
      : result
  }

  return { start, end }
}

function getSourceSize (headers) {
  if (!headers) return null

  headers = headers.split('\n')
  
  for (let i = 0, len = headers.length; i < len; i++) {
    const header = headers[i]

    if (header) {
      let [key, value] = header.split(':')
      if (key = key.trim()) {
        if (key.toLocaleLowerCase() === 'content-range') {
          // get total size
          return value.split('/')[1]
        }
      }
    }
  }
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