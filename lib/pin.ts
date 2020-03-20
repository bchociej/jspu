import { EventEmitter } from 'events'
import { SignalValue } from './types'
import Wire from './wire'

type PinWriter = (value: SignalValue) => void

class Pin extends EventEmitter {
  protected value: SignalValue
  private wire?: Wire
  private wireListener?: (value: SignalValue) => void
  private outputWriter?: PinWriter = (value: SignalValue) => this.setValue(value)

  constructor() {
    super()
    this.value = SignalValue.HI_Z
  }

  protected setValue(value: SignalValue) {
    if (value !== this.value) {
      this.emit('change', value)
    }
    this.value = value
  }

  getOutputWriter(): PinWriter {
    const writer = this.outputWriter
    if (writer) {
      delete this.outputWriter
      return writer
    }
    throw new Error('writer has already been claimed')
  }

  read(): SignalValue {
    return this.value
  }

  setWire(wire: Wire) {
    if (this.wire) {
      throw new Error('wire has already been set')
    }
    this.wire = wire
    this.wireListener = (value: SignalValue) => this.setValue(value)
    this.wire.on('change', this.wireListener)
  }
}

export default Pin
export { PinWriter }
