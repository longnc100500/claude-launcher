import { EventEmitter } from 'events'

export class MockChildProcess extends EventEmitter {
  readonly pid: number | undefined
  killed = false

  constructor(pid: number | undefined = 12345) {
    super()
    this.pid = pid
  }

  kill(_signal?: string): boolean {
    this.killed = true
    this.emit('exit', 0, null)
    return true
  }

  unref(): void {
    // no-op
  }
}
