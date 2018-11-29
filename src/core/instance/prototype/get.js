export function getState () {
  return this.AudioContext.state
}

export function getCurrentTime () {
  return this.AudioContext.currentTime
}

// get sound visualization data
export function getVisualizerData () {
  const analyser = this.container.analyser
  if (!analyser) return []

  const array = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(array)

  return array
}