export default function setHooks (HearkenProto) {
  const hooks = HearkenProto.hooks = Object.create(null)

  hooks.play = () => {}
  hooks.pause = () => {}
  hooks.stopPlay = () => {}
  hooks.playOver = () => {}
  hooks.decodeOver = () => {}
  hooks.loopOnceOver = () => {}

  // partical hooks
  hooks.loading = () => {}
  hooks.appendNewSource = () => {}
}