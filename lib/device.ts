import { EventEmitter } from 'events'
import Port, { PortWriter } from './port'
import { BusValue } from './bus'
import { SignalValue } from './types'

interface PortDescriptor {
  inputEnabled: SignalValue
  outputEnabled: SignalValue
  port: Port
  setValue: PortWriter
}

abstract class Device extends EventEmitter {
  public readonly width: number
  protected portDescriptors = new Map<string, PortDescriptor>()

  constructor(width: number = 8, ports?: Map<string, Port>) {
    super()
    this.width = width
    ports?.forEach((port, name) => this.addPort(name, port))
  }

  protected getPortDescriptor(name: string): PortDescriptor {
    const pd = this.portDescriptors.get(name)
    if (!pd) {
      throw new Error(`bus does not have a port named '${name}'`)
    }
    return pd
  }

  public addPort(name: string, port: Port = new Port(this.width)) {
    if (this.portDescriptors.has(name)) {
      throw new Error(`bus already has a port named '${name}'`)
    }
    this.portDescriptors.set(name, {
      inputEnabled: SignalValue.FLOATING,
      outputEnabled: SignalValue.FLOATING,
      port,
      setValue: port.getOutputWriter(),
    })
  }

  public getPort(name: string) {
    return this.getPortDescriptor(name).port
  }

  public writePortOutput(name: string, value: BusValue): void {
    this.getPortDescriptor(name).setValue(value)
  }
}

export default Device
export { Port }
