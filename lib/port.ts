import Bus, { BusValue, busValueEquals } from './bus'
import { SignalValue } from './types'
import { EventEmitter } from 'events'

type PortWriter = (value: BusValue) => void

class Port extends EventEmitter {
  protected value: BusValue
  private bus?: Bus
  private busListener?: (value: BusValue) => void
  private outputWriter?: PortWriter = (value: BusValue) => this.setValue(value)

  public readonly width: number

  constructor(width: number = 8) {
    super()
    this.width = width
    this.value = new Array<SignalValue>(width).fill(SignalValue.HI_Z)
  }

  protected setValue(value: BusValue) {
    if (!busValueEquals(value, this.value)) {
      this.emit('change', value)
    }
    this.value = value
  }

  getOutputWriter(): PortWriter {
    const writer = this.outputWriter
    if (writer) {
      delete this.outputWriter
      return writer
    }
    throw new Error('writer has already been claimed')
  }

  read(): BusValue {
    return this.value
  }

  setBus(bus: Bus) {
    if (this.bus) {
      throw new Error('bus has already been set')
    }
    this.bus = bus
    this.busListener = (value: BusValue) => this.setValue(value)
    this.bus.on('change', this.busListener)
  }
}

export default Port
export { PortWriter }
