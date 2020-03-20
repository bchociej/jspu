import { EventEmitter } from 'events'

type UniversalEventListener = (name: string | symbol, ...args: any[]) => void

class UniversalEmitter extends EventEmitter {
  private universalListeners: UniversalEventListener[] = []

  emit(name: string | symbol, ...args: any[]): boolean {
    this.universalListeners.forEach(listener => listener(name, ...args))
    return super.emit(name, ...args)
  }

  onAny(listener: UniversalEventListener) {
    this.universalListeners.push(listener)
  }

  offAny(listener: UniversalEventListener) {
    this.universalListeners = this.universalListeners.filter(l => l !== listener)
  }

  pipeEvents(emitter: EventEmitter) {
    this.onAny((name, ...args) => emitter.emit(name, ...args))
  }

  relay(emitter: UniversalEmitter) {
    emitter.pipeEvents(this)
  }
}

export default UniversalEmitter
