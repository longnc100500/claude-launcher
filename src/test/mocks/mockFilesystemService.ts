import type { IFilesystemService, MkdirOptions, RmOptions } from '../../domain/filesystem'

export class MockFilesystemService implements IFilesystemService {
  private readonly directories = new Set<string>()
  private readonly files = new Map<string, string>()

  async exists(path: string): Promise<boolean> {
    return this.directories.has(path) || this.files.has(path)
  }

  async mkdir(path: string, _options?: MkdirOptions): Promise<void> {
    this.directories.add(path)
  }

  async rm(path: string, options?: RmOptions): Promise<void> {
    if (options?.recursive) {
      // Remove all entries that start with this path
      for (const dir of this.directories) {
        if (dir === path || dir.startsWith(path + '/')) {
          this.directories.delete(dir)
        }
      }
      for (const file of this.files.keys()) {
        if (file === path || file.startsWith(path + '/')) {
          this.files.delete(file)
        }
      }
    } else {
      this.directories.delete(path)
      this.files.delete(path)
    }
  }

  async getDirSize(_path: string): Promise<number> {
    return 0
  }

  async readdir(path: string): Promise<ReadonlyArray<string>> {
    const prefix = path.endsWith('/') ? path : path + '/'
    const entries: string[] = []
    for (const dir of this.directories) {
      if (dir.startsWith(prefix)) {
        const rest = dir.slice(prefix.length)
        if (!rest.includes('/')) {
          entries.push(rest)
        }
      }
    }
    return entries
  }

  // Test helpers
  addDirectory(path: string): void {
    this.directories.add(path)
  }

  addFile(path: string, content = ''): void {
    this.files.set(path, content)
  }

  getDirectories(): ReadonlySet<string> {
    return this.directories
  }

  reset(): void {
    this.directories.clear()
    this.files.clear()
  }
}
