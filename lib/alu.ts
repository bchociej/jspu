import ClockedBusDevice from './clocked-bus-device'
import Signal from './signal'

class ALU extends ClockedBusDevice {
  constructor(clock: Signal, width: number = 8) {
    super(clock, width)
    this.addPort('a')
    this.addPort('b')
    this.addPort('x')
  }
  protected onLatched() {}
}

export default ALU
