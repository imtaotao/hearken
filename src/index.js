import Hearken from './core'
import Pitch from './pitch-shift'
import MediaElement from './media'
import Stream_ from './media/stream'

Hearken.Pitch = Pitch
Hearken.Stream = Stream_
Hearken.Media = MediaElement

export default Hearken