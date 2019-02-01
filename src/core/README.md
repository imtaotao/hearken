## hearken buffersource 模式
对于小于 45s 的音频，应该使用此模式进行解码播放，并且允许同时播放多个声音，并能够单独控制

## hearken 使用
hearken 构造函数为一个父级的控制器，他能够控制所有子音频控制器
```js
  const options = {
    rate: 1, // 播放速度，默认 1
    delay: 0, // 延时播放时间，默认 0
    volume: 1, // 声音音量，默认 1
    fftSize: 16, // 傅里叶变化参数，应该为 2 的 n 次方，默认 16
    mute: false, // 是否静音，默认 false
    loop: false, // 是否循环播放，默认 false
  }
  const h = new Hearken(options) // 此时的 option 为所有声音的 option

  // 创建两个声音控制器
  const ctr1 = h.create()
  let ctr2

  fetch('xx.wav').then(res => {
    const buffer = res.arrayBuffer()
    ctr1.replaceBuffer(buffer)
  })

  fetch('xx.wav').then(res => {
    const buffer = res.arrayBuffer()
    ctr2 = h.create(buffer)
  })
```

## hearken API
后面实例，所有父控制器用 h 变量代替，子控制器用 ctr 变量代替

### create
create 方法能够创建一个子声音控制器，这个字声音控制器能够更精确的控制声音
```js
  const h = new Hearken()

  // buffer 为音频数据，他必须为 arraybuffer 或者 audiobuffer
  // option 为这个音频控制器所独有，他会继承父级的 option
  const ctr = h.create(buffer, options)
```

### play
play 方法能够使所有子音频恢复播放，成功后触发 play 事件。如果子音频没有 start, play 方法则没有效果
```js
  // return 一个 promise
  h.play().then(res => {
    if (res) {
      console.log('恢复播放成功')
    } else {
      console.error('恢复播放失败')
    }
  })
```

### pause
pause 方法与 play 方法相同，在成功暂停后触发 pause 事件，返回一个 promise
```js
  h.pause().then(res => {
    if (res) {
      console.log('暂停播放成功')
    } else {
      console.error('暂停播放失败')
    }
  }
```

### each
each 方法能够遍历所有子音频控制器
```js
  h.each(child => {
    // child 为自控制，可以对子实例进行控制
  })
```

### setVolume
setVolume 方法对所有音频进行控制，第二个参数为判断函数，可以为空，它接收一个子控制器，如果返回的是 false, 将不会对这个子控制器进行操作
```js
  h.setVolume(number, child => {
    return false
  })
```

### setMute
setMute 控制所有子音频控制器是否静音
```js
  h.setMute(boolean, child => {
    // ...
  })
```

### ready
ready 将 AudioCtx.state 改变为 running 后调用回调，他会影响所有的子音频实例
```js
  h.ready(() => {
    // ...
  })
```


## 子音频控制器 API