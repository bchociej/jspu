import Register from './lib/register'
import Device from './lib/device'
import Bus, { BusValue } from './lib/bus'
import Signal from './lib/signal'

export class AutomaticClock extends Signal {
  constructor(period: number = 1000) {
    super()
    setInterval(() => {
      this.flip()
    }, period / 2)
  }
}

export class DebugClock extends Signal {
  private static serialCounter = 0
  private readonly serial: number
  private tickCount = 0

  constructor() {
    super()
    this.serial = DebugClock.serialCounter++
    process.stdin.on('data', data =>
      this.pulse(
        data
          .toString()
          .split('')
          .filter(x => x === '\n').length
      )
    )
    console.error(`DebugClock #${this.serial} initialized; press enter to pulse`)
  }

  private pulse(times: number): void {
    if (times >= 1) {
      console.error(`DebugClock #${this.serial} pulsing tick #${++this.tickCount}`)
      this.flip()
      process.nextTick(() => {
        this.flip()
        process.nextTick(() => this.pulse(times - 1))
      })
    }
  }
}

class DebugDevice extends Device {
  constructor() {
    super()
    this.addPort('debug')
  }
  set(value: BusValue) {
    this.writePortOutput('debug', value)
  }
}

const mainBus = new Bus()
const clock = new DebugClock()
const debugInput = new DebugDevice()
const registers = {
  a: new Register(clock),
  b: new Register(clock),
}

mainBus.connect(debugInput.getPort('debug'))
mainBus.connect(registers.a.getPort('output'))
mainBus.connect(registers.b.getPort('output'))

mainBus.on('change', value => console.log({ bus: value }))
registers.a.on('change', value => console.log({ register: value }))
registers.b.on('change', value => console.log({ register: value }))
