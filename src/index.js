import Hearken from './core'
import Record from './record'
import Pitch from './pitch-shift'
import MediaElement from './media'
import Stream_ from './media/stream'

Hearken.Pitch = Pitch
Hearken.Record = Record
Hearken.Stream = Stream_
Hearken.Media = MediaElement

export default Hearken