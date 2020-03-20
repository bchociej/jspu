import { SignalValue } from './types'
import UniversalEmitter from './universal-emitter'

class Signal extends UniversalEmitter {
  private value: SignalValue = SignalValue.FLOATING

  set(value: SignalValue) {
    if (this.isOff() && value === SignalValue.ON) {
      this.emit('rising')
    } else if (this.isOn() && value === SignalValue.OFF) {
      this.emit('falling')
    }
    if (value !== this.value) {
      this.emit('change', value)
    }
    this.value = value
  }

  get() {
    return this.value
  }

  isOn() {
    return this.value === SignalValue.ON
  }

  isOff() {
    return this.value === SignalValue.OFF
  }

  goOn() {
    this.set(SignalValue.ON)
  }

  goOff() {
    this.set(SignalValue.OFF)
  }

  flip() {
    if (this.isOn()) {
      this.goOff()
    } else {
      this.goOn()
    }
  }
}

class ReadOnlySignal extends Signal {
  private readonly signal: Signal

  constructor(signal: Signal) {
    super()
    this.signal = signal
    this.relay(this.signal)
  }

  get() {
    return this.signal.get()
  }

  isOn() {
    return this.signal.isOn()
  }

  ifOff() {
    return this.signal.isOff()
  }
}

export default Signal
export { ReadOnlySignal }
