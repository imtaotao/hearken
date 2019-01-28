import Hearken from './core'
import Record from './record'
import Pitch from './pitch-shift'
import MediaElement from './media'
import Stream from './media/stream'

Hearken.Pitch = Pitch
Hearken.Record = Record
Hearken.Stream = Stream
Hearken.Media = MediaElement

export {
  Pitch,
  Record,
  Stream,
  Hearken as default,
  MediaElement as Media,
}