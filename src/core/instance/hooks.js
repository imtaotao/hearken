export default function setHooks (HearkenProto) {
  const hooks = HearkenProto.hooks = Object.create(null)

  hooks.play = null
  hooks.stop = null
  hooks.start = null
  hooks.pause = null
  hooks.playEnd = null
  hooks.decodeEnd = null
  hooks.loopOnceEnd = null

  // partical hooks
  hooks.loading = null
  hooks.appendNewSource = null
}