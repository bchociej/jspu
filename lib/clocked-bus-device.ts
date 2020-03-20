import Device from './device'
import Signal from './signal'

abstract class ClockedBusDevice extends Device {
  protected abstract onLatched(): void

  constructor(clock: Signal, width: number = 8) {
    super(width)
    clock.on('rising', () => this.onLatched())
  }
}

export default ClockedBusDevice
