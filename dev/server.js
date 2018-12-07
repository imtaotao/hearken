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
  defineInterface(req, res, '/getMusic', data => {
    if (typeof data.name === 'string') {
      sendCompleteSource(res, data.name.trim())
    }
  })

  // partical music source
  defineInterface(req, res, '/getParticalMusic', data => {
    if (typeof data.name === 'string') {
      sendParticalSource(req, res, data.name.trim())
    }
  })
}

function notFound (res) {
  res.writeHead(404, {'Content-Type' : 'text/html;charset=UTF-8'})
  res.end("<h1>Not found.</h1>")
}

function defineInterface (req, res, path, cb) {
  const { query, pathname } = url.parse(req.url, true)
  const method = req.method.toLocaleLowerCase()
  const isLegal = expectMethod => {
    return pathname === path && expectMethod === method
  }
  
  if (isLegal('get')) {
    typeof cb === 'function' && cb(query)

  } else if (isLegal('head')) {
    sendHeadRequest(res, query.name.trim())

  } else if (isLegal('options')) {
    // not content
    // because it's cors, don't need "Allow" header
    res.writeHead(204)
    res.end()

  } else if (pathname === path) {
    res.writeHead(405, {'Allow': 'GET, HEAD, OPTIONS'})
    res.end('<h1>Method Not Allowed.</h1>')
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

function sendHeadRequest (res, name) {
  if (!name) {
    notFound(res)
    return
  }

  const { type, fileName } = getFileNameAndType(name)
  const sourcePath = path.resolve(basePath, fileName)

  if (fs.existsSync(sourcePath)) {
    fs.stat(sourcePath, (error, stat) => {
      if (error) {
        res.writeHead(500)
        res.end('<h1>Internal Server Error.</h1>')
        return
      }

      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': mimeNames[type],
      })
      res.end()
    })
  } else {
    notFound(res)
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
    if (
        (start < 0 || start > total) ||
        (end < 0 || end > total) ||
        (start > end)
    ) return false

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

// set cors
function cors (req, res) {
  const origin = req.headers.origin || req.headers.Origin

  if (origin) {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Range')
    res.setHeader('Access-Control-Allow-Methods', 'PUT,POST,HEAD,GET,DELETE,OPTIONS')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range,Content-Length')
    res.setHeader('Content-Type', 'application/json;charset=utf-8')
  }
}