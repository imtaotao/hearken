export default function setHooks (HearkenProto) {
  const hooks = HearkenProto.hooks = Object.create(null)

  hooks.play = () => {}
  hooks.start = () => {}
  hooks.pause = () => {}
  hooks.playPause = () => {}
  hooks.playEnd = () => {}
  hooks.decodeEnd = () => {}
  hooks.loopOnceEnd = () => {}

  // partical hooks
  hooks.loading = () => {}
  hooks.appendNewSource = () => {}
}