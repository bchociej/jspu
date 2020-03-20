import Signal, { ReadOnlySignal } from './signal'
import Pin from './pin'
import { SignalValue } from './types'
import UniversalEmitter from './universal-emitter'

type PinListener = (value: SignalValue) => void
type WireWriter = (value: SignalValue) => void

const combineSignalValues = (a: SignalValue, b: SignalValue): SignalValue => {
  if (a === SignalValue.HI_Z) return b
  if (b === SignalValue.HI_Z) return a
  return a === b ? a : SignalValue.INVALID
}

class Wire extends UniversalEmitter {
  private readonly signal: Signal
  private readonly assertions = new Map<Pin, SignalValue>()
  private readonly devices = new Map<Pin, PinListener>()

  static useWire(): { wire: Wire; write: WireWriter } {
    const wire = new Wire()
    const write = (value: SignalValue) => wire.signal.set(value)
    return { wire, write }
  }

  constructor() {
    super()
    this.signal = new Signal()
    this.relay(this.signal)
  }

  private addAssertion(pin: Pin, value: SignalValue) {
    this.assertions.set(pin, value)
    this.processAssertions()
  }

  private attachListener(pin: Pin): PinListener {
    this.addAssertion(pin, pin.read())
    const onAssert = (value: SignalValue) => this.addAssertion(pin, value)
    pin.on('change', onAssert)
    return onAssert
  }

  private processAssertions() {
    let result = SignalValue.HI_Z
    for (const value of this.assertions.values()) {
      result = combineSignalValues(result, value)
    }
    this.signal.set(result)
  }

  connect(pin: Pin) {
    pin.setWire(this)
    this.devices.set(pin, this.attachListener(pin))
  }

  getSignal(): ReadOnlySignal {
    return new ReadOnlySignal(this.signal)
  }

  getValue(): SignalValue {
    return this.signal.get()
  }
}

export default Wire
export { WireWriter, combineSignalValues }
