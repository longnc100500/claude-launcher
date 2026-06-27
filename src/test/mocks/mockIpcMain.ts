type Handler = (event: Record<string, never>, ...args: unknown[]) => Promise<unknown>

export class MockIpcMain {
  private readonly handlers = new Map<string, Handler>()

  handle(channel: string, handler: Handler): void {
    this.handlers.set(channel, handler)
  }

  async invoke(channel: string, ...args: unknown[]): Promise<unknown> {
    const handler = this.handlers.get(channel)
    if (!handler) throw new Error(`No handler registered for channel: ${channel}`)
    return handler({} as Record<string, never>, ...args)
  }

  hasHandler(channel: string): boolean {
    return this.handlers.has(channel)
  }
}
