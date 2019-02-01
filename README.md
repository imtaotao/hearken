一个基于 webaudio 的音频库<br>
[![NPM version][npm-image]][npm-url]

## 介绍
hearken 对 webaudio 的一系列 api 进行了封装，大大简化了使用 webaudio 的门槛，其内部集成了一些常用的 audioNode，所以在使用时，会有重型的对象产生。hearken 包含三个核心功能：
1. 通过 buffersouce node 进行音频处理的模块
2. 通过 mediaElementSource 进行音频处理的模块
3. 录音模块

## 简单例子
```js
import pitchShift from 'pitch-shift' // 一个音高转化的外部库
import Hearken, { Pitch } from '@rustle/hearken'

const manager = (new Hearken()).create(null, {
  delay: 1, // 延迟 1s 播放
  loop: true, // 循环播放
})
const pitch = new Pitch(pitchShift)
manager.connect(pitch)

featch('xxx.wav')
.then(res => res.arrayBuffer())
.then(buffer => {
  manager.replaceBuffer(buffer)
  manager.Hearken.ready(() => {
    // manager.start()
    manager.fadeStart(3) // 渐变播放
    setTimeout(() => {
      // 变化音高
      pitch.value = 1.5
    }, 3000)
  })
})

```

<br>

## API
### [buffersouce](./src/core)
### [mediaelement](./src/media)
### [record](./src/record)
<br>

## 工具模块
+ [Pitch](./src/pitch-shift)
+ [Stream](./src/media/stream.md)

[npm-image]: https://img.shields.io/npm/v/@rustle/hearken.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@rustle/hearken