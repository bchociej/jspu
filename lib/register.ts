import ClockedBusDevice from './clocked-bus-device'
import Signal from './signal'

class Register extends ClockedBusDevice {
  constructor(clock: Signal, width: number = 8) {
    super(clock, width)
    this.addPort('input')
    this.addPort('output')
  }

  protected onLatched() {
    this.portDescriptors.forEach(({ port, setValue }) => setValue(port.read()))
  }
}

export default Register
