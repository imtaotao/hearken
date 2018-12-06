/**
 * Hearken test server.
 * */

const fs = require('fs')
const url = require('url')
const path = require('path')
const http = require('http')

const basePath = './dev/music'
const port = 3000

// some default mimes
const mimeNames = {
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.ogg': 'application/ogg', 
  '.ogv': 'video/ogg', 
  '.oga': 'audio/ogg',
  '.txt': 'text/plain',
  '.wav': 'audio/x-wav',
  '.webm': 'video/webm',
}

http.createServer(serverBody).listen(port, () => {
  console.log(`http://localhost:${port}`)
})

function serverBody (req, res) {
  cors(req, res)

  // get complete music source
  get(req, res, '/getMusic', data => {
    if (typeof data.name === 'string') {
      sendCompleteSource(res, data.name.trim())
    }
  })

  // partical music source
  get(req, res, '/getParticalMusic', data => {
    if (typeof data.name === 'string') {
      sendParticalSource(req, res, data.name.trim())
    }
  })
}

function notFound (res) {
  res.writeHead(404, {'Content-Type' : 'text/html;charset=UTF-8'})
  res.end("<h1>Not found.</h1>")
}

let called = false

function sendOnce (res, code, content, headers) {
  setTimeout(() => {
    if (called) return

    res.writeHead(code, headers)
    res.end(content)

    called = true
    setTimeout(() => called = false)
  })
}

function get (req, res, path, cb) {
  let { url:reqUrl, method } = req
  method = method.toLocaleLowerCase()

  if (method === 'get') {
    const { query, pathname } = url.parse(reqUrl, true)
    if (pathname === path) {
      typeof cb === 'function' && cb(query)
    }
  } else if (method === 'options') {
    // not content
    // because it's cors, don't need "Allow" header
    sendOnce(res, 204)
  } else {
    // this is just a test server, so we ignored the "HEAD" method
    sendOnce(res, 405, '<h1>Method Not Allowed.</h1>', {'Allow': 'GET, OPTIONS'})
  }
}

// set cors
function cors (req, res) {
  const origin = req.headers.origin || req.headers.Origin

  if (origin) {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Range')
    res.setHeader('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.setHeader('Access-Control-Expose-Headers', 'content-range')
    res.setHeader('Content-Type', 'application/json;charset=utf-8')
  }
}

function getFileNameAndType (name) {
  const type = path.extname(name)

  if (type) {
    return {
      type,
      fileName: name,
    }
  }
  return {
    type: '.mp3',
    fileName: name + '.mp3',
  }
}

// get complete music source
function sendCompleteSource (res, name) {
  const { type, fileName } = getFileNameAndType(name)
  const sourcePath = path.resolve(basePath, fileName)

  if (fs.existsSync(sourcePath)) {
    // create reade stream
    const readStream = fs.createReadStream(sourcePath)
    res.writeHead(200, {'Content-type': mimeNames[type]})
    readStream.on('open', () => readStream.pipe(res))
  } else {
    notFound(res)
  }
}

// allow pass 206 transfer data
function sendParticalSource (req, res, name) {
  const { type, fileName } = getFileNameAndType(name)
  const sourcePath = path.resolve(basePath, fileName)

  if (fs.existsSync(sourcePath)) {
    // we need partical source range, if not, we will return complete file
    const range = req.headers['range'] || req.headers['Range']
    range != null
      ? sendSourceContent(res, range, type, sourcePath)
      : sendCompleteSource(res, name)
  } else {
    notFound(res)
  }
}

function sendSourceContent (res, range, type, sourcePath) {
  const parseRange = total => {
    const postions = range.split(/bytes=([0-9]*)-([0-9]*)/)
    let start = parseInt(postions[1])
    let end = parseInt(postions[2])

    if (!isNaN(start) && isNaN(end)) {
      end = total - 1
    }
    if (isNaN(start) && !isNaN(end)) {
      start = total - end
      end = total - 1
    }

    return { start, end }
  }

  const itsWithInRange = (start, end, total) => {
    if ((start < 0 || start > total) ||
        (end < 0 || end > total)) return false
    return true
  }

  fs.stat(sourcePath, (error, {size}) => {
    if (error) {
      res.writeHead(500)
      res.end('<h1>Internal Server Error.</h1>')
      return
    }
    
    const { start, end } = parseRange(size)

    // if range is normal, return the corresponding resource
    if (itsWithInRange(start, end, size)) {
      setParticalHeader(res, start, end, size, type)

      const readStream = fs.createReadStream(sourcePath, {start, end})
      readStream.on('open', () => readStream.pipe(res))
    } else {
      // throw 416
      res.writeHead(416)
      res.end('<h1>Requested Range Not Satisfiable.</h1>')
    }
  })
}

function setParticalHeader (res, start, end, total, type) {
  res.writeHead(206, {
    'Connection': 'keep-alive',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'Accept-Ranges',
    'Content-Type': mimeNames[type],
    'Content-Range': `bytes ${start}-${end}/${total}`,
    'Content-Length': start == end ? 0 : (end - start),
  })
}