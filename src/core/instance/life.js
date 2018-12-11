export default function setHooks (HearkenProto) {
  const life = HearkenProto.life = Object.create(null)

  life.play = null
  life.stop = null
  life.start = null
  life.pause = null
  life.playEnd = null
  life.decodeEnd = null
  life.loopOnceEnd = null

  // partical hooks
  life.loading = null
  life.appendNewSource = null
}