import { SignalValue } from './types'
import { Port } from './device'
import Wire, { combineSignalValues, WireWriter } from './wire'
import UniversalEmitter from './universal-emitter'
import { ReadOnlySignal } from './signal'

type BusValue = Array<SignalValue>
type PortListener = (value: BusValue) => void

const busValueEquals = (a: BusValue, b: BusValue): boolean => {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

const combineBusValues = (values: IterableIterator<BusValue>, width: number): BusValue => {
  let result = new Array<SignalValue>(width).fill(SignalValue.HI_Z)
  for (const value of values) {
    result.forEach((bit, position) => {
      result[position] = combineSignalValues(bit, value[position] ?? SignalValue.HI_Z)
    })
  }
  return result
}

class Bus extends UniversalEmitter {
  private readonly wires: Array<{ wire: Wire; write: WireWriter }>
  private readonly assertions = new Map<Port, BusValue>()
  private readonly devices = new Map<Port, PortListener>()

  constructor(width: number = 8) {
    super()
    this.wires = new Array(width).map(() => Wire.useWire())
    this.wires.forEach(({ wire }) => wire.on('change', () => this.emit('change', this.getValue())))
  }

  private addAssertion(port: Port, value: BusValue) {
    this.assertions.set(port, value)
    this.processAssertions()
  }

  private attachListener(port: Port): PortListener {
    this.addAssertion(port, port.read())
    const onAssert = (value: BusValue) => this.addAssertion(port, value)
    port.on('change', onAssert)
    return onAssert
  }

  private processAssertions() {
    this.setBusValue(combineBusValues(this.assertions.values(), this.wires.length))
  }

  private setBusValue(value: BusValue) {
    value.forEach((bit, index) => this.wires[index].write(bit))
  }

  connect(port: Port) {
    port.setBus(this)
    this.devices.set(port, this.attachListener(port))
  }

  getSignals(): ReadOnlySignal[] {
    return this.wires.map(({ wire }) => wire.getSignal())
  }

  getValue(): BusValue {
    return this.wires.map(({ wire }) => wire.getValue())
  }
}

export default Bus
export { BusValue, busValueEquals }
